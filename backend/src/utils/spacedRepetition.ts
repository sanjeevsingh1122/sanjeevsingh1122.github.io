import dayjs from 'dayjs';
import { FlashcardRating } from '@prisma/client';

type CardState = {
  easeScore: number;
  interval: number;
  reviews: number;
};

type Update = CardState & { nextDue: Date; lastRating: FlashcardRating };

const ratingMap: Record<FlashcardRating, number> = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};

export function scheduleCard(state: CardState, rating: FlashcardRating): Update {
  const grade = ratingMap[rating];
  let ease = state.easeScore || 2.5;
  let interval = state.interval || 1;
  let reviews = state.reviews || 0;

  if (grade < 3) {
    reviews = 0;
    interval = 1;
  } else {
    ease = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (ease < 1.3) ease = 1.3;

    if (reviews === 0) {
      interval = 1;
    } else if (reviews === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease);
    }
    reviews += 1;
  }

  const nextDue = dayjs().add(interval, 'day').toDate();
  return { easeScore: ease, interval, reviews, nextDue, lastRating: rating };
}
