/**
 * Versioned Consent Texts in English, Hindi, and Bengali.
 * Hindi and Bengali translations are flagged "NEEDS HUMAN REVIEW" as required by governance.
 */

export const CURRENT_CONSENT_VERSION = '1.0.0';

export interface ConsentTextManifest {
  version: string;
  effectiveDate: string;
  needsHumanReview: boolean;
  locales: {
    [locale: string]: {
      languageName: string;
      needsHumanReview: boolean;
      title: string;
      preamble: string;
      toggles: {
        consent_surveys: { title: string; description: string };
        consent_academic: { title: string; description: string };
        consent_help_seeking: { title: string; description: string };
        consent_counselor_triage: { title: string; description: string };
        consent_journal_signals: { title: string; description: string };
        emergency_escalation_acknowledged: { title: string; description: string };
      };
      rightsStatement: string;
    };
  };
}

export const CONSENT_TEXT_MANIFEST: ConsentTextManifest = {
  version: CURRENT_CONSENT_VERSION,
  effectiveDate: '2026-11-01',
  needsHumanReview: false,
  locales: {
    en: {
      languageName: 'English',
      needsHumanReview: false,
      title: 'Sahayak Student Consent & Privacy Choice',
      preamble:
        'Sahayak is an opt-in platform designed to support student mental wellbeing. You have granular control over every signal. Declining any or all signals will never restrict your access to crisis help, support directories, or self-help exercises.',
      toggles: {
        consent_surveys: {
          title: 'Voluntary Surveys (PHQ-style, GAD-style)',
          description:
            'Allow voluntary check-ins and reflection questions to inform your personal wellbeing trends. Never shared without consent.',
        },
        consent_academic: {
          title: 'Academic Pattern Drift (Relative to Your Baseline)',
          description:
            'Permit comparison of submission delays and attendance changes relative to your own prior patterns, not cohort comparisons.',
        },
        consent_help_seeking: {
          title: 'Help-Seeking Activity Signals',
          description:
            'Detect patterns such as repeated late-night resource viewing or abandoned counselor booking attempts.',
        },
        consent_counselor_triage: {
          title: 'Counselor Review Suggestions (Tier 2 / Tier 3)',
          description:
            'Allow campus counselors to receive tiered check-in suggestions when corroborating signals suggest severe distress.',
        },
        consent_journal_signals: {
          title: 'Private Journal Linguistic Signals (Strict Opt-in)',
          description:
            'Opt in to local sentiment evaluation on private reflections. Your raw journal text is student-private envelope-encrypted and never readable by staff.',
        },
        emergency_escalation_acknowledged: {
          title: 'Emergency Life Safety Acknowledgment',
          description:
            'Acknowledge institutional crisis policy. Immediate self-report of acute crisis always presents verified emergency helplines.',
        },
      },
      rightsStatement:
        'You may revoke consent at any time. Revocation triggers automatic deletion of previously collected passive telemetry.',
    },
    hi: {
      languageName: 'Hindi (हिंदी)',
      needsHumanReview: true, // NEEDS HUMAN REVIEW
      title: 'सहायक छात्र सहमति एवं गोपनीयता विकल्प (समीक्षाधीन / NEEDS HUMAN REVIEW)',
      preamble:
        'सहायक छात्रों के मानसिक स्वास्थ्य के समर्थन के लिए एक स्वैच्छिक मंच है। आपका प्रत्येक संकेत पर पूर्ण नियंत्रण है। सहमति न देने पर भी आपको संकटकालीन सहायता और मार्गदर्शन पूरी तरह उपलब्ध रहेगा।',
      toggles: {
        consent_surveys: {
          title: 'स्वैच्छिक सर्वेक्षण (जाँच एवं मनोदशा)',
          description:
            'व्यक्तिगत तनाव के रुझानों को समझने के लिए सर्वेक्षणों की अनुमति दें। आपकी सहमति के बिना कभी साझा नहीं किया जाएगा।',
        },
        consent_academic: {
          title: 'शैक्षणिक रुझान (व्यक्तिगत आधार रेखा पर आधारित)',
          description:
            'दूसरों से तुलना किए बिना, केवल आपके अपने पिछले पैटर्न के आधार पर असाइनमेंट और उपस्थिति में बदलाव का विश्लेषण।',
        },
        consent_help_seeking: {
          title: 'सहायता प्राप्ति व्यवहार संकेत',
          description: 'देर रात संसाधनों को देखने या परामर्शदाता बुकिंग के प्रयासों का विश्लेषण।',
        },
        consent_counselor_triage: {
          title: 'परामर्शदाता मार्गदर्शन सुझाव (स्तर 2 / स्तर 3)',
          description:
            'गंभीर संकट की स्थिति में परिसर के परामर्शदाताओं को सुरक्षित सुझाव प्राप्त करने की अनुमति दें।',
        },
        consent_journal_signals: {
          title: 'निजी डायरी भावना संकेत (सख्त स्वैच्छिक)',
          description:
            'निजी डायरी का स्थानीय विश्लेषण। आपका मूल पाठ एनवेलप-एन्क्रिप्टेड है और स्टाफ द्वारा कभी नहीं पढ़ा जा सकता।',
        },
        emergency_escalation_acknowledged: {
          title: 'आपातकालीन जीवन रक्षा स्वीकृति',
          description: 'आपातकालीन हेल्पलाइन (Tele-MANAS, KIRAN, 112) की नीतियों की स्वीकृति।',
        },
      },
      rightsStatement:
        'आप किसी भी समय सहमति वापस ले सकते हैं। सहमति वापस लेने पर पिछला डेटा स्वतः हटा दिया जाता है।',
    },
    bn: {
      languageName: 'Bengali (বাংলা)',
      needsHumanReview: true, // NEEDS HUMAN REVIEW
      title:
        'সহায়ক শিক্ষার্থী সম্মতি ও গোপনীয়তা বিকল্প (পর্যালোচনা প্রয়োজন / NEEDS HUMAN REVIEW)',
      preamble:
        'সহায়ক শিক্ষার্থীদের মানসিক সুস্থতার জন্য একটি স্বেচ্ছাসেবী প্ল্যাটফর্ম। প্রতিটি সিগন্যালে আপনার সম্পূর্ণ নিয়ন্ত্রণ রয়েছে। সম্মতি প্রত্যাখ্যান করলেও জরুরি পরিষেবা সম্পূর্ণ অ্যাক্সেসযোগ্য থাকবে।',
      toggles: {
        consent_surveys: {
          title: 'স্বেচ্ছাসেবী সমীক্ষা (মানসিক স্বাস্থ্য পরীক্ষা)',
          description: 'ব্যক্তিগত মানসিক সুস্থতার প্রবণতা মূল্যায়নের জন্য সমীক্ষার অনুমতি দিন।',
        },
        consent_academic: {
          title: 'একাডেমিক প্যাটার্ন পরিবর্তন (ব্যক্তিগত বেসলাইন)',
          description:
            'সহপাঠীদের সাথে তুলনা না করে শুধুমাত্র আপনার পূর্ববর্তী প্যাটার্নের ভিত্তিতে পরিবর্তন বিশ্লেষণ।',
        },
        consent_help_seeking: {
          title: 'সাহায্য চাওয়ার আচরণ সংকেত',
          description:
            'দেরিতে রাতে রিসোর্স অনুসন্ধান বা কাউন্সেলর বুকিং চেষ্টার প্যাটার্ন বিশ্লেষণ।',
        },
        consent_counselor_triage: {
          title: 'কাউন্সেলর পর্যালোচনা পরামর্শ (স্তর ২ / ৩)',
          description:
            'তীব্র মানসিক সংকটের ক্ষেত্রে ক্যাম্পাসের কাউন্সেলরদের সুরক্ষিত চেক-ইন পরামর্শ প্রদানের অনুমতি দিন।',
        },
        consent_journal_signals: {
          title: 'ব্যক্তিগত ডায়েরি সিগন্যাল (কঠোর অপ্ট-ইন)',
          description:
            'আপনার ডায়েরি সম্পূর্ণরূপে এনভেলপ-এনক্রিপ্টেড এবং কর্মীদের কাছে কখনোই দৃশ্যমান নয়।',
        },
        emergency_escalation_acknowledged: {
          title: 'জরুরি জীবন সুরক্ষা স্বীকৃতি',
          description: 'জরুরি হেল্পলাইন ও ক্যাম্পাসের সহায়তা সংক্রান্ত নীতিমালার স্বীকৃতি।',
        },
      },
      rightsStatement:
        'আপনি যেকোনো সময় সম্মতি প্রত্যাহার করতে পারেন। প্রত্যাহারের সাথে সাথে পূর্ববর্তী প্যাসিভ টেলিমেট্রি মুছে ফেলা হয়।',
    },
  },
};
