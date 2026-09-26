import { Routes } from '@angular/router';
import { featureGuard } from './core/guards/feature.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'Home'
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then((m) => m.ServicesPage),
    title: 'Services'
  },
  {
    path: 'professionals',
    loadComponent: () =>
      import('./pages/professionals/professionals').then((m) => m.ProfessionalsPage),
    title: 'Our Professionals'
  },
  {
    path: 'booking',
    canActivate: [featureGuard('onlineBooking')],
    loadComponent: () => import('./pages/booking/booking').then((m) => m.BookingPage),
    title: 'Book Your Experience'
  },
  {
    path: 'quiz',
    canActivate: [featureGuard('beautyQuiz')],
    loadComponent: () => import('./pages/quiz/quiz').then((m) => m.QuizPage),
    title: 'Find Your Perfect Experience'
  },
  {
    path: 'gallery',
    canActivate: [featureGuard('gallery')],
    loadComponent: () => import('./pages/gallery/gallery').then((m) => m.GalleryPage),
    title: 'Gallery'
  },
  {
    path: 'offers',
    canActivate: [featureGuard('offers')],
    loadComponent: () => import('./pages/offers/offers').then((m) => m.OffersPage),
    title: 'Offers'
  },
  {
    path: 'membership',
    canActivate: [featureGuard('membership')],
    loadComponent: () => import('./pages/membership/membership').then((m) => m.MembershipPage),
    title: 'Membership'
  },
  {
    path: 'gift-cards',
    canActivate: [featureGuard('giftCards')],
    loadComponent: () => import('./pages/gift-cards/gift-cards').then((m) => m.GiftCardsPage),
    title: 'Gift Cards'
  },
  {
    path: 'experience-builder',
    canActivate: [featureGuard('servicePackages')],
    loadComponent: () =>
      import('./pages/experience-builder/experience-builder').then((m) => m.ExperienceBuilderPage),
    title: 'Build Your Experience'
  },
  {
    path: 'my-experiences',
    loadComponent: () => import('./pages/account/account').then((m) => m.AccountPage),
    title: 'My Experiences'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
    title: 'Contact'
  },
  { path: '**', redirectTo: '' }
];
