import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import { API_BASE_URL } from '../utils/api';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/notifications/my`, { headers: { Authorization: `Bearer ${token}` } });
        setNotifications(response.data);
      } catch (err) {
        setError('Ошибка при загрузке уведомлений');
        if (err.response?.status === 401) localStorage.removeItem('access_token');
      } finally { setLoading(false); }
    };
    fetchNotifications();
  }, [router]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}`, { is_read: true }, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-24 text-dark-400">Загрузка уведомлений...</div>;
  if (error) return <div className="text-center py-24"><p className="text-red-400 mb-2">{error}</p><Link href="/" className="text-steel-300 hover:text-steel-200">Вернуться на главную</Link></div>;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-8">
          <p className="text-steel-300 font-bold tracking-[0.3em] uppercase text-xs mb-2">Уведомления</p>
          <h1 className="text-3xl md:text-4xl font-black">Уведомления</h1>
        </div>

        <div className="mb-6">
          <Link href="/dashboard" className="text-steel-300 hover:text-steel-200 text-sm font-bold">&larr; Назад в личный кабинет</Link>
        </div>

        {notifications.length === 0 ? (
          <div className="card-static-dark p-12 text-center"><p className="text-dark-400 text-lg">У вас нет уведомлений.</p></div>
        ) : (
          <div className="card-static-dark overflow-hidden">
            <ul className="divide-y divide-dark-700">
              {notifications.map(n => (
                <li key={n.id} className={`p-5 cursor-pointer transition-colors ${!n.is_read ? 'bg-steel-300/5' : 'hover:bg-dark-700/50'}`} onClick={() => markAsRead(n.id)}>
                  <p className="text-dark-100">{n.message}</p>
                  <p className="text-xs text-dark-500 mt-1">{new Date(n.created_at).toLocaleString('ru-RU')} • Тип: {n.type}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
