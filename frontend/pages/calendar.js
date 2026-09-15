import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ProtectedRoute from '../components/ProtectedRoute';
import { API_BASE_URL } from '../utils/api';

moment.locale('ru');
const localizer = momentLocalizer(moment);

const parseDateTime = (dt) => new Date(dt);

export default function ClientCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      try {
        const userRes = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const user = userRes.data;
        setCurrentUser(user);
        const ordersRes = await axios.get(`${API_BASE_URL}/orders/my?skip=0&limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
        const calendarEvents = ordersRes.data.map(o => ({
          id: o.id,
          title: `${o.service.name} (${o.car.brand} ${o.car.model})`,
          start: parseDateTime(o.date_requested),
          end: new Date(parseDateTime(o.date_requested).getTime() + 60 * 60 * 1000),
          extendedProps: { orderData: o },
        }));
        setEvents(calendarEvents);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Ошибка при загрузке записей');
        if (err.response?.status === 401) { localStorage.removeItem('access_token'); router.push('/login'); }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  const EventComponent = ({ event }) => (
    <div className="truncate">
      <strong>{event.title.split(' (')[0]}</strong>
      <br />
      <small>{event.title.split('(')[1]?.replace(')', '')}</small>
    </div>
  );

  if (loading) return <div className="text-center py-24 text-gray-500">Загрузка календаря...</div>;
  if (error) return <div className="text-center py-24"><p className="text-red-500 mb-2">{error}</p><Link href="/dashboard" className="text-primary-600 hover:text-primary-700">Вернуться в личный кабинет</Link></div>;
  if (!currentUser) return <div className="text-center py-24"><p className="text-red-500 mb-2">Доступ запрещен.</p><Link href="/" className="text-primary-600 hover:text-primary-700">Вернуться на главную</Link></div>;

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">&larr; Назад в личный кабинет</Link>
        </div>
        <h1 className="text-3xl font-extrabold mb-6">Календарь записей</h1>

        <div className="card-static p-4 h-[70vh]">
          {typeof window !== 'undefined' ? (
            <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: '100%' }}
              messages={{ month: 'Месяц', week: 'Неделя', day: 'День', agenda: 'Повестка дня', date: 'Дата', time: 'Время', event: 'Событие' }}
              eventPropGetter={() => ({ style: { borderRadius: '8px', border: 'none' } })}
              components={{ event: EventComponent }}
            />
          ) : <p>Загрузка календаря...</p>}
        </div>
      </div>
    </ProtectedRoute>
  );
}
