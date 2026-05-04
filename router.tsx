import React from 'react';
import { createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { OfficeProfile } from './views/OfficeProfile';
import { WorkerProfile } from './views/WorkerProfile';
import { PublishAd } from './views/PublishAd';
import { Settings } from './views/Settings';
import { UserProfile } from './views/UserProfile';
import { OfficesList } from './views/OfficesList';
import { MyAds } from './views/MyAds';
import { Subscriptions } from './views/Subscriptions';
import { Notifications } from './views/Notifications';
import { CountryResults } from './views/CountryResults';
import { SearchResults } from './views/SearchResults';
import { Login } from './features/auth/components/Login';
import { VerifyOtp } from './features/auth/components/VerifyOtp';
import { SignUp } from './features/auth/components/SignUp';
import { CompleteProfile } from './features/auth/components/CompleteProfile';
import { Favorites } from './views/Favorites';
import { HelpSupport } from './views/HelpSupport';
import { EditProfile } from './views/EditProfile';
import { EditAd } from './views/EditAd';
import { Checkout } from './views/Checkout';
import { TermsConditions } from './views/TermsConditions';
import { SplashScreen } from './components/SplashScreen';

export interface SearchParams {
  query?: string;
  filterType?: string;
  category?: string;
  category_id?: number;
  country_id?: number;
  country_name?: string;
  country_image?: string;
  gender?: string;
  salary?: number;
  age?: number;
  years_experience?: number;
  languages?: number[];
  latest?: 1 | 0;
  experience?: 1 | 0;
  history?: 1 | 0;
  page?: number;
}

const AppLayout = () => {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <Layout>
        <Outlet />
      </Layout>
    </>
  );
};

export const rootRoute = createRootRoute({
  component: AppLayout,
  beforeLoad: ({ location }) => {
    const publicPaths = ['/login', '/sign-up', '/verify-otp'];
    const isPublic = publicPaths.includes(location.pathname);
    const token = localStorage.getItem('token');

    if (!token && !isPublic) {
      throw redirect({
        to: '/login',
      });
    }

    if (token && isPublic) {
      throw redirect({
        to: '/',
      });
    }
  },
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

export const workerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/worker/$workerId',
  component: WorkerProfile,
});

export const officeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/office/$officeId',
  component: OfficeProfile,
});

export const publishAdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publish-ad',
  component: PublishAd,
});



export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

export const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: UserProfile,
});

export const officesListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/offices',
  component: OfficesList,
});

export const myAdsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-ads',
  component: MyAds,
});

export const subscriptionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/subscriptions',
  component: Subscriptions,
});

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: Notifications,
});

export const countryResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/country/$nationality',
  component: CountryResults,
});

export const searchResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchResults,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      query: typeof search.query === 'string' ? search.query : undefined,
      filterType: typeof search.filterType === 'string' ? search.filterType : undefined,
      category: typeof search.category === 'string' ? search.category : undefined,
      category_id: typeof search.category_id === 'number' ? search.category_id : undefined,
      country_id: typeof search.country_id === 'number' ? search.country_id : undefined,
      country_name: typeof search.country_name === 'string' ? search.country_name : undefined,
      country_image: typeof search.country_image === 'string' ? search.country_image : undefined,
      gender: typeof search.gender === 'string' ? search.gender : undefined,
      salary: typeof search.salary === 'number' ? search.salary : undefined,
      age: typeof search.age === 'number' ? search.age : undefined,
      years_experience: typeof search.years_experience === 'number' ? search.years_experience : undefined,
      languages: Array.isArray(search.languages) ? search.languages as number[] : undefined,
      latest: search.latest === 1 || search.latest === 0 ? search.latest as 1 | 0 : undefined,
      experience: search.experience === 1 || search.experience === 0 ? search.experience as 1 | 0 : undefined,
      history: search.history === 1 || search.history === 0 ? search.history as 1 | 0 : undefined,
      page: typeof search.page === 'number' ? search.page : undefined,
    };
  },
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

export const verifyOtpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-otp',
  component: VerifyOtp,
  validateSearch: (search: Record<string, unknown>): { phone?: string } => {
    return {
      phone: typeof search.phone === 'string' ? search.phone : undefined,
    };
  },
});

export const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  component: SignUp,
});

export const completeProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complete-profile',
  component: CompleteProfile,
  validateSearch: (search: Record<string, unknown>): { phone?: string; country_id?: string } => {
    return {
      phone: typeof search.phone === 'string' ? search.phone : undefined,
      country_id: typeof search.country_id === 'string' ? search.country_id : undefined,
    };
  },
});

export const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: Favorites,
});

export const helpSupportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/help-support',
  component: HelpSupport,
});

export const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-profile',
  component: EditProfile,
});

export const editAdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-ad/$adId',
  component: EditAd,
});

export const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: Checkout,
});

export const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsConditions,
});

export const categoryResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/category/$category',
  component: SearchResults,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  workerRoute,
  officeRoute,
  publishAdRoute,
  settingsRoute,
  userProfileRoute,
  officesListRoute,
  myAdsRoute,
  subscriptionsRoute,
  notificationsRoute,
  countryResultsRoute,
  categoryResultsRoute,
  searchResultsRoute,
  loginRoute,
  verifyOtpRoute,
  signUpRoute,
  completeProfileRoute,
  favoritesRoute,
  helpSupportRoute,
  editProfileRoute,
  editAdRoute,
  checkoutRoute,
  termsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
