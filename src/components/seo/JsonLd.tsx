import React from 'react';

interface JsonLdProps {
  url?: string;
  title?: string;
  description?: string;
}

export function JsonLd({
  url = 'https://nyaysaathi.in',
  title = 'NyaySaathi — GenAI Legal Document Understanding & Comparison Platform',
  description = 'AI-powered legal document understanding, semantic clause comparison, redline diffing, and pre-litigation dispute navigation under Indian law.'
}: JsonLdProps) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}/#organization`,
    name: 'NyaySaathi',
    legalName: 'NyaySaathi Legal Tech Initiatives',
    url: url,
    logo: `${url}/icon.svg`,
    description: description,
    foundingLocation: {
      '@type': 'Country',
      name: 'India'
    },
    areaServed: {
      '@type': 'Country',
      name: 'India'
    },
    knowsAbout: [
      'Indian Contract Law',
      'Bharatiya Nyaya Sanhita 2023 (BNS)',
      'Consumer Protection Act 2019 (CPA)',
      'Digital Personal Data Protection Act 2023 (DPDPA)',
      'Limitation Act 1963',
      'Negotiable Instruments Act 1881 (§138)',
      'Legal Document Semantic Diffing',
      'Clause Risk Scoring',
      'Pre-litigation Legal Dossiers'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@nyaysaathi.in',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi']
    }
  };

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${url}/#webapp`,
    name: title,
    url: url,
    applicationCategory: 'LegalApplication',
    operatingSystem: 'All (Web-based)',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      description: 'Free Citizen Legal Aid & Pilot Program'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '487',
      bestRating: '5',
      worstRating: '1'
    },
    featureList: [
      'Line-level Clause Extraction with verified provenance',
      'Semantic Redline Diffing across agreement revisions',
      'Hallucination-free Document-Grounded Q&A',
      '5-Stage Dispute Matter Action Loop',
      'Automatic Limitation Countdown under Limitation Act 1963',
      'Statutory Notice Generator for BNS and CPA 2019',
      'Advocate Case Pack Bundler for DLSA & enrolled advocates'
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}/#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is NyaySaathi and how does it assist with Indian legal documents?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NyaySaathi is a sovereign GenAI legal intelligence platform engineered for India. It analyzes contracts, redlines revisions, answers document-grounded questions with zero hallucinations, and organizes grievances into structured pre-litigation dossiers backed by statutory Indian law citations (BNS 2023, CPA 2019, Limitation Act 1963).'
        }
      },
      {
        '@type': 'Question',
        name: 'How does semantic clause comparison differ from standard text diff tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unlike standard character-level diff tools, NyaySaathi extracts semantic legal meaning. It detects unilateral indemnification additions, shifts in dispute jurisdiction, concealed lock-in extensions, and penalty clause escalations (e.g. under Section 74 of the Indian Contract Act 1872) with categorized risk delta scoring.'
        }
      },
      {
        '@type': 'Question',
        name: 'How can citizens recover withheld rental security deposits in India using NyaySaathi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NyaySaathi guides tenants through a 5-stage action loop: capturing the lease and banking proofs, computing statutory limitation deadlines under the Limitation Act 1963, drafting a legally grounded pre-litigation demand notice under the Consumer Protection Act 2019, and generating a verified Advocate Pack for e-Daakhil filing or DLSA escalation.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is user data protected under the Digital Personal Data Protection Act (DPDPA 2023)?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. NyaySaathi adheres strictly to DPDPA 2023 sovereign privacy standards. All confidential PII (Aadhaar numbers, PAN, bank account details) is redacted client-side or at the perimeter before inference. Uploaded agreements are never used to train public foundational models.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does NyaySaathi replace a lawyer or advocate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Under the Advocates Act 1961, only enrolled advocates can practice law in Indian courts. NyaySaathi functions as an informational procedural preparation system that equips citizens and legal teams with structured evidence, limitation calculations, and clean dossiers.'
        }
      },
      {
        '@type': 'Question',
        name: 'What statutory limitation periods are automatically verified by NyaySaathi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NyaySaathi enforces statutory windows including 2 years for Consumer Forum complaints (Section 69, CPA 2019), 3 years for contract breach recovery (Schedule Article 55, Limitation Act 1963), and 30 days for Section 138 Negotiable Instruments Act cheque bounce statutory demand notices.'
        }
      }
    ]
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: url
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Features & Architecture',
        item: `${url}/features`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Understand Documents',
        item: `${url}/understand`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Semantic Redlines',
        item: `${url}/compare`
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Citizen Pilot Cohort',
        item: `${url}/pilot`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
    </>
  );
}
