import { BeforeAfterItem, CustomerStory, GalleryItem } from '../models/catalog.model';

/** Demo gallery tiles. Replace with `GET /gallery` when an API exists. */
export const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, title: 'Champagne Balayage', category: 'Hair', type: 'SALON', art: 'art-gold', icon: 'pi pi-sparkles' },
  { id: 2, title: 'The Colour Studio', category: 'Interior', type: 'BOTH', art: 'art-pearl', icon: 'pi pi-home' },
  { id: 3, title: 'Bridal Morning', category: 'Beauty', type: 'SALON', art: 'art-rose', icon: 'pi pi-heart-fill' },
  { id: 4, title: 'Warm Stone Ritual', category: 'Spa', type: 'SPA', art: 'art-moss', icon: 'pi pi-moon' },
  { id: 5, title: 'Glow Bar', category: 'Beauty', type: 'SALON', art: 'art-blush', icon: 'pi pi-sun' },
  { id: 6, title: 'Relaxation Lounge', category: 'Interior', type: 'BOTH', art: 'art-sand', icon: 'pi pi-star' },
  { id: 7, title: 'Herbal Apothecary', category: 'Wellness', type: 'SPA', art: 'art-sage', icon: 'pi pi-asterisk' },
  { id: 8, title: 'Signature Waves', category: 'Hair', type: 'SALON', art: 'art-stone', icon: 'pi pi-sparkles' },
  { id: 9, title: 'Couples Suite', category: 'Spa', type: 'SPA', art: 'art-rose', icon: 'pi pi-users' }
];

export const GALLERY_CATEGORIES = ['All', 'Salon', 'Spa', 'Hair', 'Beauty', 'Wellness', 'Interior'];

/** Demo before/after transformations. */
export const BEFORE_AFTER_ITEMS: BeforeAfterItem[] = [
  {
    id: 1, title: 'Sun-Kissed Balayage', category: 'Hair',
    caption: 'Flat single-tone lengths, reborn as hand-painted dimension.',
    beforeArt: 'ba-hair-before', afterArt: 'ba-hair-after'
  },
  {
    id: 2, title: 'Bridal Radiance', category: 'Makeup',
    caption: 'A soft-focus, luminous bridal look built on prepped skin.',
    beforeArt: 'ba-makeup-before', afterArt: 'ba-makeup-after'
  },
  {
    id: 3, title: 'Glass-Skin Facial', category: 'Facial',
    caption: 'Dull, dehydrated skin after one Premium Glow session.',
    beforeArt: 'ba-skin-before', afterArt: 'ba-skin-after'
  },
  {
    id: 4, title: 'Sculpted Gel Set', category: 'Nails',
    caption: 'Bare nails to a sculpted, hand-painted gel set.',
    beforeArt: 'ba-nails-before', afterArt: 'ba-nails-after'
  }
];

export const BEFORE_AFTER_CATEGORIES = ['All', 'Hair', 'Makeup', 'Facial', 'Nails'];

/** Demo customer stories. Replace with `GET /reviews` when an API exists. */
export const CUSTOMER_STORIES: CustomerStory[] = [
  {
    id: 1, customer: 'Sarah', title: 'Sarah’s Transformation', rating: 5,
    service: 'Balayage & Gloss', type: 'SALON',
    steps: ['Before', 'Treatment', 'Final Look'],
    quote: 'An amazing experience from consultation to final styling. I have never felt so listened to in a salon chair.',
    palette: 'art-gold'
  },
  {
    id: 2, customer: 'Nikhil', title: 'Nikhil’s Reset', rating: 5,
    service: 'Deep Tissue Massage', type: 'SPA',
    steps: ['Arrived tense', 'Ninety minutes', 'Left weightless'],
    quote: 'Arjun found knots I had carried for years. I booked my next session before leaving the building.',
    palette: 'art-moss'
  },
  {
    id: 3, customer: 'Aisha', title: 'Aisha’s Wedding Week', rating: 5,
    service: 'Bridal Artistry', type: 'SALON',
    steps: ['Trial', 'Wedding day', 'The photographs'],
    quote: 'Ananya made me look like myself on the best day of my life — only luminous.',
    palette: 'art-rose'
  },
  {
    id: 4, customer: 'Divya', title: 'Divya’s Sunday Ritual', rating: 4,
    service: 'Aromatherapy Journey', type: 'SPA',
    steps: ['Arrived frazzled', 'The ritual', 'Calm for days'],
    quote: 'The oils Sofia blends for me are half the reason my Sundays feel sacred now.',
    palette: 'art-blush'
  }
];
