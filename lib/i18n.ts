/**
 * UniQ Internationalization (i18n) Engine.
 * Supports English ('en') and Hindi ('hi').
 * All unreviewed Hindi strings are explicitly flagged with isReviewed: false
 * and documented with unreviewed tags and comments.
 * Strictly free of banned words (telemetry, sensor matrix, surveillance, etc.).
 */

export interface I18nEntry {
  en: string;
  hi: string;
  isReviewed: boolean; // false indicates unreviewed string
}

export const I18N_DICTIONARY: Record<string, I18nEntry> = {
  // ── General / Badges ──
  'simulated_data': {
    en: 'Simulated data',
    hi: 'अनुमानित डेटा', /* unreviewed */
    isReviewed: false,
  },
  'measured_data': {
    en: 'Measured data',
    hi: 'प्रमाणित डेटा', /* unreviewed */
    isReviewed: false,
  },
  'assumption_tag': {
    en: 'Assumption',
    hi: 'अनुमान', /* unreviewed */
    isReviewed: false,
  },
  'feature_disabled': {
    en: 'This feature is currently disabled in university setup.',
    hi: 'यह सुविधा वर्तमान में विश्वविद्यालय सेटअप में अक्षम है।', /* unreviewed */
    isReviewed: false,
  },

  // ── FEATURE 1: TIMETABLE ARRIVAL PREDICTION ──
  'timetable_title': {
    en: 'Class-Timetable Arrival Prediction',
    hi: 'कक्षा-समय सारणी आगमन पूर्वानुमान', /* unreviewed */
    isReviewed: false,
  },
  'timetable_import_csv': {
    en: 'Import Timetable CSV',
    hi: 'समय सारणी सीएसवी आयात करें', /* unreviewed */
    isReviewed: false,
  },
  'timetable_template_download': {
    en: 'Download Template',
    hi: 'टेम्पलेट डाउनलोड करें', /* unreviewed */
    isReviewed: false,
  },
  'timetable_example_download': {
    en: 'Download Example CSV',
    hi: 'उदाहरण सीएसवी डाउनलोड करें', /* unreviewed */
    isReviewed: false,
  },
  'timetable_preview': {
    en: 'Timetable Import Preview',
    hi: 'समय सारणी पूर्वावलोकन', /* unreviewed */
    isReviewed: false,
  },
  'timetable_undo_last': {
    en: 'Undo Last Import',
    hi: 'पिछला आयात पूर्ववत करें', /* unreviewed */
    isReviewed: false,
  },
  'timetable_err_bad_time': {
    en: 'Invalid class end time format. Use HH:mm in 24-hour time.',
    hi: 'कक्षा समाप्ति का समय अमान्य है। 24 घंटे प्रारूप (HH:mm) का उपयोग करें।', /* unreviewed */
    isReviewed: false,
  },
  'timetable_err_unknown_block': {
    en: 'Unknown campus block. Please define the block before importing.',
    hi: 'अज्ञात ब्लॉक। आयात करने से पहले कृपया ब्लॉक परिभाषित करें।', /* unreviewed */
    isReviewed: false,
  },
  'timetable_err_negative_count': {
    en: 'Student count cannot be negative or zero.',
    hi: 'छात्रों की संख्या शून्य या ऋणात्मक नहीं हो सकती।', /* unreviewed */
    isReviewed: false,
  },
  'timetable_expected_spike': {
    en: 'Expected spike at {time}: about {count} students from {blocks}. Open a second counter by {prepTime}.',
    hi: '{time} पर संभावित भीड़: {blocks} से लगभग {count} छात्र। {prepTime} तक दूसरा काउंटर खोलें।', /* unreviewed */
    isReviewed: false,
  },
  'timetable_slot_busy': {
    en: '{busySlot} is likely busy ({range} students), {quietSlot} is quieter',
    hi: '{busySlot} पर भीड़ रहने की संभावना है ({range} छात्र), {quietSlot} अधिक शांत रहेगा', /* unreviewed */
    isReviewed: false,
  },
  'timetable_why_busy': {
    en: 'Why is it busy?',
    hi: 'भीड़ क्यों होने की संभावना है?', /* unreviewed */
    isReviewed: false,
  },
  'timetable_what_if': {
    en: 'What-if Simulation: Shift class release time',
    hi: 'संभावित विश्लेषण: कक्षा समाप्ति का समय बदलें', /* unreviewed */
    isReviewed: false,
  },
  'timetable_impact_metric': {
    en: 'Timetable Impact: explains {pct}% of arrival forecast variance',
    hi: 'समय सारणी प्रभाव: आगमन पूर्वानुमान भिन्नता का {pct}% हिस्सा समझाता है', /* unreviewed */
    isReviewed: false,
  },
  'timetable_cold_start': {
    en: 'Estimated from timetable (Low confidence - awaiting 14 days calibration)',
    hi: 'समय सारणी से अनुमानित (कम विश्वसनीयता - 14 दिनों के अंशांकन की प्रतीक्षा)', /* unreviewed */
    isReviewed: false,
  },
  'timetable_ml_promoted': {
    en: 'With timetable: MAE {newMae} vs {oldMae}, {pct}% better (Promoted)',
    hi: 'समय सारणी के साथ: MAE {newMae} बनाम {oldMae}, {pct}% बेहतर (स्वीकृत)', /* unreviewed */
    isReviewed: false,
  },
  'timetable_ml_not_promoted': {
    en: 'No improvement with timetable features (Not promoted)',
    hi: 'समय सारणी सुविधाओं से कोई सुधार नहीं (अस्वीकृत)', /* unreviewed */
    isReviewed: false,
  },

  // ── FEATURE 2: WEEKLY MENU VOTING ──
  'voting_title': {
    en: 'Weekly Menu Voting',
    hi: 'साप्ताहिक मेनू मतदान', /* unreviewed */
    isReviewed: false,
  },
  'voting_vote_for_next_week': {
    en: 'Vote for next week',
    hi: 'अगले सप्ताह के लिए वोट करें', /* unreviewed */
    isReviewed: false,
  },
  'voting_advisory_disclaimer': {
    en: 'Advisory, final menu set by the mess committee',
    hi: 'सलाहकारी, अंतिम मेनू मेस समिति द्वारा तय किया जाता है', /* unreviewed */
    isReviewed: false,
  },
  'voting_turnout_warning': {
    en: 'Low turnout ({turnout}%), treat as a rough signal',
    hi: 'कम मतदान ({turnout}%), इसे केवल प्रारंभिक संकेत मानें', /* unreviewed */
    isReviewed: false,
  },
  'voting_min_votes_needed': {
    en: 'Results unlock after {min} verified student votes ({current}/{min} received)',
    hi: 'परिणाम {min} सत्यापित वोटों के बाद दिखाई देंगे ({current}/{min} प्राप्त)', /* unreviewed */
    isReviewed: false,
  },
  'voting_none_of_these': {
    en: 'None of these dishes',
    hi: 'इनमें से कोई भी नहीं', /* unreviewed */
    isReviewed: false,
  },
  'voting_reason_oily': {
    en: 'Too oily / heavy',
    hi: 'बहुत तैलीय / भारी', /* unreviewed */
    isReviewed: false,
  },
  'voting_reason_variety': {
    en: 'Want more variety',
    hi: 'अधिक विविधता चाहिए', /* unreviewed */
    isReviewed: false,
  },
  'voting_reason_portion': {
    en: 'Preparation inconsistency',
    hi: 'तैयारी में असंतुलन', /* unreviewed */
    isReviewed: false,
  },
  'voting_reason_taste': {
    en: 'Taste / spice imbalance',
    hi: 'स्वाद / मसाले का असंतुलन', /* unreviewed */
    isReviewed: false,
  },
  'voting_one_vote_limit': {
    en: 'One vote per meal slot allowed. You may change your choice until voting closes.',
    hi: 'प्रति भोजन स्लॉट केवल एक वोट की अनुमति है। मतदान बंद होने तक आप विकल्प बदल सकते हैं।', /* unreviewed */
    isReviewed: false,
  },
  'voting_closed_early': {
    en: 'Ballot closed early by administrator',
    hi: 'व्यवस्थापक द्वारा मतदान समय से पहले बंद किया गया', /* unreviewed */
    isReviewed: false,
  },
  'voting_voided': {
    en: 'Ballot voided for review',
    hi: 'समीक्षा हेतु मतदान रद्द किया गया', /* unreviewed */
    isReviewed: false,
  },

  // ── FEATURE 3: ZERO WASTE WEEK CHALLENGE ──
  'challenge_title': {
    en: 'Zero Waste Week Challenge',
    hi: 'शून्य अपशिष्ट सप्ताह चुनौती', /* unreviewed */
    isReviewed: false,
  },
  'challenge_how_scoring_works': {
    en: 'How scoring works',
    hi: 'स्कोरिंग कैसे काम करती है', /* unreviewed */
    isReviewed: false,
  },
  'challenge_scoring_formula': {
    en: 'Score = Percentage reduction in plate & preparation waste per student served versus the mess 4-week historical baseline.',
    hi: 'स्कोर = मेस के पिछले 4 सप्ताह के औसत के मुकाबले प्रति छात्र परोसे गए भोजन में अपशिष्ट की प्रतिशत कमी।', /* unreviewed */
    isReviewed: false,
  },
  'challenge_fairness_rule': {
    en: 'Fairness rules: Requires >= 80% waste logging completeness, minimum 3 days logged, and consistent portion sizes to qualify.',
    hi: 'निष्पक्षता नियम: कम से कम 80% अपशिष्ट लॉगिंग, न्यूनतम 3 दिन लॉग और पर्याप्त परोसन अनिवार्य है।', /* unreviewed */
    isReviewed: false,
  },
  'challenge_underlogging_flag': {
    en: 'Flagged: Waste logging completeness below 80% ({pct}% logged). Skipping logs does not count toward winning.',
    hi: 'चिह्नित: अपशिष्ट लॉगिंग 80% से कम है ({pct}% दर्ज)। लॉग छोड़ने से जीत मान्य नहीं होगी।', /* unreviewed */
    isReviewed: false,
  },
  'challenge_satisfaction_guard': {
    en: 'Flagged: Student satisfaction drop detected. Reducing portions to lower waste is disqualified.',
    hi: 'चिह्नित: छात्र संतुष्टि में गिरावट पाई गई। अपशिष्ट घटाने के लिए मात्रा कम करना अमान्य है।', /* unreviewed */
    isReviewed: false,
  },
  'challenge_student_standing': {
    en: 'Your mess is at {pct}% less waste than its usual this week',
    hi: 'आपकी मेस इस सप्ताह अपने सामान्य स्तर से {pct}% कम अपशिष्ट पर है', /* unreviewed */
    isReviewed: false,
  },
  'challenge_tip_seconds': {
    en: 'Take what you can finish, seconds are welcome if the counter offers them.',
    hi: 'उतना ही लें जितना खा सकें, आवश्यकता होने पर दोबारा ले सकते हैं।', /* unreviewed */
    isReviewed: false,
  },
  'challenge_pledge_button': {
    en: 'I will finish my plate today',
    hi: 'मैं आज अपनी थाली पूरी समाप्त करूँगा', /* unreviewed */
    isReviewed: false,
  },
  'challenge_pledge_count': {
    en: '{count} students pledged today',
    hi: 'आज {count} छात्रों ने संकल्प लिया', /* unreviewed */
    isReviewed: false,
  },
  'challenge_demo_watermark': {
    en: 'Demo challenge • Simulated evaluation',
    hi: 'डेमो चुनौती • अनुमानित मूल्यांकन', /* unreviewed */
    isReviewed: false,
  },
  'challenge_badge_clean_plate': {
    en: 'Clean Plate Week',
    hi: 'स्वच्छ थाली सप्ताह', /* unreviewed */
    isReviewed: false,
  },
  'challenge_badge_most_improved': {
    en: 'Most Improved',
    hi: 'सर्वाधिक सुधार', /* unreviewed */
    isReviewed: false,
  },
  'challenge_badge_logging_streak': {
    en: 'Best Logging Streak',
    hi: 'सर्वश्रेष्ठ लॉगिंग निरंतरता', /* unreviewed */
    isReviewed: false,
  },
  'challenge_badge_zero_surplus': {
    en: 'Zero Surplus Day',
    hi: 'शून्य अतिरिक्त भोजन दिवस', /* unreviewed */
    isReviewed: false,
  },
};

export const i18nTranslations = {
  en: Object.fromEntries(Object.entries(I18N_DICTIONARY).map(([k, v]) => [k, { text: v.en, isReviewed: true }])),
  hi: Object.fromEntries(Object.entries(I18N_DICTIONARY).map(([k, v]) => [k, { text: v.hi, isReviewed: v.isReviewed }])),
};

/**
 * Translation helper function.
 * Automatically substitutes {param} placeholders.
 */
export function t(key: string, lang: 'en' | 'hi' = 'en', params?: Record<string, string | number>): string {
  const entry = I18N_DICTIONARY[key];
  if (!entry) {
    return key;
  }

  let text = lang === 'hi' ? entry.hi : entry.en;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.split('{' + k + '}').join(String(v));
    });
  }

  return text;
}
