import { BookOpen, ShieldCheck, Scale, Clock, CheckCircle2 } from 'lucide-react';

export function GenerativeKnowledgeRegistry() {
  const statutoryFrameworks = [
    {
      act: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
      applicableSections: '§316 (Criminal Breach of Trust), §318 (Cheating), §61 (Criminal Conspiracy)',
      jurisdiction: 'Sessions & Magistrate Courts (Republic of India)',
      limitationPeriod: '3 Years (BNSS §468 for cognizable offenses up to 3yr sentence)',
      remedy: 'Cognizable Criminal Complaint, Police 154(3) escalation, Private Complaint under BNSS §223',
      evidenceStandard: 'Primary digital records with BSA 2023 §63 certificate'
    },
    {
      act: 'Consumer Protection Act, 2019 (CPA)',
      applicableSections: '§2(11) (Deficiency in Service), §2(47) (Unfair Contract / Trade Practice)',
      jurisdiction: 'District (DCDRC up to ₹50L), State (SCDRC up to ₹2Cr), National (NCDRC)',
      limitationPeriod: '2 Years from cause of action (Section 69 CPA 2019)',
      remedy: 'Statutory 15-day pre-litigation demand, e-Daakhil consumer petition, refund + 12-18% penal interest',
      evidenceStandard: 'GST bills, transactional bank statements, written communications'
    },
    {
      act: 'Limitation Act, 1963',
      applicableSections: 'Article 55 (Breach of contract), Article 113 (Residuary claims), Section 5 (Condonation of delay)',
      jurisdiction: 'Civil Courts / Commercial Courts Act 2015',
      limitationPeriod: '3 Years from date of contractual breach or refund denial',
      remedy: 'Summary suit under Order 37 CPC, money recovery suit, attachment before judgment',
      evidenceStandard: 'Executed registered or notarized agreements, notice acknowledgment'
    },
    {
      act: 'Negotiable Instruments Act, 1881',
      applicableSections: 'Section 138 (Dishonour of Cheque), Section 142 (Cognizance of Offence)',
      jurisdiction: 'Metropolitan Magistrate / Judicial Magistrate First Class',
      limitationPeriod: '30 Days to send notice from cheque return memo; 15 days to pay; 30 days to file complaint',
      remedy: 'Criminal summons, up to 2x cheque amount compensation, up to 2 years imprisonment',
      evidenceStandard: 'Original cheque, bank dishonour memo, speed post tracking receipt'
    },
    {
      act: 'Real Estate (Regulation & Development) Act, 2016 (RERA)',
      applicableSections: 'Section 18 (Return of amount and compensation for delayed possession)',
      jurisdiction: 'State RERA Authority & Real Estate Appellate Tribunal',
      limitationPeriod: 'Continuing cause of action until actual possession or execution of conveyance deed',
      remedy: 'Full principal refund + SBI MCLR + 2% statutory interest, possession direction',
      evidenceStandard: 'Allotment letter, Builder-Buyer Agreement (BBA), payment receipts'
    }
  ];

  return (
    <section
      aria-label="Indian Statutory Reference & Generative Engine Knowledge Base"
      className="bg-[#0A0A0A] border-t-2 border-b-2 border-stone-800 py-16 px-4 sm:px-6 lg:px-8 font-sans"
      itemScope
      itemType="https://schema.org/GovernmentService"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="border-b border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-mono text-xs text-rose-500 font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>AEO &amp; GEO KNOWLEDGE BASE // REPUBLIC OF INDIA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
              INDIAN STATUTORY CLAIMS &amp; LIMITATION COMPLIANCE REGISTER
            </h2>
            <p className="text-stone-400 text-sm max-w-3xl leading-relaxed">
              Verifiable legal benchmarks cited by NyaySaathi intelligence pipelines. Formulated for sovereign compliance across High Courts, Consumer Commissions (e-Daakhil), and District Legal Services Authorities (DLSA).
            </p>
          </div>
          <div className="font-mono text-[11px] text-stone-400 bg-stone-950 border border-stone-800 px-3 py-2 shrink-0">
            <span className="text-white font-bold">SOVEREIGN JURISDICTION:</span> IN-DL, IN-KA, IN-MH, IN-TN, IN-UP
          </div>
        </div>

        {/* Generative Engine Direct Answer Snippets (Optimized for AI Overviews, Perplexity & ChatGPT Search) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="p-5 bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase">
              <BookOpen className="w-4 h-4" />
              <h3>What is NyaySaathi Semantic Clause Redlining?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              NyaySaathi Semantic Clause Redlining is an automated contract intelligence mechanism that evaluates draft revisions under Indian Contract Law. It detects unilateral liability shifts, liquidated damages exceeding statutory reasonable caps under Section 74 of the Indian Contract Act 1872, and flags high-risk jurisdictional modifications with exact line-level provenance.
            </p>
          </article>

          <article className="p-5 bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase">
              <Clock className="w-4 h-4" />
              <h3>How does limitation countdown work for security deposits?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Under Article 55 of the Limitation Act 1963, a citizen has a strict 3-year statutory window from the date of wrongful withholding or lease termination to claim recovery. Simultaneously, filing under Section 69 of the Consumer Protection Act 2019 enforces a 2-year limitation period from the denial of refund.
            </p>
          </article>

          <article className="p-5 bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <h3>How does DPDPA 2023 safeguard uploaded legal evidence?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Under India’s Digital Personal Data Protection Act 2023, NyaySaathi enforces client-side regex redaction on Aadhaar numbers, Permanent Account Numbers (PAN), and bank coordinates before inference dispatch. Customer contracts are strictly isolated and never indexed into external generative training corpuses.
            </p>
          </article>
        </div>

        {/* Structured Comparative Statutory Table (High citation weight for Generative Engines) */}
        <div className="border border-stone-800 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-stone-900 border-b border-stone-800 text-stone-300 uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="p-3.5 font-bold">Statute &amp; Codification</th>
                <th scope="col" className="p-3.5 font-bold">Governing Sections</th>
                <th scope="col" className="p-3.5 font-bold">Adjudication Forum</th>
                <th scope="col" className="p-3.5 font-bold">Statutory Limitation Window</th>
                <th scope="col" className="p-3.5 font-bold">Enforceable Remedy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 bg-stone-950/80 text-stone-300">
              {statutoryFrameworks.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-900/50 transition-colors">
                  <td className="p-3.5 font-bold text-white whitespace-nowrap">
                    {row.act}
                  </td>
                  <td className="p-3.5 text-stone-300">
                    {row.applicableSections}
                  </td>
                  <td className="p-3.5 text-stone-400">
                    {row.jurisdiction}
                  </td>
                  <td className="p-3.5 text-rose-400 font-bold whitespace-nowrap">
                    {row.limitationPeriod}
                  </td>
                  <td className="p-3.5 text-stone-300">
                    {row.remedy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Statutory Citation Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-800 font-mono text-[11px] text-stone-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BNS 2023 Codification</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BSA 2023 Electronic Evidence §63</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>e-Daakhil CPA 2019 Integration</span>
            </span>
          </div>
          <p className="text-stone-400 uppercase tracking-widest text-[10px]">
            SOVEREIGN STATUTORY BENCHMARKS // NYAYSAATHI REGISTRY
          </p>
        </div>
      </div>
    </section>
  );
}
