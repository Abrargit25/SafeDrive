import { scoreLabel } from '@/theme/colors';

export class RatingEngine {
  getRating(score: number) {
    return scoreLabel(score);
  }
}
