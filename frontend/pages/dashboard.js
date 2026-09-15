import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import { API_BASE_URL } from '../utils/api';

const API = API_BASE_URL;

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const response = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(response.data);
      } catch (err) {
        setError('Ошибка при загрузке данных пользователя');
        if (err.response?.status === 401) localStorage.removeItem('access_token');
      } finally { setLoading(false); }
    };
    fetchUserData();
  }, [router]);

  if (loading) return <div className="text-center py-24 text-dark-400">Загрузка...</div>;
  if (error) return <div className="text-center py-24 text-red-400">{error}</div>;

  const cards = [
    { href: '/my-cars', title: 'Мои автомобили', desc: 'Управляйте своими автомобилями.' },
    { href: '/book-service', title: 'Онлайн-запись', desc: 'Запишитесь на обслуживание.' },
    { href: '/history', title: 'История обслуживания', desc: 'Просмотрите историю ваших посещений.' },
    { href: '/notifications', title: 'Уведомления', desc: 'Проверьте последние уведомления.' },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-10">
          <p className="text-steel-300 font-bold tracking-[0.3em] uppercase text-xs mb-2">Панель управления</p>
          <h1 className="text-3xl md:text-4xl font-black">Личный кабинет, {userData?.full_name || userData?.username}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <a key={card.href} href={card.href} className="card-dark p-6 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1 group-hover:text-steel-300 transition-colors">{card.title}</h2>
                  <p className="text-dark-400">{card.desc}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center group-hover:bg-steel-300/20 transition-colors">
                  <svg className="w-5 h-5 text-steel-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
