"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { checkAnswer, type Question } from "@/lib/curriculum";
import { playCorrect, playWrong } from "@/lib/feedback";

interface Props {
  question: Question;
  /** Reports the result to the parent and returns XP gained for the float. */
  onAnswer: (correct: boolean) => number;
  onNext: () => void;
}

export default function QuizCard({ question, onAnswer, onNext }: Props) {
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const isChoice = question.type === "mcq";
  const isWriting = question.type === "writing";

  function gradeSelfRated(ok: boolean) {
    if (submitted) return;
    const xp = onAnswer(ok);
    setCorrect(ok);
    setXpGain(xp);
    setSubmitted(true);
    if (ok) playCorrect();
    else playWrong();
  }

  function grade(answer: string) {
    if (submitted) return;
    const ok = isChoice ? answer === question.answer : checkAnswer(question, answer);
    const xp = onAnswer(ok);
    setCorrect(ok);
    setXpGain(xp);
    setSubmitted(true);
    if (ok) playCorrect();
    else playWrong();
  }

  const canSubmit = isChoice ? selected !== null : value.trim().length > 0;

  if (isWriting) {
    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="flex flex-col gap-5"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-grape-500">
          Write your answer
        </p>
        <h2 className="text-xl font-bold leading-snug text-ink">{question.prompt}</h2>

        <textarea
          autoFocus
          value={value}
          disabled={revealed}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Compose a few sentences…"
          rows={5}
          className={`w-full resize-none rounded-2xl border-2 bg-white px-4 py-3.5 text-base font-medium leading-relaxed outline-none transition-colors ${
            revealed ? "border-black/10 opacity-70" : "border-black/10 focus:border-grape-500"
          }`}
        />

        {!revealed ? (
          <button
            disabled={!canSubmit}
            onClick={() => setRevealed(true)}
            className="w-full rounded-2xl bg-grape-500 py-3.5 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98] disabled:opacity-40"
          >
            Reveal model answer
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="rounded-2xl bg-cream px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-grape-500">
                  Model answer
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-ink/85">{question.model}</p>
              </div>

              {question.checklist && (
                <div className="rounded-2xl bg-white px-4 py-3 shadow-soft">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/50">
                    Did your answer…
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {question.checklist.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-ink/80">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mint-500" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!submitted ? (
                <div className="flex flex-col gap-2">
                  <p className="text-center text-sm font-semibold text-ink/60">
                    Honestly, how did you do?
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => gradeSelfRated(false)}
                      className="flex-1 rounded-2xl border-2 border-black/10 bg-white py-3 text-sm font-bold text-ink/70 transition-all active:scale-[0.97]"
                    >
                      Missed some
                    </button>
                    <button
                      onClick={() => gradeSelfRated(true)}
                      className="flex-1 rounded-2xl bg-mint-500 py-3 text-sm font-bold text-white shadow-soft transition-all active:scale-[0.97]"
                    >
                      Nailed it
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`relative rounded-2xl p-4 ${correct ? "bg-mint-400/15" : "bg-brand-50"}`}>
                  <p className={`font-bold ${correct ? "text-mint-600" : "text-brand-600"}`}>
                    {correct ? "Great — banked it!" : "Noted — we'll revisit this."}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{question.explanation}</p>
                  <button
                    onClick={onNext}
                    className={`mt-3 w-full rounded-2xl py-3 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98] ${
                      correct ? "bg-mint-500" : "bg-brand-500"
                    }`}
                  >
                    Continue
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: 1,
        y: 0,
        x: submitted && !correct ? [0, -6, 6, -4, 4, 0] : 0,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="flex flex-col gap-5"
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-grape-500">
        {question.type === "mcq"
          ? "Choose the answer"
          : question.type === "cloze"
            ? "Fill the gap"
            : "Type the answer"}
      </p>
      <h2 className="text-xl font-bold leading-snug text-ink">{question.prompt}</h2>

      {isChoice ? (
        <div className="flex flex-col gap-2.5">
          {question.choices!.map((choice) => {
            const isCorrectChoice = choice === question.answer;
            const isPicked = selected === choice;
            let cls =
              "border-black/10 bg-white hover:border-grape-400 active:scale-[0.98]";
            if (submitted) {
              if (isCorrectChoice) cls = "border-mint-500 bg-mint-400/15 text-mint-600";
              else if (isPicked) cls = "border-brand-500 bg-brand-50 text-brand-600";
              else cls = "border-black/5 bg-white opacity-50";
            } else if (isPicked) {
              cls = "border-grape-500 bg-grape-400/10";
            }
            return (
              <button
                key={choice}
                disabled={submitted}
                onClick={() => {
                  setSelected(choice);
                  grade(choice);
                }}
                className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left text-base font-semibold transition-all ${cls}`}
              >
                <span>{choice}</span>
                {submitted && isCorrectChoice && <Check size={18} className="text-mint-600" />}
                {submitted && isPicked && !isCorrectChoice && (
                  <X size={18} className="text-brand-600" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) grade(value);
          }}
        >
          <input
            autoFocus
            value={value}
            disabled={submitted}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type here…"
            className={`w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-base font-semibold outline-none transition-colors ${
              submitted
                ? correct
                  ? "border-mint-500"
                  : "border-brand-500"
                : "border-black/10 focus:border-grape-500"
            }`}
          />
          {!submitted && (
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-3 w-full rounded-2xl bg-grape-500 py-3.5 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98] disabled:opacity-40"
            >
              Check
            </button>
          )}
        </form>
      )}

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-2xl p-4 ${
              correct ? "bg-mint-400/15" : "bg-brand-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {correct ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-mint-500 text-white"
                >
                  <Check size={15} />
                </motion.span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
                  <X size={15} />
                </span>
              )}
              <span
                className={`font-bold ${correct ? "text-mint-600" : "text-brand-600"}`}
              >
                {correct ? "Correct!" : "Not quite"}
              </span>
              {!correct && (
                <span className="text-sm font-semibold text-ink/70">
                  → {question.answer}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
              {question.explanation}
            </p>

            <AnimatePresence>
              {correct && xpGain > 0 && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -46 }}
                  transition={{ duration: 0.9 }}
                  className="absolute right-4 top-3 text-lg font-extrabold text-grape-500"
                >
                  +{xpGain}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={onNext}
              className={`mt-3 w-full rounded-2xl py-3 text-base font-bold text-white shadow-soft transition-all active:scale-[0.98] ${
                correct ? "bg-mint-500" : "bg-brand-500"
              }`}
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
