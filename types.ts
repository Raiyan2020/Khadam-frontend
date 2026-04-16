
export type LocalizedString = {
  en: string;
  ar: string;
};

export enum UserRole {
  SEEKER = 'SEEKER',
  OFFICE = 'OFFICE',
  ADMIN = 'ADMIN'
}

export enum ServiceCategory {
  BABYSITTER = 'BABYSITTER',
  COOK_FEMALE = 'COOK_FEMALE',
  NURSE = 'NURSE',
  DRIVER = 'DRIVER',
  COOK_MALE = 'COOK_MALE',
  DOMESTIC_WORKER = 'DOMESTIC_WORKER'
}

export interface Office {
  id: string;
  name: LocalizedString;
  avatar: string;
  coverImage: string;
  bio: LocalizedString;
  location: LocalizedString;
  phone: string;
  whatsapp?: string;
  website?: string;
  mapsUrl?: string;
  rating: number;
  reviewCount: number;
}

export interface Worker {
  id: string;
  officeId: string;
  name: LocalizedString;
  photo: string;
  nationality: LocalizedString;
  gender: 'Female' | 'Male';
  age: number;
  experienceYears: number;
  languages: LocalizedString[];
  category: ServiceCategory;
  specialty: LocalizedString;
  availability: 'Available' | 'Reserved' | 'Hired';
  salary: number; // in KWD
  city: LocalizedString;
  createdAt: string; // ISO string for sorting
  lastViewedAt?: string; // ISO string for "Continue from last viewed"
}

export interface Ad {
  id: string;
  officeId: string;
  workerId: string;
  title: LocalizedString;
  description: LocalizedString;
  postedAt: string;
  featured: boolean;
}

export type ViewState = 
  | { type: 'HOME' }
  | { type: 'OFFICE_PROFILE'; officeId: string }
  | { type: 'WORKER_PROFILE'; workerId: string }
  | { type: 'PUBLISH_AD' }
  | { type: 'FAVORITES' }
  | { type: 'COUNTRY_RESULTS'; nationality: string }
  | { type: 'SEARCH_RESULTS'; filterType?: string; category?: string; query?: string }
  | { type: 'OFFICES_LIST' }
  | { type: 'MY_ADS' }
  | { type: 'LEADS' }
  | { type: 'USER_PROFILE' }
  | { type: 'SETTINGS' }
  | { type: 'NOTIFICATIONS' }
  | { type: 'LOGIN' }
  | { type: 'SIGN_UP' }
  | { type: 'HELP_SUPPORT' }
  | { type: 'EDIT_PROFILE' }
  | { type: 'EDIT_AD'; adId: string };
