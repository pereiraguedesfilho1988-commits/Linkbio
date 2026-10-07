import React, { useState, useEffect } from 'react';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicPage } from './components/PublicPage';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      if (path === '/admin' || hash === '#admin' || hash.startsWith('#/admin') || search.get('view') === 'admin') {
        return '/admin';
      }
      return '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      if (path === '/admin' || hash === '#admin' || hash.startsWith('#/admin') || search.get('view') === 'admin') {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  if (currentPath === '/admin') {
    if (!isAuthenticated) {
      return <AdminLogin onBackToPublic={() => navigateTo('/')} />;
    }
    return <AdminDashboard onViewPublic={() => navigateTo('/')} />;
  }

  return <PublicPage onOpenAdmin={() => navigateTo('/admin')} />;
}

export default function App() {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SiteConfigProvider>
  );
}
