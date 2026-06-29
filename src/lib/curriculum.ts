/**
 * Grammar-track curriculum (Phase 1).
 *
 * Pre-authored, level-banded lessons so the core learning loop is fast,
 * deterministic and doesn't depend on live AI generation / quota. Each lesson
 * teaches one concept then tests it with interleaved question types (MCQ,
 * cloze, typed). Every question can spawn a spaced-repetition flashcard.
 */
import type { CefrLevel } from "./mastery";

export type QuestionType = "mcq" | "cloze" | "type";

export interface Question {
  id: string;
  type: QuestionType;
  /** Concept tag used for weak-point grouping. */
  concept: string;
  /** Sentence or instruction. Blanks are written as "___". */
  prompt: string;
  /** Options for multiple-choice questions. */
  choices?: string[];
  /** Canonical correct answer. */
  answer: string;
  /** Extra accepted answers for typed/cloze (compared case-insensitively). */
  accept?: string[];
  /** One-line "why" shown after answering. */
  explanation: string;
  /** Flashcard front/back generated for spaced repetition. */
  flashFront: string;
  flashBack: string;
}

export interface LessonTeach {
  intro: string;
  points: string[];
  examples: { text: string; note?: string }[];
}

export interface Lesson {
  id: string;
  level: CefrLevel;
  order: number;
  title: string;
  concept: string;
  /** Short subtitle shown on the lesson card. */
  blurb: string;
  teach: LessonTeach;
  questions: Question[];
}

export interface Track {
  id: string;
  name: string;
  lessons: Lesson[];
}

/** Normalise a free-text answer for forgiving comparison. */
function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, "")
    .replace(/\s+/g, " ");
}

/** Whether a user's answer matches a question's canonical/accepted answers. */
export function checkAnswer(question: Question, userAnswer: string): boolean {
  const candidate = normalize(userAnswer);
  if (candidate.length === 0) return false;
  const accepted = [question.answer, ...(question.accept ?? [])].map(normalize);
  return accepted.includes(candidate);
}

export const GRAMMAR_TRACK: Track = {
  id: "grammar",
  name: "Grammar",
  lessons: [
    {
      id: "g1",
      level: "B1",
      order: 1,
      title: "Present Perfect vs Past Simple",
      concept: "tenses",
      blurb: "When the time is finished vs. connected to now.",
      teach: {
        intro:
          "Use the past simple for finished actions at a specific past time. Use the present perfect for past actions with a present result or an unfinished time period.",
        points: [
          "Past simple + a finished time marker: yesterday, in 2019, last week, ago.",
          "Present perfect + already / yet / just / ever / never / for / since.",
          "If you say exactly when, use the past simple — not the present perfect.",
        ],
        examples: [
          { text: "I visited Rome in 2019.", note: "finished time → past simple" },
          {
            text: "I have visited Rome three times.",
            note: "experience, time unfinished → present perfect",
          },
          { text: "She has just finished the report.", note: "'just' → present perfect" },
        ],
      },
      questions: [
        {
          id: "g1q1",
          type: "mcq",
          concept: "tenses",
          prompt: "I ___ my keys this morning, but I found them later.",
          choices: ["have lost", "lost", "have losed", "am losing"],
          answer: "lost",
          explanation:
            "'this morning' (now finished) + a specific resolved event → past simple.",
          flashFront: "Finished past time marker (e.g. 'this morning, yesterday') → which tense?",
          flashBack: "Past simple. E.g. 'I lost my keys this morning.'",
        },
        {
          id: "g1q2",
          type: "mcq",
          concept: "tenses",
          prompt: "We ___ each other since university.",
          choices: ["know", "knew", "have known", "are knowing"],
          answer: "have known",
          explanation: "'since' marks a period running up to now → present perfect.",
          flashFront: "'since 2010' / 'for ten years' → which tense?",
          flashBack: "Present perfect: 'We have known each other since university.'",
        },
        {
          id: "g1q3",
          type: "cloze",
          concept: "tenses",
          prompt: "Type the present perfect of 'finish': She ___ the project. (just)",
          answer: "has just finished",
          accept: ["has finished"],
          explanation: "'just' signals a recent action with present relevance → present perfect.",
          flashFront: "Present perfect of 'finish' (3rd person) with 'just'",
          flashBack: "has just finished",
        },
        {
          id: "g1q4",
          type: "mcq",
          concept: "tenses",
          prompt: "___ you ever ___ sushi?",
          choices: ["Did / eat", "Have / eaten", "Have / ate", "Do / ate"],
          answer: "Have / eaten",
          explanation: "'ever' (life experience, unfinished time) → present perfect.",
          flashFront: "Asking about life experience with 'ever' → which tense?",
          flashBack: "Present perfect: 'Have you ever eaten…?'",
        },
        {
          id: "g1q5",
          type: "type",
          concept: "tenses",
          prompt:
            "Correct the verb: 'I have seen that film last night.' → 'I ___ that film last night.'",
          answer: "saw",
          explanation: "'last night' is a finished time → past simple, not present perfect.",
          flashFront: "'…last night' forces which past tense?",
          flashBack: "Past simple: 'I saw it last night.' (not 'have seen … last night')",
        },
        {
          id: "g1q6",
          type: "mcq",
          concept: "tenses",
          prompt: "He ___ his homework yet.",
          choices: ["hasn't done", "didn't do", "doesn't do", "hasn't did"],
          answer: "hasn't done",
          explanation: "'yet' → present perfect (negative): hasn't done.",
          flashFront: "'…yet' in a negative → which tense?",
          flashBack: "Present perfect: 'He hasn't done it yet.'",
        },
      ],
    },
    {
      id: "g2",
      level: "B1",
      order: 2,
      title: "Conditionals (0, 1 & 2)",
      concept: "conditionals",
      blurb: "Facts, real future possibilities, and unreal situations.",
      teach: {
        intro:
          "Zero conditional = general truths (if + present, present). First = real future possibility (if + present, will). Second = unreal/hypothetical present (if + past, would).",
        points: [
          "Zero: If you heat ice, it melts.",
          "First: If it rains, I will stay home.",
          "Second: If I had more time, I would travel.",
          "Never use 'will' or 'would' in the 'if' clause.",
        ],
        examples: [
          { text: "If you press this, the light turns on.", note: "zero — a fact" },
          { text: "If I get the job, I'll move to Berlin.", note: "first — real possibility" },
          { text: "If I were you, I'd apologise.", note: "second — hypothetical ('were')" },
        ],
      },
      questions: [
        {
          id: "g2q1",
          type: "mcq",
          concept: "conditionals",
          prompt: "If I ___ rich, I would buy an island.",
          choices: ["am", "was", "were", "will be"],
          answer: "were",
          explanation: "Second conditional (unreal). Standard form uses 'were' for all persons.",
          flashFront: "Second conditional 'if I ___ you' — correct verb?",
          flashBack: "'were' — If I were you… (hypothetical, all persons).",
        },
        {
          id: "g2q2",
          type: "mcq",
          concept: "conditionals",
          prompt: "If it ___ tomorrow, we'll cancel the picnic.",
          choices: ["rains", "will rain", "would rain", "rained"],
          answer: "rains",
          explanation: "First conditional: present simple in the 'if' clause, 'will' in the main clause.",
          flashFront: "First conditional 'if' clause uses which tense?",
          flashBack: "Present simple. 'If it rains, we will cancel.'",
        },
        {
          id: "g2q3",
          type: "cloze",
          concept: "conditionals",
          prompt: "Zero conditional: If you ___ (mix) blue and yellow, you get green.",
          answer: "mix",
          explanation: "Zero conditional uses present simple in both clauses for general truths.",
          flashFront: "Zero conditional verb form (general truth)?",
          flashBack: "Present simple in both clauses: 'If you mix…, you get…'",
        },
        {
          id: "g2q4",
          type: "type",
          concept: "conditionals",
          prompt: "Complete with 'would': If I knew her number, I ___ call her.",
          answer: "would",
          explanation: "Second conditional main clause: would + base verb.",
          flashFront: "Second conditional main clause modal?",
          flashBack: "would + base verb: 'I would call her.'",
        },
        {
          id: "g2q5",
          type: "mcq",
          concept: "conditionals",
          prompt: "Which sentence is correct?",
          choices: [
            "If I will see him, I'll tell him.",
            "If I see him, I'll tell him.",
            "If I would see him, I tell him.",
            "If I saw him, I will tell him.",
          ],
          answer: "If I see him, I'll tell him.",
          explanation: "First conditional: no 'will' in the 'if' clause.",
          flashFront: "Can you use 'will' in the 'if' clause?",
          flashBack: "No. 'If I see him, I'll tell him.' (not 'If I will see')",
        },
        {
          id: "g2q6",
          type: "mcq",
          concept: "conditionals",
          prompt: "If she ___ harder, she would pass the exam.",
          choices: ["studies", "studied", "study", "will study"],
          answer: "studied",
          explanation: "Second conditional: past simple in the 'if' clause for an unreal present.",
          flashFront: "Second conditional 'if' clause tense?",
          flashBack: "Past simple: 'If she studied harder…' (unreal present)",
        },
      ],
    },
    {
      id: "g3",
      level: "B1",
      order: 3,
      title: "Articles: a / an / the / —",
      concept: "articles",
      blurb: "Choosing the right article (or none at all).",
      teach: {
        intro:
          "Use 'a/an' for a non-specific singular countable noun (first mention). Use 'the' when it's specific or already known. Use no article for general plural/uncountable nouns.",
        points: [
          "First mention → a/an; second mention → the.",
          "'the' for unique things: the sun, the internet.",
          "No article for general ideas: 'I like music', 'Cats are independent'.",
          "'an' before a vowel sound: an hour, a university.",
        ],
        examples: [
          { text: "I saw a dog. The dog was huge.", note: "a (new) → the (known)" },
          { text: "She plays the piano.", note: "instruments take 'the'" },
          { text: "Water is essential.", note: "general uncountable → no article" },
        ],
      },
      questions: [
        {
          id: "g3q1",
          type: "mcq",
          concept: "articles",
          prompt: "I need ___ umbrella; it's raining.",
          choices: ["a", "an", "the", "—"],
          answer: "an",
          explanation: "'umbrella' starts with a vowel sound → 'an'.",
          flashFront: "a or an before 'umbrella'?",
          flashBack: "an umbrella (vowel sound).",
        },
        {
          id: "g3q2",
          type: "mcq",
          concept: "articles",
          prompt: "She works at ___ university in Boston.",
          choices: ["a", "an", "the", "—"],
          answer: "a",
          explanation: "'university' starts with a /j/ (consonant) sound → 'a'.",
          flashFront: "a or an before 'university'?",
          flashBack: "a university (/j/ consonant sound).",
        },
        {
          id: "g3q3",
          type: "cloze",
          concept: "articles",
          prompt: "Type the article (or 'no'): ___ honesty is important. ",
          answer: "no",
          accept: ["no article", "none", "-", "—"],
          explanation: "General uncountable noun → no article.",
          flashFront: "Article before a general uncountable noun ('honesty')?",
          flashBack: "No article: 'Honesty is important.'",
        },
        {
          id: "g3q4",
          type: "mcq",
          concept: "articles",
          prompt: "We watched a film. ___ film was excellent.",
          choices: ["A", "An", "The", "—"],
          answer: "The",
          explanation: "Second mention of a known thing → 'the'.",
          flashFront: "Article on second mention of a known noun?",
          flashBack: "the — 'The film was excellent.'",
        },
        {
          id: "g3q5",
          type: "mcq",
          concept: "articles",
          prompt: "Can you play ___ guitar?",
          choices: ["a", "an", "the", "—"],
          answer: "the",
          explanation: "Musical instruments usually take 'the'.",
          flashFront: "Article before a musical instrument?",
          flashBack: "the — 'play the guitar/piano'.",
        },
        {
          id: "g3q6",
          type: "type",
          concept: "articles",
          prompt: "Fill the blank: ___ Earth orbits the Sun.",
          answer: "the",
          explanation: "Unique objects take 'the': the Earth, the Sun.",
          flashFront: "Article before unique objects (Earth, Sun)?",
          flashBack: "the — 'the Earth', 'the Sun'.",
        },
      ],
    },
    {
      id: "g4",
      level: "B2",
      order: 4,
      title: "Gerunds vs Infinitives",
      concept: "verb-patterns",
      blurb: "-ing or 'to' after another verb?",
      teach: {
        intro:
          "Some verbs are followed by a gerund (-ing), others by an infinitive (to + verb). A few change meaning depending on which you choose.",
        points: [
          "Gerund after: enjoy, avoid, finish, suggest, mind, keep, consider.",
          "Infinitive after: want, decide, hope, agree, plan, offer, promise.",
          "After prepositions, always use the gerund: 'good at singing'.",
          "'stop to do' (purpose) vs 'stop doing' (cease) change meaning.",
        ],
        examples: [
          { text: "I enjoy reading.", note: "enjoy + gerund" },
          { text: "She decided to leave.", note: "decide + infinitive" },
          { text: "He stopped smoking.", note: "ceased the activity" },
        ],
      },
      questions: [
        {
          id: "g4q1",
          type: "mcq",
          concept: "verb-patterns",
          prompt: "I really enjoy ___ to live music.",
          choices: ["listen", "to listen", "listening", "listened"],
          answer: "listening",
          explanation: "'enjoy' is always followed by a gerund (-ing).",
          flashFront: "enjoy + ?",
          flashBack: "gerund (-ing): 'enjoy listening'.",
        },
        {
          id: "g4q2",
          type: "mcq",
          concept: "verb-patterns",
          prompt: "They decided ___ the meeting.",
          choices: ["postponing", "to postpone", "postpone", "postponed"],
          answer: "to postpone",
          explanation: "'decide' takes the infinitive (to + verb).",
          flashFront: "decide + ?",
          flashBack: "infinitive (to + verb): 'decide to postpone'.",
        },
        {
          id: "g4q3",
          type: "cloze",
          concept: "verb-patterns",
          prompt: "After a preposition: She's good at ___ (solve) problems.",
          answer: "solving",
          explanation: "After a preposition ('at'), use the gerund.",
          flashFront: "Verb form after a preposition?",
          flashBack: "gerund: 'good at solving'.",
        },
        {
          id: "g4q4",
          type: "mcq",
          concept: "verb-patterns",
          prompt: "We should avoid ___ assumptions.",
          choices: ["to make", "making", "make", "made"],
          answer: "making",
          explanation: "'avoid' + gerund.",
          flashFront: "avoid + ?",
          flashBack: "gerund: 'avoid making'.",
        },
        {
          id: "g4q5",
          type: "type",
          concept: "verb-patterns",
          prompt: "Use the correct form of 'go': I want ___ home. (to + verb)",
          answer: "to go",
          explanation: "'want' takes the infinitive.",
          flashFront: "want + ?",
          flashBack: "infinitive: 'want to go'.",
        },
        {
          id: "g4q6",
          type: "mcq",
          concept: "verb-patterns",
          prompt: "On the drive, we stopped ___ a coffee. (purpose)",
          choices: ["drinking", "to drink", "drink", "drank"],
          answer: "to drink",
          explanation: "'stop to do' = stop in order to do something (purpose).",
          flashFront: "'stop to do' vs 'stop doing'?",
          flashBack: "'stop to do' = purpose; 'stop doing' = cease the activity.",
        },
      ],
    },
    {
      id: "g5",
      level: "B2",
      order: 5,
      title: "Relative Clauses",
      concept: "relative-clauses",
      blurb: "who, which, that, where — and when to drop them.",
      teach: {
        intro:
          "Relative clauses add information about a noun. Use 'who' for people, 'which' for things, 'that' for either (defining only), 'where' for places. Defining clauses take no commas; non-defining clauses use commas and cannot use 'that'.",
        points: [
          "Defining (essential, no commas): 'The man who called is my boss.'",
          "Non-defining (extra info, commas): 'My boss, who is 40, called.'",
          "You can omit the relative pronoun when it's the object: 'the book (that) I read'.",
          "Don't use 'that' in a non-defining clause.",
        ],
        examples: [
          { text: "The phone that I bought broke.", note: "defining, object → 'that' optional" },
          { text: "Paris, which I love, is busy.", note: "non-defining → commas, 'which'" },
          { text: "That's the café where we met.", note: "place → 'where'" },
        ],
      },
      questions: [
        {
          id: "g5q1",
          type: "mcq",
          concept: "relative-clauses",
          prompt: "The scientist ___ discovered this won a prize.",
          choices: ["which", "who", "where", "whom"],
          answer: "who",
          explanation: "Subject + person → 'who'.",
          flashFront: "Relative pronoun for a person (subject)?",
          flashBack: "who — 'the scientist who discovered…'.",
        },
        {
          id: "g5q2",
          type: "mcq",
          concept: "relative-clauses",
          prompt: "This is the laptop ___ I told you about.",
          choices: ["who", "where", "which", "whose"],
          answer: "which",
          explanation: "A thing → 'which' (or 'that'). 'who' is for people.",
          flashFront: "Relative pronoun for a thing?",
          flashBack: "which / that — 'the laptop which/that…'.",
        },
        {
          id: "g5q3",
          type: "mcq",
          concept: "relative-clauses",
          prompt: "Which is a correct non-defining clause?",
          choices: [
            "My brother that lives in Spain called.",
            "My brother, who lives in Spain, called.",
            "My brother, that lives in Spain, called.",
            "My brother which lives in Spain called.",
          ],
          answer: "My brother, who lives in Spain, called.",
          explanation: "Non-defining clauses use commas and 'who/which' — never 'that'.",
          flashFront: "Can you use 'that' in a non-defining clause?",
          flashBack: "No — use who/which with commas.",
        },
        {
          id: "g5q4",
          type: "cloze",
          concept: "relative-clauses",
          prompt: "Place: That's the town ___ I grew up.",
          answer: "where",
          explanation: "Reference to a place → 'where'.",
          flashFront: "Relative word for a place?",
          flashBack: "where — 'the town where I grew up'.",
        },
        {
          id: "g5q5",
          type: "mcq",
          concept: "relative-clauses",
          prompt: "In which sentence can the relative pronoun be omitted?",
          choices: [
            "The woman who lives next door is a vet.",
            "The book that I read was great.",
            "The road that leads north is closed.",
            "The student who won is here.",
          ],
          answer: "The book that I read was great.",
          explanation: "You can drop the pronoun only when it's the object of the clause.",
          flashFront: "When can you omit the relative pronoun?",
          flashBack: "When it's the object: 'the book (that) I read'.",
        },
        {
          id: "g5q6",
          type: "type",
          concept: "relative-clauses",
          prompt: "Possession: The author ___ book won the prize is here. (one word)",
          answer: "whose",
          explanation: "Possessive relative pronoun → 'whose'.",
          flashFront: "Possessive relative pronoun?",
          flashBack: "whose — 'the author whose book…'.",
        },
      ],
    },
  ],
};
