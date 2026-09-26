import { Routes } from '@angular/router';
import { accessGuard } from './core/guards/access.guard';

/**
 * Every destination is keyed into ROUTE_ACCESS (core/config) so the guard
 * and the menus share one rule. /salon, /spa, /stylists and /therapists reuse
 * the services / professionals pages with a fixed studio filter rather than
 * duplicating them.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Home'
  },
  { path: 'home', redirectTo: '' },
  {
    path: 'services',
    canActivate: [accessGuard('services')],
    loadComponent: () => import('./features/services/services').then((m) => m.ServicesPage),
    title: 'Services'
  },
  {
    path: 'salon',
    canActivate: [accessGuard('salon')],
    data: { type: 'SALON' },
    loadComponent: () => import('./features/services/services').then((m) => m.ServicesPage),
    title: 'Salon'
  },
  {
    path: 'spa',
    canActivate: [accessGuard('spa')],
    data: { type: 'SPA' },
    loadComponent: () => import('./features/services/services').then((m) => m.ServicesPage),
    title: 'Spa'
  },
  {
    path: 'professionals',
    canActivate: [accessGuard('professionals')],
    loadComponent: () =>
      import('./features/professionals/professionals').then((m) => m.ProfessionalsPage),
    title: 'Our Experts'
  },
  {
    path: 'stylists',
    canActivate: [accessGuard('stylists')],
    data: { type: 'SALON' },
    loadComponent: () =>
      import('./features/professionals/professionals').then((m) => m.ProfessionalsPage),
    title: 'Stylists'
  },
  {
    path: 'therapists',
    canActivate: [accessGuard('therapists')],
    data: { type: 'SPA' },
    loadComponent: () =>
      import('./features/professionals/professionals').then((m) => m.ProfessionalsPage),
    title: 'Therapists'
  },
  {
    path: 'booking',
    canActivate: [accessGuard('booking')],
    loadComponent: () => import('./features/booking/booking').then((m) => m.BookingPage),
    title: 'Book Your Experience'
  },
  {
    path: 'quiz',
    canActivate: [accessGuard('quiz')],
    loadComponent: () =>
      import('./features/beauty-quiz/beauty-quiz').then((m) => m.BeautyQuizPage),
    title: 'Find Your Perfect Experience'
  },
  {
    path: 'gallery',
    canActivate: [accessGuard('gallery')],
    loadComponent: () => import('./features/gallery/gallery').then((m) => m.GalleryPage),
    title: 'Gallery'
  },
  {
    path: 'offers',
    canActivate: [accessGuard('offers')],
    loadComponent: () => import('./features/offers/offers').then((m) => m.OffersPage),
    title: 'Offers'
  },
  {
    path: 'membership',
    canActivate: [accessGuard('membership')],
    loadComponent: () =>
      import('./features/membership/membership').then((m) => m.MembershipPage),
    title: 'Membership'
  },
  {
    path: 'gift-cards',
    canActivate: [accessGuard('gift-cards')],
    loadComponent: () =>
      import('./features/gift-cards/gift-cards').then((m) => m.GiftCardsPage),
    title: 'Gift Cards'
  },
  {
    path: 'experience-builder',
    canActivate: [accessGuard('experience-builder')],
    loadComponent: () =>
      import('./features/experience-builder/experience-builder').then(
        (m) => m.ExperienceBuilderPage
      ),
    title: 'Build Your Experience'
  },
  {
    path: 'appointments',
    canActivate: [accessGuard('appointments')],
    loadComponent: () =>
      import('./features/appointments/appointments').then((m) => m.AppointmentsPage),
    title: 'My Appointments'
  },
  // Legacy URL kept from the earlier scaffold.
  { path: 'my-experiences', redirectTo: 'appointments' },
  {
    path: 'contact',
    canActivate: [accessGuard('contact')],
    loadComponent: () => import('./features/contact/contact').then((m) => m.ContactPage),
    title: 'Contact'
  },
  { path: '**', redirectTo: '' }
];
