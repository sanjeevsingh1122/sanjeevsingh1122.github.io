import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import './quiz-runner.css';

type Props = {
  questions: QuizQuestion[];
  onSubmit: (answers: number[]) => Promise<void>;
};

const QuizRunner: React.FC<Props> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const choose = (index: number, choice: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = choice;
      return next;
    });
  };

  const submit = async () => {
    setSubmitting(true);
    await onSubmit(answers);
    setResult('Submitted! Review analytics on the progress page.');
    setSubmitting(false);
  };

  return (
    <div className="quiz-runner">
      {questions.map((question, idx) => (
        <article key={question.id}>
          <h4>
            {idx + 1}. {question.question}
          </h4>
          <div className="choices">
            {question.choices.map((choice, choiceIdx) => (
              <label key={choiceIdx} className={answers[idx] === choiceIdx ? 'selected' : ''}>
                <input type="radio" checked={answers[idx] === choiceIdx} onChange={() => choose(idx, choiceIdx)} />
                {choice}
              </label>
            ))}
          </div>
        </article>
      ))}
      <button disabled={submitting} onClick={submit}>
        {submitting ? 'Submitting...' : 'Submit quiz'}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
};

export default QuizRunner;
