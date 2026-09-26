import { ExperienceAddon, MoodOption } from '../models/catalog.model';

/** Add-ons offered in the package builder and booking flow. */
export const EXPERIENCE_ADDONS: ExperienceAddon[] = [
  { id: 1, name: 'Head Massage', price: 300, duration: 15, appliesTo: ['SALON', 'SPA'] },
  { id: 2, name: 'Hair Spa Boost', price: 800, duration: 30, appliesTo: ['SALON'] },
  { id: 3, name: 'Premium Products Upgrade', price: 500, duration: 0, appliesTo: ['SALON', 'SPA'] },
  { id: 4, name: 'Neck & Shoulder Massage', price: 400, duration: 20, appliesTo: ['SALON', 'SPA'] },
  { id: 5, name: 'Express Manicure', price: 599, duration: 25, appliesTo: ['SALON'] },
  { id: 6, name: 'Aroma Steam', price: 350, duration: 15, appliesTo: ['SPA'] }
];

/** “What are you looking for today?” options. */
export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'relax', label: 'Relax', icon: 'pi pi-moon', tag: 'relax', blurb: 'I want to relax' },
  { id: 'glow', label: 'Glow', icon: 'pi pi-sun', tag: 'glow', blurb: 'I want my skin to glow' },
  { id: 'hair', label: 'Hair Transformation', icon: 'pi pi-sparkles', tag: 'hair', blurb: 'I want a hair transformation' },
  { id: 'self-care', label: 'Self Care', icon: 'pi pi-heart', tag: 'self-care', blurb: 'I owe myself some care' },
  { id: 'occasion', label: 'Special Occasion', icon: 'pi pi-star', tag: 'occasion', blurb: 'I have a special occasion' },
  { id: 'wellness', label: 'Wellness', icon: 'pi pi-asterisk', tag: 'wellness', blurb: 'I want to feel well again' }
];
