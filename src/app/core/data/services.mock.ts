import { Service, ServiceCategory } from '../models/catalog.model';

/**
 * Demo catalogue. Structured to be replaced 1:1 by `GET /services`
 * and `GET /service-categories` once a backend exists.
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'hair', label: 'Hair', type: 'SALON', icon: 'pi pi-sparkles' },
  { id: 'makeup', label: 'Makeup', type: 'SALON', icon: 'pi pi-palette' },
  { id: 'skin', label: 'Skin Care', type: 'SALON', icon: 'pi pi-sun' },
  { id: 'nails', label: 'Nails', type: 'SALON', icon: 'pi pi-star' },
  { id: 'massage', label: 'Massage', type: 'SPA', icon: 'pi pi-heart' },
  { id: 'body', label: 'Body Rituals', type: 'SPA', icon: 'pi pi-moon' },
  { id: 'wellness', label: 'Wellness', type: 'SPA', icon: 'pi pi-asterisk' }
];

export const SERVICES: Service[] = [
  {
    id: 1,
    name: 'Signature Haircut & Finish',
    description: 'A consultation-led cut tailored to your face shape, finished with a soft blow-dry.',
    category: 'hair', type: 'SALON', duration: 45, price: 899, rating: 4.8, popular: true,
    tags: ['hair', 'self-care'],
    benefits: ['Personalised consultation', 'Precision cut', 'Styling finish'],
    professionalIds: [1, 2], art: 'art-gold', icon: 'pi pi-sparkles'
  },
  {
    id: 2,
    name: 'Balayage & Gloss',
    description: 'Hand-painted dimension with a mirror gloss, matched to your skin tone.',
    category: 'hair', type: 'SALON', duration: 120, price: 4999, rating: 4.9, popular: true,
    tags: ['hair', 'occasion'],
    benefits: ['Custom colour map', 'Bond-protecting formula', 'Gloss finish'],
    professionalIds: [1], art: 'art-rose', icon: 'pi pi-palette'
  },
  {
    id: 3,
    name: 'Hair Spa Ritual',
    description: 'Deep-conditioning masque with a pressure-point scalp massage.',
    category: 'hair', type: 'SALON', duration: 60, price: 1499, rating: 4.7,
    tags: ['hair', 'relax', 'self-care'],
    benefits: ['Deep hydration', 'Scalp renewal', 'Stress relief'],
    professionalIds: [1, 2], art: 'art-sand', icon: 'pi pi-sparkles'
  },
  {
    id: 4,
    name: 'Keratin Smoothening',
    description: 'Frizz-taming keratin therapy for glassy, manageable hair that lasts.',
    category: 'hair', type: 'SALON', duration: 150, price: 6999, rating: 4.6,
    tags: ['hair'],
    benefits: ['Up to 4 months smoothness', 'Humidity protection', 'Shine boost'],
    professionalIds: [2], art: 'art-stone', icon: 'pi pi-bolt'
  },
  {
    id: 5,
    name: 'Bridal Artistry',
    description: 'Complete bridal look — airbrushed base, eyes, draping and touch-up kit.',
    category: 'makeup', type: 'SALON', duration: 180, price: 15000, rating: 5.0, popular: true,
    tags: ['occasion', 'glow'],
    benefits: ['Trial session included', 'HD & airbrush options', 'On-day touch-up kit'],
    professionalIds: [3], art: 'art-blush', icon: 'pi pi-heart-fill'
  },
  {
    id: 6,
    name: 'Soirée Makeup',
    description: 'A luminous evening look calibrated for photographs and candlelight.',
    category: 'makeup', type: 'SALON', duration: 90, price: 3499, rating: 4.8, isNew: true,
    tags: ['occasion', 'glow'],
    benefits: ['Skin-prep facial massage', 'Long-wear formulas', 'Lash styling'],
    professionalIds: [3], art: 'art-rose', icon: 'pi pi-star-fill'
  },
  {
    id: 7,
    name: 'Premium Glow Facial',
    description: 'Vitamin-rich brightening facial with lymphatic sculpting massage.',
    category: 'skin', type: 'SALON', duration: 90, price: 1999, rating: 4.9, popular: true,
    tags: ['glow', 'self-care'],
    benefits: ['Instant luminosity', 'Lymphatic drainage', 'Deep hydration'],
    professionalIds: [4, 7], art: 'art-gold', icon: 'pi pi-sun'
  },
  {
    id: 8,
    name: 'Hydra Dew Facial',
    description: 'Hyaluronic quenching facial for tired, dehydrated skin.',
    category: 'skin', type: 'SALON', duration: 60, price: 1799, rating: 4.7, isNew: true,
    tags: ['glow', 'self-care'],
    benefits: ['72h hydration', 'Plumped fine lines', 'Barrier repair'],
    professionalIds: [4], art: 'art-pearl', icon: 'pi pi-cloud'
  },
  {
    id: 9,
    name: 'Luxury Manicure',
    description: 'Cuticle care, shaping, massage and a chip-resistant polish.',
    category: 'nails', type: 'SALON', duration: 60, price: 1199, rating: 4.6,
    tags: ['nails', 'self-care'],
    benefits: ['Nail health assessment', 'Hand massage', 'Premium polish'],
    professionalIds: [5], art: 'art-blush', icon: 'pi pi-star'
  },
  {
    id: 10,
    name: 'Gel Art Studio',
    description: 'Sculpted gel extensions with bespoke nail art by our resident artist.',
    category: 'nails', type: 'SALON', duration: 75, price: 1599, rating: 4.8, isNew: true,
    tags: ['nails', 'occasion'],
    benefits: ['3-week wear', 'Custom art', 'Strengthening base'],
    professionalIds: [5], art: 'art-sage', icon: 'pi pi-palette'
  },
  {
    id: 11,
    name: 'Swedish Massage',
    description: 'Classic long-stroke massage to ease tension and restore circulation.',
    category: 'massage', type: 'SPA', duration: 60, price: 2199, rating: 4.8, popular: true,
    tags: ['relax', 'wellness'],
    benefits: ['Muscle relaxation', 'Improved circulation', 'Better sleep'],
    professionalIds: [6, 8], art: 'art-sage', icon: 'pi pi-heart'
  },
  {
    id: 12,
    name: 'Deep Tissue Massage',
    description: 'Focused, slow-pressure work on stubborn knots and chronic tension.',
    category: 'massage', type: 'SPA', duration: 60, price: 1999, rating: 4.9, popular: true,
    tags: ['relax', 'wellness'],
    benefits: ['Knot release', 'Posture relief', 'Recovery boost'],
    professionalIds: [6], art: 'art-moss', icon: 'pi pi-bolt'
  },
  {
    id: 13,
    name: 'Aromatherapy Journey',
    description: 'A sensory ritual with cold-pressed essential oil blends chosen for your mood.',
    category: 'massage', type: 'SPA', duration: 45, price: 1499, rating: 4.7,
    tags: ['relax', 'self-care'],
    benefits: ['Mood-matched oils', 'Calmed nervous system', 'Gentle release'],
    professionalIds: [8], art: 'art-pearl', icon: 'pi pi-sparkles'
  },
  {
    id: 14,
    name: 'Full Body Relaxation Ritual',
    description: 'Ninety unhurried minutes of head-to-toe warmth, pressure and stillness.',
    category: 'body', type: 'SPA', duration: 90, price: 2999, rating: 4.9, popular: true,
    tags: ['relax', 'wellness', 'self-care'],
    benefits: ['Aromatherapy', 'Head massage', 'Full body massage'],
    professionalIds: [6, 8], art: 'art-gold', icon: 'pi pi-moon'
  },
  {
    id: 15,
    name: 'Herbal Scrub & Wrap',
    description: 'Warm herbal exfoliation followed by a mineral-rich cocoon wrap.',
    category: 'body', type: 'SPA', duration: 75, price: 2499, rating: 4.6,
    tags: ['glow', 'wellness'],
    benefits: ['Silky skin', 'Detox minerals', 'Deep warmth'],
    professionalIds: [8], art: 'art-sand', icon: 'pi pi-sun'
  },
  {
    id: 16,
    name: 'Couples Retreat',
    description: 'A shared suite, synchronised therapists and herbal tea to finish.',
    category: 'body', type: 'SPA', duration: 90, price: 5999, rating: 4.8,
    tags: ['relax', 'occasion'],
    benefits: ['Private suite', 'Two therapists', 'Herbal tea ceremony'],
    professionalIds: [6, 8], art: 'art-rose', icon: 'pi pi-users'
  },
  {
    id: 17,
    name: 'Head, Neck & Shoulder Release',
    description: 'A precise thirty-minute reset for desk-weary shoulders.',
    category: 'wellness', type: 'SPA', duration: 30, price: 999, rating: 4.7,
    tags: ['relax', 'wellness'],
    benefits: ['Tension headache relief', 'Instant lightness', 'Quick reset'],
    professionalIds: [6, 8], art: 'art-stone', icon: 'pi pi-refresh'
  },
  {
    id: 18,
    name: 'Premium Relaxation Ritual',
    description: 'Our signature journey — aromatherapy, head massage and full-body work.',
    category: 'wellness', type: 'SPA', duration: 90, price: 2999, rating: 5.0, popular: true,
    tags: ['relax', 'wellness', 'self-care'],
    benefits: ['Aromatherapy', 'Head massage', 'Full body massage'],
    professionalIds: [8], art: 'art-moss', icon: 'pi pi-star-fill'
  }
];
