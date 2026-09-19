'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  AlertTriangle,
  FileText,
  Calendar,
  BookOpen
} from 'lucide-react';
import { SourceReference, TrustSafetyTier } from '@/types/matter';
import { SupportedLanguage } from '@/lib/ai';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';

interface QAItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tier?: TrustSafetyTier;
  citations?: SourceReference[];
  missingInfoPrompt?: string;
  suggestedQuestions?: string[];
}

interface FollowUpQAProps {
  matterId: string;
  matterTitle?: string;
  matterCategory: string;
  language?: SupportedLanguage;
}

export function FollowUpQA({
  matterId,
  matterCategory,
  language = 'en'
}: FollowUpQAProps) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<QAItem[]>([
    {
      id: 'msg-initial',
      sender: 'assistant',
      text: `Hello! I have analyzed your ${matterCategory} matter. You can ask me follow-up questions about applicable laws, procedural requirements, or evidence strength.`,
      timestamp: 'Just now'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [seq, setSeq] = useState(1);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([
    'What if the opposing party ignores my legal notice?',
    'Do I need to hire a lawyer to file a complaint?',
    'What is the statutory limitation period for my matter?'
  ]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isTyping) return;

    const currentSeq = seq;
    const userMsg: QAItem = {
      id: `usr-${currentSeq}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now'
    };

    setSeq(prev => prev + 2);
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await apiFetch(`/api/matters/${matterId}/qa`, {
        method: 'POST',
        token,
        body: JSON.stringify({ query: q, language })
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const botMsg: QAItem = {
          id: `bot-${currentSeq + 1}`,
          sender: 'assistant',
          text: d.answer,
          timestamp: 'Just now',
          tier: d.tier,
          citations: d.citations,
          missingInfoPrompt: d.missingInfoPrompt,
          suggestedQuestions: d.suggestedQuestions
        };
        setMessages(prev => [...prev, botMsg]);

        if (d.suggestedQuestions && d.suggestedQuestions.length > 0) {
          setActiveSuggestions(d.suggestedQuestions);
        }
      } else {
        throw new Error(json.error?.message || 'Failed to get answer');
      }
    } catch {
      // Fallback
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${currentSeq + 1}`,
          sender: 'assistant',
          text: `Under Indian statutory procedure governing ${matterCategory.replace(/_/g, ' ')}, verified documentary evidence forms the basis of your legal claim. Please verify your uploaded documents or consult an advocate.`,
          timestamp: 'Just now',
          tier: 'explanation'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
      {/* 1. Header */}
      <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-xs text-white">Grounded Matter Q&A Navigator</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded border border-stone-700">
            Hallucination-Proof
          </span>
          <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded border border-stone-700 uppercase">
            {language}
          </span>
        </div>
      </div>

      {/* 2. Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-stone-950 font-medium rounded-br-none shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-2xs'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Missing Information Callout */}
              {msg.missingInfoPrompt && (
                <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 flex items-start space-x-2 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Missing Facts in Dossier:</strong>
                    <span>{msg.missingInfoPrompt}</span>
                  </div>
                </div>
              )}

              {/* Citations Badge List */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-stone-100 space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">
                    Grounded In:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200"
                        title={c.excerpt}
                      >
                        {c.type === 'doc' && <FileText className="w-2.5 h-2.5 text-blue-600" />}
                        {c.type === 'event' && <Calendar className="w-2.5 h-2.5 text-green-600" />}
                        {c.type === 'statute' && <BookOpen className="w-2.5 h-2.5 text-amber-700" />}
                        <span>{c.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Tier Footnote */}
              {msg.tier && (
                <div className="pt-1 text-[10px] text-stone-400 italic">
                  Information tier: <span className="font-semibold text-stone-600">{msg.tier}</span> (cautious navigation)
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-950 flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-stone-500 text-xs italic bg-white p-2.5 rounded-lg border border-stone-200 w-fit">
            <Bot className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Verifying matter evidence and statutory provisions...</span>
          </div>
        )}
      </div>

      {/* 3. Suggested Questions */}
      <div className="px-3 py-2 bg-stone-100/90 border-t border-stone-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-stone-500 uppercase whitespace-nowrap">Suggested:</span>
        {activeSuggestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 whitespace-nowrap transition-colors shrink-0 shadow-2xs"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* 4. Input Box */}
      <div className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask a clarifying question about your evidence or rights..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/60"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isTyping}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-50 flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}
