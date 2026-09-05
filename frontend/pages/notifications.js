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
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/notifications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Ошибка при загрузке уведомлений');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [router]);

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}`, { is_read: true }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Обновляем состояние локально
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (loading) {
    return <div className="text-center">Загрузка уведомлений...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <h1 className="text-3xl font-bold mb-6">Уведомления</h1>

        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">&larr; Назад в личный кабинет</Link>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-600">У вас нет уведомлений.</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`py-4 cursor-pointer ${!notification.is_read ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p>{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString('ru-RU')} | Тип: {notification.type}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}