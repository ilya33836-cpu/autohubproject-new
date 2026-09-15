import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import AppointmentTable from '../../components/AppointmentTable';
import { API_BASE_URL } from '../../utils/api';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]);
  return debouncedValue;
}

export default function AdminAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [plateQuery, setPlateQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchUserDataAndAppointments = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const user = userResponse.data;
        if (user.role !== 'admin' && user.role !== 'manager') { setError('У вас нет доступа к этой странице.'); return; }
        setCurrentUser(user);
        let url = `${API_BASE_URL}/orders/?skip=0&limit=1000`;
        if (debouncedSearchQuery) url += `&q=${encodeURIComponent(debouncedSearchQuery)}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Ошибка при загрузке записей');
        if (err.response?.status === 401) { localStorage.removeItem('access_token'); router.push('/login'); }
      } finally { setLoading(false); }
    };
    fetchUserDataAndAppointments();
  }, [router, debouncedSearchQuery]);

  const handleStatusUpdate = (orderId, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === orderId ? { ...a, status: newStatus } : a));
  };

  if (loading) return <div className="text-center py-24 text-gray-500">Загрузка записей...</div>;
  if (error) return <div className="text-center py-24"><p className="text-red-500 mb-2">{error}</p><Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-700">Вернуться в админ-панель</Link></div>;
  if (!currentUser) return <div className="text-center py-24"><p className="text-red-500 mb-2">Доступ запрещен.</p><Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-700">Вернуться на главную</Link></div>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">&larr; Назад в админ-панель</Link>
        </div>
        <h1 className="text-3xl font-extrabold mb-6">Управление записями</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="search-input" className="input-label">Поиск</label>
            <input id="search-input" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Введите ID или статус..." className="input-field" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="date-filter" className="input-label">Фильтр по дате</label>
              <input id="date-filter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-field" />
            </div>
            <div className="flex-1">
              <label htmlFor="plate-filter" className="input-label">Поиск по номеру</label>
              <input id="plate-filter" type="text" value={plateQuery} onChange={(e) => setPlateQuery(e.target.value)} placeholder="Гос. номер..." className="input-field" />
            </div>
          </div>
        </div>

        <div className="card-static-dark p-6">
          <AppointmentTable appointments={appointments} onUpdateStatus={handleStatusUpdate} dateFilter={dateFilter} plateQuery={plateQuery} />
        </div>
      </div>
    </AdminLayout>
  );
}
