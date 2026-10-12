import React, { useState, useEffect } from 'react';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicPage } from './components/PublicPage';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [isAdminRoute, setIsAdminRoute] = useState(() => checkIsAdmin());

  function checkIsAdmin() {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const hash = window.location.hash.replace(/^#\/?/, '');
    const search = new URLSearchParams(window.location.search);
    return (
      path === 'admin' ||
      hash === 'admin' ||
      hash.startsWith('admin') ||
      search.get('view') === 'admin'
    );
  }

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdmin());
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
      setIsAdminRoute(checkIsAdmin());
      window.scrollTo(0, 0);
    }
  };

  // Render Admin View
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return <AdminLogin onBackToPublic={() => navigateTo('/')} />;
    }
    return <AdminDashboard onViewPublic={() => navigateTo('/')} />;
  }

  // Render Single Main Public Page
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
