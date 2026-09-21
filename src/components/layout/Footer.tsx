import React from 'react';
import { ShieldCheck, Scale, ExternalLink, HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                <Scale className="w-4 h-4 text-stone-950" />
              </div>
              <span className="font-bold text-lg text-white">NyaySaathi</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              India&apos;s matter-based Legal Action Navigator. Empowering citizens and small businesses to organize their legal situations, prepare evidence, draft notices, and access justice.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Built on Trust & Safety Principles</span>
            </div>
          </div>

          {/* Col 2: The Action Loop */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">The 5-Stage Navigator</h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-stone-800 text-amber-400 text-[10px] flex items-center justify-center font-bold">1</span>
                <span><strong>Capture:</strong> Story narrative & evidence</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-stone-800 text-amber-400 text-[10px] flex items-center justify-center font-bold">2</span>
                <span><strong>Understand:</strong> Facts & timeline mapping</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-stone-800 text-amber-400 text-[10px] flex items-center justify-center font-bold">3</span>
                <span><strong>Assess:</strong> Risks & limitation time-bars</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-stone-800 text-amber-400 text-[10px] flex items-center justify-center font-bold">4</span>
                <span><strong>Act:</strong> Legal notices & complaints</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-stone-800 text-amber-400 text-[10px] flex items-center justify-center font-bold">5</span>
                <span><strong>Escalate:</strong> DLSA, e-Daakhil & Advocates</span>
              </li>
              <li className="pt-1">
                <a href="/analytics" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1">
                  <span>→ View Pilot Analytics & Recovery</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Government Portals & Free Helplines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">Official Indian Portals</h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>e-Daakhil Consumer Commission</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>NALSA Legal Services Authority (15100)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>National Cyber Crime Portal (1930)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>National Consumer Helpline (1915)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Statutory Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <HeartHandshake className="w-4 h-4" />
              <span>Important Disclaimer</span>
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed bg-stone-800/60 p-3 rounded-lg border border-stone-700/60">
              NyaySaathi is an informational navigation and case preparation system under the Advocates Act 1961. It does not provide legal representation or practice law. Consult an enrolled Advocate or DLSA for court representation.
            </p>
            <div className="pt-2 text-[11px] text-stone-400 space-y-1">
              <p className="text-stone-300 font-medium">NyaySaathi Legal Tech Initiatives</p>
              <p>#42, 4th Cross, 80 Feet Rd, 4th Block, Koramangala, Bengaluru, KA 560034</p>
              <p>Email: <a href="mailto:support@nyaysaathi.in" className="text-amber-400 hover:underline">support@nyaysaathi.in</a></p>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex flex-wrap items-center gap-4 text-stone-400">
            <p>© {new Date().getFullYear()} NyaySaathi India. All rights reserved.</p>
            <span>•</span>
            <a href="/privacy" className="hover:text-amber-400 transition-colors underline-offset-2 hover:underline">
              Privacy Policy (DPDPA 2023)
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-amber-400 transition-colors underline-offset-2 hover:underline">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/pilot" className="hover:text-amber-400 transition-colors underline-offset-2 hover:underline">
              Pilot Program
            </a>
          </div>
          <p className="text-stone-400">Designed for Indian Jurisdiction & Statutory Frameworks</p>
        </div>
      </div>
    </footer>
  );
}
