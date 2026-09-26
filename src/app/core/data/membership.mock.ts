import { GiftCardExperience, MembershipPlan } from '../models/catalog.model';

/** Demo membership plans. Replace with `GET /memberships` when an API exists. */
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 1, name: 'Essential Care', pricePerMonth: 1499,
    perks: ['1 hair treatment monthly', '1 express facial monthly', '5% off products', 'Priority weekday slots']
  },
  {
    id: 2, name: 'Signature Self-Care', pricePerMonth: 2999, highlight: true, tag: 'Most Loved',
    perks: ['2 hair treatments monthly', '1 facial monthly', '1 spa session monthly', '10% off products', 'Priority booking']
  },
  {
    id: 3, name: 'Elite Ritual', pricePerMonth: 4999,
    perks: ['Unlimited blow-drys', '2 facials monthly', '2 spa sessions monthly', '15% off products', 'Dedicated concierge', 'Guest passes']
  }
];

export const GIFT_CARD_AMOUNTS = [1000, 2500, 5000];

export const GIFT_CARD_EXPERIENCES: GiftCardExperience[] = [
  { id: 'salon', label: 'Salon Experience', type: 'SALON' },
  { id: 'spa', label: 'Spa Experience', type: 'SPA' },
  { id: 'combined', label: 'Combined Experience', type: 'BOTH' }
];
