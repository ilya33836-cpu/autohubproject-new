import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru'; // Импорт русской локали для moment
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Импорт CSS для календаря
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../utils/api';

// Настройка moment с русской локалью
moment.locale('ru');
const localizer = momentLocalizer(moment);

// Функция для парсинга строки даты/времени из API в объект Date
const parseDateTime = (dateTimeStr) => {
  return new Date(dateTimeStr);
};

export default function AdminCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserDataAndAllOrders = async () => {
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

        // Проверяем роль
        if (user.role !== 'admin' && user.role !== 'manager') {
          setError('У вас нет доступа к этой странице.');
          return;
        }
        setCurrentUser(user);

        // Получаем ВСЕ заказы
        const ordersResponse = await axios.get(`${API_BASE_URL}/orders/?skip=0&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Преобразуем ВСЕ заказы в формат событий для календаря
        const calendarEvents = ordersResponse.data.map(order => ({
          id: order.id,
          title: `${order.service.name} (${order.user.full_name || order.user.username})`, // Показываем услугу и имя клиента
          start: parseDateTime(order.date_requested),
          end: new Date(parseDateTime(order.date_requested).getTime() + 60 * 60 * 1000), // Примерное окончание +1 час
          resourceId: order.user.id, // Используем ID пользователя как ресурс
          extendedProps: {
            orderData: order // Сохраняем полные данные заказа
          }
        }));

        setEvents(calendarEvents);
      } catch (err) {
        console.error('Error fetching orders for admin calendar:', err);
        setError('Ошибка при загрузке записей для календаря');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndAllOrders();
  }, [router]);

  // Пользовательские компоненты для отображения событий (опционально)
  const EventComponent = ({ event }) => (
    <div className="truncate">
      <strong>{event.title.split(' (')[0]}</strong> {/* Отображаем только название услуги */}
      <br />
      <small>({event.extendedProps.orderData.user.full_name || event.extendedProps.orderData.user.username})</small> {/* Отображаем имя клиента */}
    </div>
  );

  if (loading) {
    return <div className="text-center">Загрузка календаря...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">Вернуться в админ-панель</Link>
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
     return (
      <div className="text-center">
        <p className="text-red-500">Доступ запрещен.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Календарь записей (Админ)</h1>

      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">&larr; Назад в админ-панель</Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md h-[70vh]">
        {typeof window !== 'undefined' ? (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={{
            month: 'Месяц',
            week: 'Неделя',
            day: 'День',
            agenda: 'Повестка дня',
            date: 'Дата',
            time: 'Время',
            event: 'Событие',
          }}
          eventPropGetter={(event) => ({
            className: `rbc-event-${event.extendedProps.orderData.status}`,
            style: {
              backgroundColor: `hsl(${event.resourceId % 360}, 70%, 80%)`,
              borderColor: 'transparent',
            },
          })}
          components={{
            event: EventComponent,
          }}
        />
        ) : (
          <p>Загрузка календаря...</p>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}