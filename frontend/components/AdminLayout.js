import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const AdminLayout = ({ children, title = 'AUTOHUB Admin' }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
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

  if (!currentUser) {
    return <div className="text-center">Загрузка...</div>;
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/appointments', label: 'Записи' },
    { href: '/admin/clients', label: 'Клиенты' },
    { href: '/admin/cars', label: 'Автомобили' },
    { href: '/admin/services', label: 'Услуги' },
    { href: '/admin/calendar', label: 'Календарь' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <Head>
        <title>{title}</title>
      </Head>
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white dark:bg-gray-700 flex-shrink-0">
        <div className="p-4 text-xl font-bold">AUTOHUB Admin</div>
        <nav className="mt-4">
          <ul>
            {navItems.map(item => (
              <li key={item.href}>
                <Link href={item.href} className={`block px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-600 ${router.pathname === item.href ? 'bg-gray-700 dark:bg-gray-600' : ''}`}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/" className="block px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-600">На сайт</Link>
            </li>
            <li>
              <Link href="/crm" className="block px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-600">CRM</Link>
            </li>
            <li>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  router.push('/login');
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-600"
              >
                Выйти
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
