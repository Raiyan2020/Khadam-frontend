
import { Office, Worker, Ad, ServiceCategory, LocalizedString } from './types';

export interface NationalityInfo {
  name: LocalizedString;
  flag: string;
}

export const NATIONALITIES: NationalityInfo[] = [
  { name: { en: 'Sri Lanka', ar: 'سريلانكا' }, flag: 'https://flagcdn.com/w160/lk.png' },
  { name: { en: 'India', ar: 'الهند' }, flag: 'https://flagcdn.com/w160/in.png' },
  { name: { en: 'Ethiopia', ar: 'إثيوبيا' }, flag: 'https://flagcdn.com/w160/et.png' },
  { name: { en: 'Philippines', ar: 'الفلبين' }, flag: 'https://flagcdn.com/w160/ph.png' },
  { name: { en: 'Nepal', ar: 'نيبال' }, flag: 'https://flagcdn.com/w160/np.png' },
  { name: { en: 'Bangladesh', ar: 'بنغلاديش' }, flag: 'https://flagcdn.com/w160/bd.png' }
];

export const LANGUAGES: LocalizedString[] = [
  { en: 'Arabic', ar: 'عربي' },
  { en: 'English', ar: 'إنجليزي' },
  { en: 'Hindi', ar: 'هندي' },
  { en: 'Tagalog', ar: 'تاغالوغ' },
  { en: 'Sinhala', ar: 'سنهالي' },
  { en: 'Bengali', ar: 'بنغالي' },
  { en: 'Urdu', ar: 'أوردو' },
];

export const CITIES: LocalizedString[] = [
  { en: 'Kuwait City', ar: 'مدينة الكويت' },
  { en: 'Hawally', ar: 'حولي' },
  { en: 'Salmiya', ar: 'السالمية' },
  { en: 'Farwaniya', ar: 'الفروانية' },
  { en: 'Jahra', ar: 'الجهراء' },
  { en: 'Ahmadi', ar: 'الأحمدي' }
];

export const MOCK_OFFICES: Office[] = [
  {
    id: 'o1',
    name: { en: 'Al-Nour Recruitment', ar: 'مكتب النور للاستقدام' },
    avatar: 'https://picsum.photos/seed/office1/200/200',
    coverImage: 'https://picsum.photos/seed/officebg1/800/400',
    bio: {
      en: 'Premium domestic staffing solutions in Kuwait City since 2010. We specialize in skilled housekeepers and nannies.',
      ar: 'حلول توظيف العمالة المنزلية المتميزة في مدينة الكويت منذ عام 2010. متخصصون في عاملات المنازل والمربيات ذوات الخبرة.'
    },
    location: { en: 'Sharq, Kuwait City', ar: 'شرق، مدينة الكويت' },
    phone: '96512345678',
    whatsapp: '96512345678',
    website: 'https://al-nour.example.com',
    mapsUrl: 'https://maps.google.com/?q=Sharq+Kuwait+City',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'o2',
    name: { en: 'Royal Home Care', ar: 'رويال هوم كير' },
    avatar: 'https://picsum.photos/seed/office2/200/200',
    coverImage: 'https://picsum.photos/seed/officebg2/800/400',
    bio: {
      en: 'Trusted source for professional cooks and drivers. Full background checks guaranteed.',
      ar: 'مصدر موثوق للطباخين والسائقين المحترفين. نضمن فحصاً شاملاً للخلفية والسجل.'
    },
    location: { en: 'Salmiya, Block 4', ar: 'السالمية، قطعة 4' },
    phone: '96598765432',
    whatsapp: '96598765432',
    website: 'https://royalhome.example.com',
    mapsUrl: 'https://maps.google.com/?q=Salmiya+Block+4',
    rating: 4.5,
    reviewCount: 89,
  },
  {
    id: 'o3',
    name: { en: 'Elite Manpower', ar: 'النخبة للقوى العاملة' },
    avatar: 'https://picsum.photos/seed/office3/200/200',
    coverImage: 'https://picsum.photos/seed/officebg3/800/400',
    bio: {
      en: 'Providing certified nurses and elderly care specialists.',
      ar: 'توفير ممرضات معتمدات ومتخصصين في رعاية كبار السن.'
    },
    location: { en: 'Hawally', ar: 'حولي' },
    phone: '96555555555',
    whatsapp: '96555555555',
    website: 'https://elite.example.com',
    mapsUrl: 'https://maps.google.com/?q=Hawally+Kuwait',
    rating: 4.9,
    reviewCount: 210,
  }
];

export const MOCK_WORKERS: Worker[] = [
  {
    id: 'w1',
    officeId: 'o1',
    name: { en: 'Maria Santos', ar: 'ماريا سانتوس' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam1.jpg',
    nationality: { en: 'Philippines', ar: 'الفلبين' },
    gender: 'Female',
    age: 28,
    experienceYears: 4,
    languages: [{ en: 'English', ar: 'إنجليزي' }, { en: 'Arabic (Basic)', ar: 'عربي (أساسي)' }],
    category: ServiceCategory.DOMESTIC_WORKER,
    specialty: { en: 'Domestic Worker', ar: 'عامل منزلي' },
    availability: 'Available',
    salary: 120,
    city: { en: 'Kuwait City', ar: 'مدينة الكويت' },
    createdAt: '2025-05-01T10:00:00Z'
  },
  {
    id: 'w2',
    officeId: 'o1',
    name: { en: 'Elena Cruz', ar: 'إيلينا كروز' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam2.jpg',
    nationality: { en: 'Philippines', ar: 'الفلبين' },
    gender: 'Female',
    age: 32,
    experienceYears: 6,
    languages: [{ en: 'English', ar: 'إنجليزي' }, { en: 'Arabic', ar: 'عربي' }],
    category: ServiceCategory.BABYSITTER,
    specialty: { en: 'Babysitter', ar: 'جليسة الأطفال' },
    availability: 'Available',
    salary: 150,
    city: { en: 'Kuwait City', ar: 'مدينة الكويت' },
    createdAt: '2025-05-02T12:00:00Z'
  },
  {
    id: 'w3',
    officeId: 'o2',
    name: { en: 'Raju Patel', ar: 'راجو باتيل' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam3.jpg',
    nationality: { en: 'India', ar: 'الهند' },
    gender: 'Male',
    age: 35,
    experienceYears: 10,
    languages: [{ en: 'English', ar: 'إنجليزي' }, { en: 'Hindi', ar: 'هندي' }, { en: 'Arabic', ar: 'عربي' }],
    category: ServiceCategory.DRIVER,
    specialty: { en: 'Domestic Driver', ar: 'سائق منزلي' },
    availability: 'Reserved',
    salary: 180,
    city: { en: 'Salmiya', ar: 'السالمية' },
    createdAt: '2025-05-03T09:00:00Z'
  },
  {
    id: 'w4',
    officeId: 'o2',
    name: { en: 'Lakshmi Nair', ar: 'لاكشمي ناير' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam4.jpg',
    nationality: { en: 'India', ar: 'الهند' },
    gender: 'Female',
    age: 40,
    experienceYears: 15,
    languages: [{ en: 'English', ar: 'إنجليزي' }, { en: 'Arabic', ar: 'عربي' }],
    category: ServiceCategory.COOK_FEMALE,
    specialty: { en: 'Home Cook (F)', ar: 'طباخة منزلية' },
    availability: 'Available',
    salary: 160,
    city: { en: 'Salmiya', ar: 'السالمية' },
    createdAt: '2025-05-04T15:00:00Z'
  },
  {
    id: 'w5',
    officeId: 'o3',
    name: { en: 'Sara Tesfaye', ar: 'سارة تسفاي' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam5.jpg',
    nationality: { en: 'Ethiopia', ar: 'إثيوبيا' },
    gender: 'Female',
    age: 25,
    experienceYears: 2,
    languages: [{ en: 'English (Basic)', ar: 'إنجليزي (أساسي)' }, { en: 'Arabic', ar: 'عربي' }],
    category: ServiceCategory.DOMESTIC_WORKER,
    specialty: { en: 'Domestic Worker', ar: 'عامل منزلي' },
    availability: 'Available',
    salary: 95,
    city: { en: 'Hawally', ar: 'حولي' },
    createdAt: '2025-05-05T11:00:00Z'
  },
  {
    id: 'w7',
    officeId: 'o2',
    name: { en: 'Ahmed Khan', ar: 'أحمد خان' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam7.jpg',
    nationality: { en: 'India', ar: 'الهند' },
    gender: 'Male',
    age: 42,
    experienceYears: 20,
    languages: [{ en: 'Arabic', ar: 'عربي' }, { en: 'English', ar: 'إنجليزي' }],
    category: ServiceCategory.COOK_MALE,
    specialty: { en: 'Home Cook (M)', ar: 'طباخ منزلي' },
    availability: 'Available',
    salary: 220,
    city: { en: 'Farwaniya', ar: 'الفروانية' },
    createdAt: '2025-05-07T14:00:00Z'
  },
  {
    id: 'w8',
    officeId: 'o3',
    name: { en: 'Joy Chen', ar: 'جوي تشن' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam8.jpg',
    nationality: { en: 'Nepal', ar: 'نيبال' },
    gender: 'Female',
    age: 30,
    experienceYears: 7,
    languages: [{ en: 'English', ar: 'إنجليزي' }, { en: 'Hindi', ar: 'هندي' }],
    category: ServiceCategory.BABYSITTER,
    specialty: { en: 'Babysitter', ar: 'جليسة الأطفال' },
    availability: 'Available',
    salary: 130,
    city: { en: 'Ahmadi', ar: 'الأحمدي' },
    createdAt: '2025-05-08T09:00:00Z'
  },
  {
    id: 'w9',
    officeId: 'o1',
    name: { en: 'Blessing Okafor', ar: 'بليسينج أوكافور' },
    photo: 'https://raiyansoft.com/wp-content/uploads/2026/02/khadam9.jpg',
    nationality: { en: 'Ethiopia', ar: 'إثيوبيا' },
    gender: 'Female',
    age: 26,
    experienceYears: 3,
    languages: [{ en: 'Arabic', ar: 'عربي' }],
    category: ServiceCategory.NURSE,
    specialty: { en: 'Home Nurse', ar: 'ممرضة منزلية' },
    availability: 'Available',
    salary: 105,
    city: { en: 'Jahra', ar: 'الجهراء' },
    createdAt: '2025-05-09T16:00:00Z'
  },
  {
    id: 'w10',
    officeId: 'o2',
    name: { en: 'Kumari Perera', ar: 'كوماري بيريرا' },
    photo: 'https://picsum.photos/seed/w10/400/500',
    nationality: { en: 'Sri Lanka', ar: 'سريلانكا' },
    gender: 'Female',
    age: 34,
    experienceYears: 8,
    languages: [{ en: 'English', ar: 'إنجليزي' }, { en: 'Sinhala', ar: 'سنهالي' }],
    category: ServiceCategory.DOMESTIC_WORKER,
    specialty: { en: 'Domestic Worker', ar: 'عامل منزلي' },
    availability: 'Available',
    salary: 130,
    city: { en: 'Hawally', ar: 'حولي' },
    createdAt: '2025-05-10T10:00:00Z'
  },
  {
    id: 'w11',
    officeId: 'o3',
    name: { en: 'Farhana Begum', ar: 'فرحانة بيجوم' },
    photo: 'https://picsum.photos/seed/w11/400/500',
    nationality: { en: 'Bangladesh', ar: 'بنغلاديش' },
    gender: 'Female',
    age: 27,
    experienceYears: 4,
    languages: [{ en: 'Arabic', ar: 'عربي' }, { en: 'Bengali', ar: 'بنغالي' }],
    category: ServiceCategory.DOMESTIC_WORKER,
    specialty: { en: 'Domestic Worker', ar: 'عامل منزلي' },
    availability: 'Available',
    salary: 90,
    city: { en: 'Salmiya', ar: 'السالمية' },
    createdAt: '2025-05-11T12:00:00Z'
  }
];

export const MOCK_ADS: Ad[] = [
  {
    id: 'a1',
    officeId: 'o1',
    workerId: 'w1',
    title: { en: 'Experienced Housekeeper Available Immediately', ar: 'عاملة منزلية خبيرة متاحة فوراً' },
    description: { en: 'Maria is very hardworking and great with kids.', ar: 'ماريا مجتهدة جداً وممتازة في التعامل مع الأطفال.' },
    postedAt: '2h ago',
    featured: true
  },
  {
    id: 'a2',
    officeId: 'o2',
    workerId: 'w3',
    title: { en: 'Professional Driver with Kuwait License', ar: 'سائق محترف برخصة كويتية' },
    description: { en: 'Raju knows all areas of Kuwait.', ar: 'راجو يعرف جميع مناطق الكويت.' },
    postedAt: '5h ago',
    featured: false
  },
  {
    id: 'a3',
    officeId: 'o2',
    workerId: 'w4',
    title: { en: 'Expert Indian Cook (Veg & Non-Veg)', ar: 'طباخة هندية خبيرة (أطباق متنوعة)' },
    description: { en: 'Specializes in local Kuwaiti dishes.', ar: 'متخصصة في الأطباق الكويتية.' },
    postedAt: '1d ago',
    featured: true
  },
  {
    id: 'a5',
    officeId: 'o3',
    workerId: 'w8',
    title: { en: 'Professional Childcare Specialist', ar: 'متخصصة في رعاية الأطفال' },
    description: { en: 'Joy has 7 years of childcare experience.', ar: 'جوي لديها 7 سنوات من الخبرة في رعاية الأطفال.' },
    postedAt: '4h ago',
    featured: true
  }
];
