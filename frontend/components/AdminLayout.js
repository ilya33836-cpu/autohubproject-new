import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const AdminLayout = ({ children, title = 'AUTOHUB Admin' }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setCurrentUser(data))
      .catch(() => {
        localStorage.removeItem('access_token');
        router.push('/login');
      });
  }, [router]);

  if (!currentUser) return <div className="min-h-screen flex items-center justify-center text-steel-400">Загрузка...</div>;

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/appointments', label: 'Записи', icon: '📅' },
    { href: '/admin/clients', label: 'Клиенты', icon: '👥' },
    { href: '/admin/cars', label: 'Автомобили', icon: '🚗' },
    { href: '/admin/services', label: 'Услуги', icon: '🔧' },
    { href: '/admin/calendar', label: 'Календарь', icon: '🗓️' },
  ];

  return (
    <div className="min-h-screen flex bg-dark-950">
      <Head><title>{title}</title></Head>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-dark-700 text-white rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          <span className="text-xl font-bold gradient-text">AUTOHUB</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-dark-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-grow mt-4 px-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                router.pathname === item.href ? 'bg-dark-700 text-white' : 'hover:bg-dark-800 text-steel-400'
              }`}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <Link href="/" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-800 text-steel-400 transition-all duration-200">
            <span className="text-lg">🌐</span> На сайт
          </Link>
          <Link href="/crm" onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-800 text-steel-400 transition-all duration-200">
            <span className="text-lg">🤝</span> CRM
          </Link>
        </nav>
        <div className="p-3 border-t border-dark-600">
          <button onClick={() => { localStorage.removeItem('access_token'); router.push('/login'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-all duration-200">
            <span className="text-lg">⏻</span> Выйти
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-grow md:ml-64 p-6 md:p-8 overflow-y-auto bg-dark-900">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
