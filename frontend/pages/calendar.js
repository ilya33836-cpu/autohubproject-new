import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale'; // Импорт русской локали
import moment from 'moment';
import 'moment/locale/ru'; // Импорт русской локали для moment
import { API_BASE_URL } from '../utils/api';

// Настройка moment с русской локалью
moment.locale('ru');
const localizer = momentLocalizer(moment);

// Функция для парсинга строки даты/времени из API в объект Date
const parseDateTime = (dateTimeStr) => {
  // API возвращает строку в формате ISO, которую JS может парсить напрямую
  return new Date(dateTimeStr);
};

export default function ClientCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Получаем данные пользователя
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        setCurrentUser(user);

        // Получаем заказы пользователя
        const ordersResponse = await axios.get(`${API_BASE_URL}/orders/my?skip=0&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Преобразуем заказы в формат событий для календаря
        const calendarEvents = ordersResponse.data.map(order => ({
          id: order.id,
          title: `${order.service.name} (${order.car.brand} ${order.car.model})`,
          start: parseDateTime(order.date_requested),
          end: new Date(parseDateTime(order.date_requested).getTime() + 60 * 60 * 1000), // Примерное окончание +1 час
          resourceId: order.user.id, // Можно использовать ID пользователя или автомобиля
          extendedProps: {
            orderData: order // Сохраняем полные данные заказа для возможного использования
          }
        }));

        setEvents(calendarEvents);
      } catch (err) {
        console.error('Error fetching orders for calendar:', err);
        setError('Ошибка при загрузке записей для календаря');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndOrders();
  }, [router]);

  // Пользовательские компоненты для отображения событий (опционально)
  const EventComponent = ({ event }) => (
    <div className="truncate">
      <strong>{event.title.split(' (')[0]}</strong> {/* Отображаем только название услуги */}
      <br />
      <small>{event.title.split('(')[1]?.replace(')', '')}</small> {/* Отображаем автомобиль */}
    </div>
  );

  if (loading) {
    return <div className="text-center">Загрузка календаря...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">Вернуться в личный кабинет</Link>
      </div>
    );
  }

  if (!currentUser) {
     return (
      <div className="text-center">
        <p className="text-red-500">Доступ запрещен.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Календарь записей</h1>

        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">&larr; Назад в личный кабинет</Link>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md h-[70vh]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }} // Занимаем всю высоту контейнера
            messages={{
              // Локализация интерфейса календаря
              month: 'Месяц',
              week: 'Неделя',
              day: 'День',
              agenda: 'Повестка дня',
              date: 'Дата',
              time: 'Время',
              event: 'Событие',
              // ... другие сообщения можно добавить по необходимости
            }}
            eventPropGetter={(event) => ({
              // Позволяет кастомизировать стиль событий
              className: `rbc-event-${event.extendedProps.orderData.status}`,
              style: {
                backgroundColor: event.extendedProps.orderData.status === 'completed' ? '#4ade80' : '#93c5fd', // Green for completed, blue for others
                borderColor: 'transparent',
              },
            })}
            components={{
              event: EventComponent, // Используем пользовательский компонент
            }}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}