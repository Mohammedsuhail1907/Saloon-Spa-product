import { Offer } from '../models/catalog.model';

/** Demo offers. Replace with `GET /offers` when an API exists. */
export const OFFERS: Offer[] = [
  {
    id: 1, title: 'Bridal Glow Package',
    description: 'Bridal artistry trial, premium glow facial and luxury manicure — one seamless day.',
    price: 5999, originalPrice: 7499, savings: 1500, validity: 'Valid till end of the month',
    type: 'SALON', tag: 'Most Loved', art: 'art-rose', icon: 'pi pi-heart-fill', serviceId: 5
  },
  {
    id: 2, title: 'Weekday Wellness Hour',
    description: 'Swedish massage plus aroma steam, Monday to Thursday before 2 PM.',
    price: 1699, originalPrice: 2199, savings: 500, validity: 'Weekdays only',
    type: 'SPA', art: 'art-sage', icon: 'pi pi-moon', serviceId: 11
  },
  {
    id: 3, title: 'First Visit Glow',
    description: 'Your first Premium Glow Facial with us, with a skin consultation included.',
    price: 1499, originalPrice: 1999, savings: 500, validity: 'New guests only',
    type: 'SALON', tag: 'New Guests', art: 'art-gold', icon: 'pi pi-sun', serviceId: 7
  },
  {
    id: 4, title: 'Couples Serenity Evening',
    description: 'The Couples Retreat with extended relaxation lounge access after 6 PM.',
    price: 4999, originalPrice: 5999, savings: 1000, validity: 'Evenings, Fri–Sat',
    type: 'SPA', tag: 'Limited', art: 'art-moss', icon: 'pi pi-users', serviceId: 16
  }
];
