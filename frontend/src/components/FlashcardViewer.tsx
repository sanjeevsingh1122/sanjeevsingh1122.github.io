import React from 'react';
import { Flashcard } from '../types';
import './flashcard-viewer.css';

type Props = {
  card?: Flashcard;
  onRate: (rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => void;
};

const FlashcardViewer: React.FC<Props> = ({ card, onRate }) => {
  if (!card) return <div className="flashcard">No cards due 🎉</div>;
  return (
    <div className="flashcard">
      <h3>Question</h3>
      <p>{card.question}</p>
      <h4>Answer</h4>
      <p>{card.answer}</p>
      <div className="flashcard-actions">
        {(['AGAIN', 'HARD', 'GOOD', 'EASY'] as const).map((rating) => (
          <button key={rating} onClick={() => onRate(rating)}>
            {rating}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FlashcardViewer;
