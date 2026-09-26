import { Professional } from '../models/catalog.model';

/** Demo team. Replace with `GET /professionals` when an API exists. */
export const PROFESSIONALS: Professional[] = [
  {
    id: 1, name: 'Priya Kumar', role: 'Senior Hair Artist', type: 'SALON',
    experienceYears: 8, specialties: ['Hair Colour', 'Balayage', 'Hair Styling'],
    rating: 4.9, reviewsCount: 312,
    bio: 'Priya leads our colour studio, trained in London and obsessed with dimension that grows out gracefully.',
    palette: 'art-gold'
  },
  {
    id: 2, name: 'Rahul Menon', role: 'Style Director', type: 'SALON',
    experienceYears: 11, specialties: ['Precision Cuts', 'Keratin', 'Grooming'],
    rating: 4.8, reviewsCount: 268,
    bio: 'Rahul believes a great cut should need nothing more than your fingers to style.',
    palette: 'art-sage'
  },
  {
    id: 3, name: 'Ananya Rao', role: 'Makeup Artist', type: 'SALON',
    experienceYears: 7, specialties: ['Bridal', 'Airbrush', 'Editorial'],
    rating: 5.0, reviewsCount: 189,
    bio: 'Ananya has painted over four hundred brides and still cries at every send-off.',
    palette: 'art-rose'
  },
  {
    id: 4, name: 'Kavya Iyer', role: 'Skin Specialist', type: 'SALON',
    experienceYears: 6, specialties: ['Glow Facials', 'Hydra Therapy', 'Skin Analysis'],
    rating: 4.8, reviewsCount: 224,
    bio: 'Kavya reads skin like a book and prescribes calm, not just products.',
    palette: 'art-pearl'
  },
  {
    id: 5, name: 'Divya Shetty', role: 'Nail Artist', type: 'SALON',
    experienceYears: 5, specialties: ['Gel Art', 'Extensions', 'Nail Health'],
    rating: 4.7, reviewsCount: 156,
    bio: 'Divya turns ten tiny canvases into conversation pieces.',
    palette: 'art-blush'
  },
  {
    id: 6, name: 'Arjun Pillai', role: 'Senior Massage Therapist', type: 'SPA',
    experienceYears: 10, specialties: ['Deep Tissue', 'Sports Recovery', 'Swedish'],
    rating: 4.9, reviewsCount: 341,
    bio: 'Arjun trained in Kerala and Chiang Mai; his pressure work is legendary among our regulars.',
    palette: 'art-moss'
  },
  {
    id: 7, name: 'Meera Nair', role: 'Wellness Aesthetician', type: 'SPA',
    experienceYears: 9, specialties: ['Facial Rituals', 'Lymphatic Massage', 'Aromatherapy'],
    rating: 4.8, reviewsCount: 205,
    bio: 'Meera blends skincare science with slow, meditative touch.',
    palette: 'art-sand'
  },
  {
    id: 8, name: 'Sofia D’Souza', role: 'Spa Therapist', type: 'SPA',
    experienceYears: 6, specialties: ['Aromatherapy', 'Body Rituals', 'Relaxation Therapy'],
    rating: 4.9, reviewsCount: 178,
    bio: 'Sofia curates each session’s oils, music and warmth around how you arrive.',
    palette: 'art-stone'
  }
];
