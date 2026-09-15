import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const NotificationsDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) { // Загружаем только если dropdown открыт
      const fetchNotifications = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Требуется авторизация');
          setLoading(false);
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
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [isOpen]); // Зависит от isOpen

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
      // Закрываем dropdown после прочтения
      onClose();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Обработчик клика вне компонента для закрытия
  // NOTE: Реализация через useRef и useEffect была бы более правильной, но для простоты пусть будет onClose снаружи
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-xl overflow-hidden z-50 border border-gray-100">
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading && <p className="p-4 text-center">Загрузка...</p>}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}
        {!loading && !error && notifications.length === 0 && (
          <p className="p-4 text-center text-gray-500">Нет новых уведомлений</p>
        )}
        {!loading && !error && notifications.length > 0 && (
          <ul className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 cursor-pointer transition-colors ${!notification.is_read ? 'bg-primary-50' : 'hover:bg-surface-50'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <p className={!notification.is_read ? 'font-semibold' : ''}>{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.created_at).toLocaleString('ru-RU')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-2 bg-gray-50 border-t text-center">
        <Link href="/notifications" className="text-blue-600 hover:text-blue-800 text-sm" onClick={onClose}>
          Показать все
        </Link>
      </div>
    </div>
  );
};

export default NotificationsDropdown;