import { Deck, UserProfile, SubjectMastery, DailyActivity, ScheduleItem, DeadlineItem, ActivityNotification } from "./types";

export const initialUserProfile: UserProfile = {
  name: "Alex Chen",
  email: "alex.chen@academic.edu",
  role: "COGNITIVE SCIENCE STUDENT",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdhWOGWVCSm1juN68Z5A3I1l4szzoUsw6P0GguJ8AjDmHhGeeFQ19_g4bheMQpu8jc-mjmz5ABEAZhEPFOY6uzquoAJ3uLviRNcoDoVn7Ulycv3Bo0YgUfjq5pEgqOJh8yR9k8G-rE4EWpVaJTBZjlvTnLzfU8JnNpJBHgwi-75bLqVFkXcEF4YyFQp7TTdFzj-S787HtrCyxrqP_WmAriBiu-vaF_WvrriNRWSZt_CIOMsJjrKwtNXWLvnN2F6EjKvX4EFaYqwWPR",
  bio: "Optimizing knowledge retention through spaced repetition and active recall. Currently focusing on neuroanatomy and systemic linguistics. Always seeking more efficient mental models.",
  joinedDate: "Joined Sep 2023",
  isPro: true,
  linkedGoogle: true,
  linkedGitHub: false
};

export const initialDecks: Deck[] = [
  {
    id: "molecular-genetics",
    name: "Molecular Genetics",
    category: "Biology",
    description: "Detailed coverage of translation, transcription, transcription factors, replication, repair mechanisms, and DNA/RNA structures.",
    cardsCount: 124,
    mastery: 68,
    cards: [
      {
        id: "mg-1",
        question: "Define Mitochondrial DNA",
        answer: "Mitochondrial DNA (mtDNA) is the circular DNA located inside mitochondria, cellular organelles of eukaryotic cells. It is maternally inherited (passed down solely from the mother) and contains a separate, small sequence of genes distinct from the cell's nuclear genome.",
        category: "Biology",
        status: "mature"
      },
      {
        id: "mg-2",
        question: "What is the function of ATP Synthase?",
        answer: "ATP synthase is a complex enzyme embedded in the inner mitochondrial membrane that uses the proton gradient (proton motive force) between the intermembrane space and matrix to drive the synthesis of Adenosine Triphosphate (ATP) from ADP and inorganic phosphate.",
        category: "Biology",
        status: "young"
      },
      {
        id: "mg-3",
        question: "Explain the semi-conservative replication model",
        answer: "The semi-conservative model describes DNA replication where each of the two parental strands acts as a template for a new strand. The resulting double-stranded DNA molecules contain one original parental strand and one newly synthesized daughter strand.",
        category: "Biology",
        status: "new"
      }
    ]
  },
  {
    id: "big-o",
    name: "Big O Notation",
    category: "Algorithms",
    description: "Computational complexity, key time/space bounds for sorting, searching, hash tables, trees, and essential graph algorithms.",
    cardsCount: 45,
    mastery: 92,
    cards: [
      {
        id: "bo-1",
        question: "Explain the Spacing Effect in learning theory",
        answer: "The spacing effect is a cognitive phenomenon where learning is far more robust and memories are retained longer when study sessions are spaced out over time, as opposed to cramming the same workload into a single concentrated block of time.",
        category: "Cognitive Science",
        status: "mature"
      },
      {
        id: "bo-2",
        question: "What is the Big O complexity of QuickSort's worst-case?",
        answer: "QuickSort's worst-case time complexity is O(N^2), occurring when the pivot selections consistently split-off unbalanced partition sizes (such as selecting the smallest/largest item as pivot in sorted inputs).",
        category: "Algorithms",
        status: "mature"
      }
    ]
  },
  {
    id: "kanji",
    name: "Kanji: Grade 1",
    category: "Japanese",
    description: "Introductory 80 characters taught to Japanese elementary first graders, tracking basic readings and compounds.",
    cardsCount: 210,
    mastery: 12,
    cards: [
      {
        id: "kj-1",
        question: "What are the common Onyomi and Kunyomi readings of '川'?",
        answer: "Kun-reading: かわ (kawa, meaning river). On-reading: セン (sen). Part of grade 1 foundational kanji.",
        category: "Japanese",
        status: "new"
      }
    ]
  },
  {
    id: "organic-compounds",
    name: "Organic Compounds",
    category: "Chemistry",
    description: "Basic functional groups, visual nomenclature rules, alkanes, alkenes, alkynes, aromatic ring behaviors, and key reaction pathways.",
    cardsCount: 88,
    mastery: 45,
    cards: [
      {
        id: "oc-1",
        question: "Define Osmosis and distinguish it from Diffusion.",
        answer: "Osmosis refers strictly to the net passive movement of solvent (usually water) molecules across a semi-permeable membrane from an area of higher water potential (low solute concentration) to an area of lower water potential (high solute concentration). General diffusion, by contrast, describes the randomized net movement of any particle type down its own concentration gradient without dependency on a physical partition.",
        category: "Chemistry",
        status: "young"
      }
    ]
  },
  {
    id: "organic-chemistry", // Organic Chemistry is the main deck from HTML screen 3
    name: "Organic Chemistry",
    category: "Chemistry",
    description: "Advanced molecular structures, reaction mechanisms, and nomenclature for semester finals.",
    cardsCount: 1248,
    mastery: 67,
    cards: [
      {
        id: "ochem-1",
        question: "What is the key mechanism of Nucleophilic Substitution (SN2)?",
        answer: "SN2 is a single-step (concerted) bimolecular nucleophilic substitution reaction where the nucleophile attacks the electrophilic carbon from the backside (180 degrees from the leaving group), resulting in a complete inversion of stereochemical configuration at that chiral carbon.",
        category: "Chemistry",
        status: "young"
      },
      {
        id: "ochem-2",
        question: "State Markovnikov's Rule for electrophilic addition",
        answer: "Markovnikov's rule dictates that in the addition of a protic acid (HX) to an asymmetric alkene, the acid hydrogen (H) attaches to the carbon with more hydrogen atoms, while the halide (X) group attaches to the carbon with more alkyl substituents (the more stable carbocation intermediate).",
        category: "Chemistry",
        status: "new"
      },
      {
        id: "ochem-3",
        question: "Describe Carbonyl Carbon Electrophilicity",
        answer: "The carbonyl carbon is highly electrophilic because oxygen is highly electronegative, creating a polar double bond that pulls electron density away from the carbon, leaving a partial positive charge susceptible to attack.",
        category: "Chemistry",
        status: "mature"
      }
    ]
  }
];

export const initialSubjectMastery: SubjectMastery[] = [
  { subject: "Neuroscience", masteryPercent: 94, status: "Mastered", colorClass: "bg-primary" },
  { subject: "Advanced Calculus", masteryPercent: 68, status: "Reviewing", colorClass: "bg-tertiary" },
  { subject: "Economic Theory", masteryPercent: 42, status: "Learning", colorClass: "bg-secondary" },
  { subject: "Organic Chemistry", masteryPercent: 12, status: "New", colorClass: "bg-outline" }
];

export const initialHeatmap: DailyActivity[] = [
  0, 2, 3, 1, 0, 2, 4,
  1, 1, 3, 4, 2, 0, 1,
  2, 3, 4, 4, 3, 2, 1,
  1, 0, 2, 3, 4, 4, 4,
  3, 2
].map((val, idx) => ({ dayIndex: idx, val }));

export const initialSchedule: ScheduleItem[] = [
  { id: "sch-1", timeString: "09:00", title: "Organic Chemistry Review", durationLabel: "25 min", typeLabel: "Pomodoro", completed: true },
  { id: "sch-2", timeString: "14:30", title: "Neuroscience Fundamentals", durationLabel: "45 min", typeLabel: "Active Recall", completed: false }
];

export const initialDeadlines: DeadlineItem[] = [
  { id: "dl-1", month: "OCT", day: "28", title: "Molecular Biology Final", daysLeft: 4, progressPercent: 85, isUrgent: true },
  { id: "dl-2", month: "NOV", day: "02", title: "History of Medicine Quiz", daysLeft: 9, progressPercent: 30, isUrgent: false }
];

export const initialNotifications: ActivityNotification[] = [
  {
    id: "not-1",
    type: "deck_created",
    title: "New deck created",
    description: "You successfully initialized the \"Neuroanatomy 101\" deck with 42 cards.",
    timeAgo: "2m ago",
    unread: true,
    deckPayload: { name: "Neuroanatomy 101", cardsCount: 42 }
  },
  {
    id: "not-2",
    type: "goal_achieved",
    title: "Study goal achieved",
    description: "Incredible! You've maintained a 15-day streak. Your retention rate is up by 12%.",
    timeAgo: "1h ago",
    unread: true
  },
  {
    id: "not-3",
    type: "reminder",
    title: "Reminder: Study Organic Chemistry",
    description: "Your spaced repetition session for \"Carbonyl Groups\" is ready.",
    timeAgo: "3h ago",
    unread: false
  },
  {
    id: "not-4",
    type: "shared_deck",
    title: "Sarah shared a deck",
    description: "Sarah sent you \"Advanced Microeconomics - Finals Prep\".",
    timeAgo: "Yesterday",
    unread: false,
    deckPayload: { name: "Advanced Microeconomics - Finals Prep", cardsCount: 65 }
  }
];
