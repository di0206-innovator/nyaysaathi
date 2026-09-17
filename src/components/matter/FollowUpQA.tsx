'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  User
} from 'lucide-react';

interface QAItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tier?: 'explanation' | 'possibility' | 'counsel_required';
}

interface FollowUpQAProps {
  matterTitle?: string;
  matterCategory: string;
}

export function FollowUpQA({ matterCategory }: FollowUpQAProps) {
  const [messages, setMessages] = useState<QAItem[]>([
    {
      id: 'msg-initial',
      sender: 'assistant',
      text: `Hello! I have analyzed the facts and documents of your matter. You can ask me clarifying questions about your timeline, Indian legal procedures, or what happens next. (Remember, I provide informational navigation, not formal advocate representation).`,
      timestamp: 'Just now',
      tier: 'explanation'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [seq, setSeq] = useState(1);

  const sampleQuestions = [
    'What if the other party ignores my legal notice?',
    'Do I need to hire a lawyer for e-Daakhil?',
    'What is the standard limitation period under Indian law?'
  ];

  const handleSend = (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

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

    // Simulate guided reasoning response
    setTimeout(() => {
      let reply = '';
      let tier: 'explanation' | 'possibility' | 'counsel_required' = 'explanation';

      if (q.toLowerCase().includes('ignore') || q.toLowerCase().includes('not reply')) {
        reply = `Under Indian practice, if the recipient ignores a registered Speed Post Legal Notice (RPAD) within the 15-day cure period, their non-reply serves as strong circumstantial proof of default. You can then proceed immediately to file a pre-litigation petition with the District Legal Services Authority (DLSA) or lodge an online complaint via e-Daakhil / Small Causes Court with the postal tracking delivery proof.`;
        tier = 'explanation';
      } else if (q.toLowerCase().includes('lawyer') || q.toLowerCase().includes('e-daakhil') || q.toLowerCase().includes('hire')) {
        reply = `For filing complaints on the e-Daakhil consumer commission portal (edaakhil.nic.in), you are legally permitted to file and argue as 'Complainant in Person' without hiring a private advocate. However, if the matter involves complex cross-examination or goes to appeal before the State Commission, having an enrolled Advocate is beneficial.`;
        tier = 'explanation';
      } else {
        reply = `Based on Indian statutory principles governing ${matterCategory.replace(/_/g, ' ')}, documentary evidence (bank transaction IDs, registered agreements, contemporaneous chats) carries prime evidentiary weight under the Bharatiya Sakshya Adhiniyam, 2023. You can review your 1-Page Lawyer Brief to present these structured facts to a legal aid counsel.`;
        tier = 'explanation';
      }

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${currentSeq + 1}`,
          sender: 'assistant',
          text: reply,
          timestamp: 'Just now',
          tier
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-xs text-white">Matter Clarification & Procedural Q&A</h3>
        </div>
        <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded border border-stone-700">
          Guardrailed AI Navigator
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-stone-950 font-medium rounded-br-none shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-2xs'
              }`}
            >
              <p>{msg.text}</p>
              {msg.tier && (
                <div className="mt-1.5 pt-1 border-t border-stone-100 text-[10px] text-stone-500 italic">
                  Information grounded in Indian legal frameworks.
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-stone-400 text-xs italic">
            <Bot className="w-4 h-4 text-amber-600 animate-spin" />
            <span>Consulting statutory knowledge base...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-stone-100/90 border-t border-stone-200 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-stone-500 uppercase whitespace-nowrap">Suggestions:</span>
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 whitespace-nowrap transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask a clarifying question about this matter..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50/60"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isTyping}
          className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-50 flex items-center space-x-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}
