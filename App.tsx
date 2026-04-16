import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { OfficeProfile } from './views/OfficeProfile';
import { WorkerProfile } from './views/WorkerProfile';
import { PublishAd } from './views/PublishAd';
import { Settings } from './views/Settings';
import { UserProfile } from './views/UserProfile';
import { OfficesList } from './views/OfficesList';
import { MyAds } from './views/MyAds';
import { Leads } from './views/Leads';
import { Notifications } from './views/Notifications';
import { CountryResults } from './views/CountryResults';
import { SearchResults } from './views/SearchResults';
import { Login } from './views/Login';
import { SignUp } from './views/SignUp';
import { Favorites } from './views/Favorites';
import { HelpSupport } from './views/HelpSupport';
import { EditProfile } from './views/EditProfile';
import { EditAd } from './views/EditAd';
import { ViewState, UserRole } from './types';
import { Heart } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n';
import { ThemeProvider } from './theme';
import { FavoritesProvider } from './FavoritesContext';
import { SplashScreen } from './components/SplashScreen';

// Inner App component to use the language hook for categories/favs placeholder translation
const InnerApp: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<ViewState>({ type: 'HOME' });
  // Default user role state
  const [userRole, setUserRole] = useState<UserRole>(UserRole.SEEKER);
  const { t } = useLanguage();

  // Splash Screen Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (newView: ViewState) => {
    setView(newView);
  };

  const handleToggleRole = () => {
    setUserRole(prev => prev === UserRole.SEEKER ? UserRole.OFFICE : UserRole.SEEKER);
    setView({ type: 'HOME' }); // Reset view when switching roles
  };

  const renderContent = () => {
    switch (view.type) {
      case 'HOME':
        return (
          <Home 
            onSelectWorker={(id) => setView({ type: 'WORKER_PROFILE', workerId: id })}
            onSelectOffice={(id) => setView({ type: 'OFFICE_PROFILE', officeId: id })}
            onNavigateNotifications={() => setView({ type: 'NOTIFICATIONS' })}
            onSelectNationality={(nationality) => setView({ type: 'COUNTRY_RESULTS', nationality })}
            onViewAll={(filterType) => setView({ type: 'SEARCH_RESULTS', filterType })}
            onSearch={(query, category) => setView({ type: 'SEARCH_RESULTS', query, category })}
          />
        );
      case 'COUNTRY_RESULTS':
        return (
          <CountryResults
            nationality={view.nationality}
            onBack={() => setView({ type: 'HOME' })}
            onSelectWorker={(id) => setView({ type: 'WORKER_PROFILE', workerId: id })}
            onSelectOffice={(id) => setView({ type: 'OFFICE_PROFILE', officeId: id })}
          />
        );
      case 'SEARCH_RESULTS':
        return (
          <SearchResults
            filterType={view.filterType}
            category={view.category}
            query={view.query}
            onBack={() => setView({ type: 'HOME' })}
            onSelectWorker={(id) => setView({ type: 'WORKER_PROFILE', workerId: id })}
            onSelectOffice={(id) => setView({ type: 'OFFICE_PROFILE', officeId: id })}
          />
        );
      case 'OFFICE_PROFILE':
        return (
          <OfficeProfile 
            officeId={view.officeId} 
            onBack={() => setView({ type: 'HOME' })}
            onSelectWorker={(id) => setView({ type: 'WORKER_PROFILE', workerId: id })}
          />
        );
      case 'WORKER_PROFILE':
        return (
          <WorkerProfile 
            workerId={view.workerId} 
            onBack={() => setView({ type: 'HOME' })} 
            onNavigateOffice={(id) => setView({ type: 'OFFICE_PROFILE', officeId: id })}
          />
        );
      case 'PUBLISH_AD':
        return <PublishAd onBack={() => setView({ type: 'MY_ADS' })} />;
      case 'USER_PROFILE':
        return <UserProfile onNavigateSettings={() => setView({ type: 'SETTINGS' })} onNavigateHelpSupport={() => setView({ type: 'HELP_SUPPORT' })} onNavigateEditProfile={() => setView({ type: 'EDIT_PROFILE' })} userRole={userRole} onToggleRole={handleToggleRole} onLogout={() => setView({ type: 'LOGIN' })} />;
      case 'EDIT_PROFILE':
        return <EditProfile onBack={() => setView({ type: 'USER_PROFILE' })} userRole={userRole} />;
      case 'EDIT_AD':
        return <EditAd adId={view.adId} onBack={() => setView({ type: 'MY_ADS' })} />;
      case 'SETTINGS':
        return <Settings onBack={() => setView({ type: 'USER_PROFILE' })} />;
      case 'HELP_SUPPORT':
        return <HelpSupport onBack={() => setView({ type: 'USER_PROFILE' })} />;
      case 'LOGIN':
        return <Login onLoginSuccess={() => setView({ type: 'HOME' })} onNavigateSignUp={() => setView({ type: 'SIGN_UP' })} />;
      case 'SIGN_UP':
        return <SignUp onSignUpSuccess={() => setView({ type: 'HOME' })} onBackToLogin={() => setView({ type: 'LOGIN' })} />;
      case 'OFFICES_LIST':
        return <OfficesList onSelectOffice={(id) => setView({ type: 'OFFICE_PROFILE', officeId: id })} />;
      case 'MY_ADS':
        return <MyAds onPublish={() => setView({ type: 'PUBLISH_AD' })} onEditAd={(id) => setView({ type: 'EDIT_AD', adId: id })} onSelectWorker={(id) => setView({ type: 'WORKER_PROFILE', workerId: id })} />;
      case 'LEADS':
        return <Leads />;
      case 'NOTIFICATIONS':
        return <Notifications onBack={() => setView({ type: 'HOME' })} />;
      case 'FAVORITES':
        return (
          <Favorites 
            onBack={() => setView({ type: 'HOME' })}
            onSelectWorker={(id) => setView({ type: 'WORKER_PROFILE', workerId: id })}
            onSelectOffice={(id) => setView({ type: 'OFFICE_PROFILE', officeId: id })}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <>
      {showSplash && <SplashScreen />}
      {/* 
        Render Layout always but covered by splash initially. 
        This prevents layout shift and allows assets to preload.
      */}
      <Layout currentView={view} onNavigate={handleNavigate} userRole={userRole} hideNav={view.type === 'LOGIN' || view.type === 'SIGN_UP'}>
        {renderContent()}
      </Layout>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <InnerApp />
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;