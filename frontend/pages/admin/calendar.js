import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../utils/api';

moment.locale('ru');
const localizer = momentLocalizer(moment);

const parseDateTime = (dt) => new Date(dt);

export default function AdminCalendar() {
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
        if (user.role !== 'admin' && user.role !== 'manager') { setError('У вас нет доступа к этой странице.'); return; }
        setCurrentUser(user);
        const ordersRes = await axios.get(`${API_BASE_URL}/orders/?skip=0&limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
        const calendarEvents = ordersRes.data.map(o => ({
          id: o.id,
          title: `${o.service.name} (${o.user.full_name || o.user.username})`,
          start: parseDateTime(o.date_requested),
          end: new Date(parseDateTime(o.date_requested).getTime() + 60 * 60 * 1000),
          resourceId: o.user.id,
          extendedProps: { orderData: o },
        }));
        setEvents(calendarEvents);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Ошибка при загрузке записей для календаря');
        if (err.response?.status === 401) { localStorage.removeItem('access_token'); router.push('/login'); }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  const EventComponent = ({ event }) => (
    <div className="truncate">
      <strong>{event.title.split(' (')[0]}</strong>
      <br />
      <small>({event.extendedProps.orderData.user.full_name || event.extendedProps.orderData.user.username})</small>
    </div>
  );

  if (loading) return <div className="text-center py-24 text-steel-400">Загрузка календаря...</div>;
  if (error) return <div className="text-center py-24"><p className="text-red-500 mb-2">{error}</p><Link href="/admin/dashboard" className="text-steel-600 hover:text-steel-700">Вернуться в админ-панель</Link></div>;
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) return <div className="text-center py-24"><p className="text-red-500 mb-2">Доступ запрещен.</p><Link href="/admin/dashboard" className="text-steel-600 hover:text-steel-700">Вернуться на главную</Link></div>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-steel-600 hover:text-steel-700 text-sm font-medium">&larr; Назад в админ-панель</Link>
        </div>
        <h1 className="text-3xl font-extrabold mb-6">Календарь записей</h1>

        <div className="card-static-dark p-4 h-[70vh]">
          {typeof window !== 'undefined' ? (
            <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: '100%' }}
              messages={{ month: 'Месяц', week: 'Неделя', day: 'День', agenda: 'Повестка дня', date: 'Дата', time: 'Время', event: 'Событие' }}
              eventPropGetter={() => ({ style: { borderRadius: '8px', border: 'none' } })}
              components={{ event: EventComponent }}
            />
          ) : <p>Загрузка календаря...</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
