import React from 'react';
import { Scale, ExternalLink, ShieldCheck, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer role="contentinfo" aria-label="Site Footer" className="bg-[#0A0A0A] text-stone-300 border-t-2 border-stone-800 mt-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Gazette Masthead Section */}
        <div className="border-b border-stone-800 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-rose-600 text-white flex items-center justify-center font-bold">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight text-white uppercase font-sans">
                NyaySaathi
              </span>
              <span className="font-mono text-xs text-rose-500 uppercase tracking-widest">
                {'//'} INDIA LEGAL ACTION DOSSIER
              </span>
            </div>
            <p className="text-xs text-stone-400 font-mono max-w-xl leading-relaxed uppercase">
              Matter-Based Legal Action Navigator for the Republic of India. Structured evidence gathering, limitation time-bars, and advocate case preparation.
            </p>
          </div>
          <div className="font-mono text-xs text-stone-400 border border-stone-800 p-3 bg-stone-950">
            <div>JURISDICTION: INDIAN CONTRACT ACT, RENT ACTS, BNS &amp; CPA</div>
            <div className="text-rose-400">REGULATORY STANDARD: ADVOCATES ACT 1961 COMPLIANT</div>
          </div>
        </div>

        {/* 4-Column Grid with Visible Borders */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
          {/* Col 1: System Information */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-white uppercase tracking-wider text-[11px] border-b border-stone-800 pb-1.5">
              01 // CORE SYSTEM
            </h4>
            <p className="text-stone-400 leading-relaxed">
              NyaySaathi does not practice law or act as an AI lawyer. It functions as a structured procedural intelligence system that converts citizen grievances into verifiable legal dossiers.
            </p>
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>STRICT EVIDENCE PROVENANCE</span>
            </div>
          </div>

          {/* Col 2: The 5-Stage Navigator */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-white uppercase tracking-wider text-[11px] border-b border-stone-800 pb-1.5">
              02 // ACTION LOOP
            </h4>
            <ul className="space-y-2 font-mono text-[11px] text-stone-400">
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">§ 01</span>
                <span><strong>Capture:</strong> Evidence &amp; timeline</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">§ 02</span>
                <span><strong>Map:</strong> Facts &amp; causality</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">§ 03</span>
                <span><strong>Assess:</strong> Limitation deadlines</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">§ 04</span>
                <span><strong>Draft:</strong> Pre-litigation notices</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-rose-500 font-bold">§ 05</span>
                <span><strong>Escalate:</strong> DLSA &amp; Advocate Pack</span>
              </li>
              <li className="pt-1">
                <a href="/analytics" className="text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1">
                  <span>→ View Pilot Telemetry &amp; Recovery</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-white uppercase tracking-wider text-[11px] border-b border-stone-800 pb-1.5">
              03 // OFFICIAL PORTALS
            </h4>
            <ul className="space-y-2 text-stone-400 font-mono text-[11px]">
              <li>
                <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>e-Daakhil Consumer Commission</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>NALSA Legal Services (15100)</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>Cyber Crime Portal (1930)</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
              <li>
                <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>National Consumer Helpline (1915)</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Statutory Legal Disclaimer & Contact */}
          <div className="space-y-3">
            <h4 className="font-mono font-bold text-white uppercase tracking-wider text-[11px] border-b border-stone-800 pb-1.5">
              04 // STATUTORY NOTICE
            </h4>
            <p className="text-[11px] text-stone-400 leading-relaxed bg-stone-950 p-3 border border-stone-800">
              NyaySaathi is an informational case preparation system under the Advocates Act 1961. It does not provide legal representation or practice law. Consult an enrolled Advocate or visit a DLSA center for formal court representation.
            </p>
            <div className="font-mono text-[11px] text-stone-400 space-y-1 pt-1">
              <p className="text-white font-bold">NyaySaathi Legal Tech Initiatives</p>
              <p className="flex items-start gap-1">
                <MapPin className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
                <span>#42, 4th Block, Koramangala, Bengaluru, KA 560034</span>
              </p>
              <p className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                <a href="mailto:support@nyaysaathi.in" className="text-rose-400 hover:underline">support@nyaysaathi.in</a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-stone-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} NYAYSAATHI INDIA.</span>
            <span>/</span>
            <a href="/privacy" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              PRIVACY POLICY (DPDPA 2023)
            </a>
            <span>/</span>
            <a href="/terms" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              TERMS OF SERVICE
            </a>
            <span>/</span>
            <a href="/pilot" className="hover:text-white transition-colors underline-offset-2 hover:underline">
              PILOT PROGRAM
            </a>
          </div>
          <p className="text-stone-400 uppercase tracking-widest text-[10px]">
            REPUBLIC OF INDIA {'//'} VERIFIED LEGAL DOSSIER
          </p>
        </div>
      </div>
    </footer>
  );
}
