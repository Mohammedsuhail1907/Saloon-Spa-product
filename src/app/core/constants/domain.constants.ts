/** Which studios a client runs. */
export const BUSINESS_MODES = {
  SALON_ONLY: 'SALON_ONLY',
  SPA_ONLY: 'SPA_ONLY',
  SALON_AND_SPA: 'SALON_AND_SPA'
} as const;
export type BusinessMode = (typeof BUSINESS_MODES)[keyof typeof BUSINESS_MODES];

/** Which studio a service / offer / gallery item belongs to. */
export const SERVICE_TYPES = {
  SALON: 'SALON',
  SPA: 'SPA'
} as const;
export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

/** Staff roles map 1:1 onto service types. */
export const PROFESSIONAL_TYPES = {
  STYLIST: 'STYLIST',
  THERAPIST: 'THERAPIST'
} as const;
export type ProfessionalType = (typeof PROFESSIONAL_TYPES)[keyof typeof PROFESSIONAL_TYPES];

export const PROFESSIONAL_TYPE_FOR_SERVICE: Record<ServiceType, ProfessionalType> = {
  SALON: 'STYLIST',
  SPA: 'THERAPIST'
};

export const SERVICE_TYPE_FOR_PROFESSIONAL: Record<ProfessionalType, ServiceType> = {
  STYLIST: 'SALON',
  THERAPIST: 'SPA'
};
