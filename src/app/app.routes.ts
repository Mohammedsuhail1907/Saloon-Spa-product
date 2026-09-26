import { Routes } from '@angular/router';
import { featureGuard } from './core/guards/feature.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Home'
  },
  {
    path: 'services',
    loadComponent: () => import('./features/services/services').then((m) => m.ServicesPage),
    title: 'Services'
  },
  {
    path: 'professionals',
    loadComponent: () =>
      import('./features/professionals/professionals').then((m) => m.ProfessionalsPage),
    title: 'Our Professionals'
  },
  {
    path: 'booking',
    canActivate: [featureGuard('onlineBooking')],
    loadComponent: () => import('./features/booking/booking').then((m) => m.BookingPage),
    title: 'Book Your Experience'
  },
  {
    path: 'quiz',
    canActivate: [featureGuard('beautyQuiz')],
    loadComponent: () =>
      import('./features/beauty-quiz/beauty-quiz').then((m) => m.BeautyQuizPage),
    title: 'Find Your Perfect Experience'
  },
  {
    path: 'gallery',
    canActivate: [featureGuard('gallery')],
    loadComponent: () => import('./features/gallery/gallery').then((m) => m.GalleryPage),
    title: 'Gallery'
  },
  {
    path: 'offers',
    canActivate: [featureGuard('offers')],
    loadComponent: () => import('./features/offers/offers').then((m) => m.OffersPage),
    title: 'Offers'
  },
  {
    path: 'membership',
    canActivate: [featureGuard('membership')],
    loadComponent: () =>
      import('./features/membership/membership').then((m) => m.MembershipPage),
    title: 'Membership'
  },
  {
    path: 'gift-cards',
    canActivate: [featureGuard('giftCards')],
    loadComponent: () =>
      import('./features/gift-cards/gift-cards').then((m) => m.GiftCardsPage),
    title: 'Gift Cards'
  },
  {
    path: 'experience-builder',
    canActivate: [featureGuard('servicePackages')],
    loadComponent: () =>
      import('./features/experience-builder/experience-builder').then(
        (m) => m.ExperienceBuilderPage
      ),
    title: 'Build Your Experience'
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./features/appointments/appointments').then((m) => m.AppointmentsPage),
    title: 'My Appointments'
  },
  // Legacy URL kept from the earlier scaffold.
  { path: 'my-experiences', redirectTo: 'appointments' },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.ContactPage),
    title: 'Contact'
  },
  { path: '**', redirectTo: '' }
];
