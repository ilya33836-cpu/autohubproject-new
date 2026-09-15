import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NotificationsDropdown from './NotificationsDropdown';
import { API_BASE_URL } from '../utils/api';

const Layout = ({ children, title = 'AUTOHUB' }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setCurrentUserRole(null);
      setIsAuthenticated(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserRole(userData.role);
          setIsAuthenticated(true);
        } else {
          setCurrentUserRole(null);
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setCurrentUserRole(null);
        setIsAuthenticated(false);
      }
    };

    fetchUserRole();
  }, [router.pathname]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem('access_token');
      if (!token || !currentUserRole) return;
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchUnreadCount();
  }, [currentUserRole]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setCurrentUserRole(null);
    router.push('/');
  };

  const isAdminOrManager = currentUserRole === 'admin' || currentUserRole === 'manager';

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-gray-900">
      <Head>
        <title>{title}</title>
        <meta name="description" content="AUTOHUB - Цифровая платформа для автосервиса" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass shadow-soft py-2' : 'bg-white/80 backdrop-blur-md py-4 border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold gradient-text">AUTOHUB</Link>

          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><Link href="/" className={`hover:text-primary-600 transition-colors ${router.pathname === '/' ? 'text-primary-600 font-medium' : ''}`}>Главная</Link></li>
              <li><Link href="/services" className={`hover:text-primary-600 transition-colors ${router.pathname === '/services' ? 'text-primary-600 font-medium' : ''}`}>Услуги</Link></li>
              <li><Link href="/contact" className={`hover:text-primary-600 transition-colors ${router.pathname === '/contact' ? 'text-primary-600 font-medium' : ''}`}>Контакты</Link></li>
              {isAdminOrManager && <li><Link href="/admin/dashboard" className="hover:text-primary-600">Админка</Link></li>}
            </ul>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(open => !open)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Уведомления"
                aria-expanded={isNotificationsOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <NotificationsDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
              )}
            </div>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="hover:text-primary-600 transition-colors">Личный кабинет</Link>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition-colors">Выйти</button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-primary-600 transition-colors">Войти</Link>
                <Link href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-5 rounded-xl shadow-soft hover:shadow-glow transition-all duration-300 text-sm">Регистрация</Link>
              </>
            )}
          </div>

          <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-soft">
            <ul className="px-4 py-3 space-y-1">
              <li><Link href="/" className="block py-2.5 px-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={toggleMenu}>Главная</Link></li>
              <li><Link href="/services" className="block py-2.5 px-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={toggleMenu}>Услуги</Link></li>
              <li><Link href="/contact" className="block py-2.5 px-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={toggleMenu}>Контакты</Link></li>
              {isAdminOrManager && <li><Link href="/admin/dashboard" className="block py-2.5 px-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={toggleMenu}>Админка</Link></li>}
              {isAuthenticated ? (
                <>
                  <li><Link href="/dashboard" className="block py-2.5 px-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={toggleMenu}>Личный кабинет</Link></li>
                  <li>
                    <button onClick={() => { handleLogout(); toggleMenu(); }} className="block w-full text-left py-2.5 px-3 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
                      Выйти
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="block py-2.5 px-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={toggleMenu}>Войти</Link></li>
                  <li><Link href="/signup" className="block py-2.5 px-3 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors" onClick={toggleMenu}>Регистрация</Link></li>
                </>
              )}
            </ul>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} AUTOHUB. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
