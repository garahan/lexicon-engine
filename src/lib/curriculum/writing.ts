import type { Track } from "./types";

/**
 * Writing lessons use the "writing" question type: the learner composes a
 * short answer, reveals a model answer + a checklist of target features, then
 * self-rates whether they hit it. (No live AI grading in this phase.)
 */
export const WRITING_TRACK: Track = {
  id: "writing",
  name: "Writing",
  tagline: "Compose, compare to a model, and self-rate.",
  icon: "PenLine",
  lessons: [
    {
      id: "w1",
      level: "B1",
      order: 1,
      title: "Linking Ideas Clearly",
      concept: "linking",
      blurb: "Use connectors to join sentences smoothly.",
      teach: {
        intro:
          "Good writing connects ideas with the right linkers: addition (and, moreover), contrast (but, however), reason (because, since), result (so, therefore).",
        points: [
          "Contrast: however, although, whereas.",
          "Reason: because, since, as.",
          "Result: so, therefore, as a result.",
          "Avoid starting every sentence the same way.",
        ],
        examples: [
          { text: "It was raining; however, we went out.", note: "contrast linker" },
          { text: "We left early because the roads were icy.", note: "reason linker" },
        ],
      },
      questions: [
        {
          id: "w1q1",
          type: "mcq",
          concept: "linking",
          prompt: "Choose the contrast linker: 'It was cheap; ___, the quality was poor.'",
          choices: ["therefore", "however", "because", "so"],
          answer: "however",
          explanation: "'however' signals contrast.",
          flashFront: "Linker for contrast?",
          flashBack: "however / although / whereas",
        },
        {
          id: "w1q2",
          type: "mcq",
          concept: "linking",
          prompt: "Choose the result linker: 'The road was closed, ___ we took a detour.'",
          choices: ["although", "so", "whereas", "despite"],
          answer: "so",
          explanation: "'so' introduces a result.",
          flashFront: "Linker for result?",
          flashBack: "so / therefore / as a result",
        },
        {
          id: "w1q3",
          type: "writing",
          concept: "linking",
          prompt:
            "Write 2–3 sentences about why you are learning English. Use at least one reason linker (because/since) and one result linker (so/therefore).",
          answer: "",
          model:
            "I am learning English because it opens up career opportunities abroad. Many of the books and courses I want to read are in English, so improving my level is essential. Therefore, I practise a little every day.",
          checklist: [
            "Uses a reason linker (because / since / as)",
            "Uses a result linker (so / therefore / as a result)",
            "2–3 clear, connected sentences",
            "No run-on sentences",
          ],
          explanation: "Strong answers connect ideas with explicit reason and result linkers.",
          flashFront: "Name a reason linker and a result linker.",
          flashBack: "Reason: because/since. Result: so/therefore.",
        },
        {
          id: "w1q4",
          type: "cloze",
          concept: "linking",
          prompt: "Reason linker (one word): 'I stayed home ___ I felt ill.'",
          answer: "because",
          accept: ["since", "as"],
          explanation: "'because/since/as' give a reason.",
          flashFront: "One-word reason linker?",
          flashBack: "because (since / as)",
        },
        {
          id: "w1q5",
          type: "writing",
          concept: "linking",
          prompt:
            "Write 2–3 sentences describing your typical morning. Use one contrast linker (however/although) and vary your sentence openings.",
          answer: "",
          model:
            "I usually wake up early and go for a short walk. Although I am not a morning person, the fresh air helps me feel alert. However, on weekends I prefer to sleep in and start the day slowly.",
          checklist: [
            "Uses a contrast linker (however / although / whereas)",
            "Sentence openings are varied",
            "2–3 connected sentences",
            "Clear and grammatical",
          ],
          explanation: "Vary openings and use contrast linkers to avoid monotony.",
          flashFront: "Two contrast linkers?",
          flashBack: "however, although (also whereas)",
        },
      ],
    },
    {
      id: "w2",
      level: "B2",
      order: 2,
      title: "Opinion Paragraphs",
      concept: "opinion-writing",
      blurb: "State a clear position and support it.",
      teach: {
        intro:
          "An opinion paragraph states a clear position, gives a reason, supports it with an example, and concludes. Use signposting phrases.",
        points: [
          "Position: 'In my view…', 'I would argue that…'.",
          "Support: 'For instance…', 'This is because…'.",
          "Concession: 'Admittedly…', 'While it is true that…'.",
          "Conclusion: 'For these reasons…', 'Overall…'.",
        ],
        examples: [
          { text: "In my view, public transport should be free.", note: "clear position" },
          { text: "For instance, it would reduce traffic.", note: "supporting example" },
        ],
      },
      questions: [
        {
          id: "w2q1",
          type: "mcq",
          concept: "opinion-writing",
          prompt: "Which phrase best signposts a concession?",
          choices: ["For instance", "Admittedly", "Therefore", "In my view"],
          answer: "Admittedly",
          explanation: "'Admittedly' concedes an opposing point before responding.",
          flashFront: "Phrase to concede a point?",
          flashBack: "Admittedly / While it is true that…",
        },
        {
          id: "w2q2",
          type: "writing",
          concept: "opinion-writing",
          prompt:
            "Write a short opinion paragraph (4–5 sentences): 'Should homework be abolished?' State a position, give a reason and an example, add a concession, and conclude.",
          answer: "",
          model:
            "In my view, homework should not be abolished, but it should be reduced. This is because a small amount of independent practice helps students consolidate what they learn in class. For instance, reviewing vocabulary at home makes lessons more productive. Admittedly, excessive homework can cause stress and reduce free time. Overall, the solution is better-quality homework, not its complete removal.",
          checklist: [
            "States a clear position",
            "Gives a reason and a concrete example",
            "Includes a concession (Admittedly / While…)",
            "Has a concluding sentence (Overall / For these reasons)",
          ],
          explanation: "A strong opinion paragraph signposts position, support, concession, conclusion.",
          flashFront: "Four parts of an opinion paragraph?",
          flashBack: "Position → reason/example → concession → conclusion.",
        },
        {
          id: "w2q3",
          type: "cloze",
          concept: "opinion-writing",
          prompt: "Concluding signpost (one word): '___, the benefits outweigh the costs.'",
          answer: "overall",
          accept: ["therefore", "ultimately"],
          explanation: "'Overall / Ultimately' signals a conclusion.",
          flashFront: "One-word concluding signpost?",
          flashBack: "Overall / Ultimately",
        },
        {
          id: "w2q4",
          type: "writing",
          concept: "opinion-writing",
          prompt:
            "Write 3–4 sentences: 'Is it better to live in a city or the countryside?' Take a position and support it with two reasons.",
          answer: "",
          model:
            "I would argue that living in a city is preferable for most young people. Firstly, cities offer far more job opportunities and cultural events. Secondly, public transport makes it easy to get around without a car. While the countryside is quieter, the advantages of city life are more relevant at this stage of my career.",
          checklist: [
            "Clear position stated early",
            "At least two distinct reasons",
            "Uses signposting (Firstly, Secondly…)",
            "Acknowledges the other side briefly",
          ],
          explanation: "Order reasons with signposts and acknowledge the alternative.",
          flashFront: "Two signposts to order reasons?",
          flashBack: "Firstly… Secondly… (also Moreover)",
        },
      ],
    },
  ],
};
