import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../utils/api';

const API = API_BASE_URL;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [ordersByDay, setOrdersByDay] = useState(null);
  const [revenueByDay, setRevenueByDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDataAndStats = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      try {
        const userResponse = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const user = userResponse.data;
        if (user.role !== 'admin' && user.role !== 'manager') { setError('У вас нет доступа к административной панели.'); return; }
        setCurrentUser(user);
        const [statsRes, ordersRes, revenueRes] = await Promise.all([
          axios.get(`${API}/admin/stats/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/stats/orders-by-day?days=14`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/admin/stats/revenue-by-day?days=14`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(statsRes.data);
        setOrdersByDay(ordersRes.data);
        setRevenueByDay(revenueRes.data);
      } catch (err) {
        console.error('Error fetching data for admin dashboard:', err);
        setError('Ошибка при загрузке данных адм-панели');
        if (err.response?.status === 401) { localStorage.removeItem('access_token'); router.push('/login'); }
      } finally { setLoading(false); }
    };
    fetchUserDataAndStats();
  }, [router]);

  const ordersChartData = {
    labels: ordersByDay?.labels || [],
    datasets: [{ label: 'Заказы', data: ordersByDay?.values || [], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.15)', tension: 0.4, fill: true }],
  };
  const revenueChartData = {
    labels: revenueByDay?.labels || [],
    datasets: [{ label: 'Выручка (руб)', data: revenueByDay?.values || [], borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.15)', tension: 0.4, fill: true }],
  };
  const chartOptions = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } };

  if (loading) return <div className="text-center py-24 text-gray-500">Загрузка админ-панели...</div>;
  if (error) return <div className="text-center py-24"><p className="text-red-500 mb-2">{error}</p><Link href="/" className="text-primary-600 hover:text-primary-700">Вернуться на главную</Link></div>;
  if (!currentUser) return <div className="text-center py-24"><p className="text-red-500 mb-2">Доступ запрещен.</p><Link href="/" className="text-primary-600 hover:text-primary-700">Вернуться на главную</Link></div>;

  const statCards = [
    { label: 'Новые заявки', value: stats.new_appointments_count, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'В работе', value: stats.cars_in_work_count, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Завершено', value: stats.completed_orders_count, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Выручка', value: stats.total_revenue, color: 'text-purple-600', bg: 'bg-purple-50', suffix: ' руб' },
  ];

  const navCards = [
    { href: '/admin/appointments', title: 'Управление записями', desc: 'Просмотр и изменение статусов всех записей.' },
    { href: '/admin/clients', title: 'Управление клиентами', desc: 'Просмотр списка клиентов и их автомобилей.' },
    { href: '/admin/cars', title: 'Управление автомобилями', desc: 'Просмотр всех автомобилей.' },
    { href: '/admin/services', title: 'Управление услугами', desc: 'Создание, редактирование и удаление услуг.' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-10">
          <p className="text-primary-600 font-semibold tracking-widest uppercase text-sm mb-2">Админ-панель</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">Добро пожаловать, {currentUser.full_name || currentUser.username}</h1>
          <p className="text-gray-500 mt-1">Роль: {currentUser.role}</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((s) => (
              <div key={s.label} className="card p-6">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <div className={`w-5 h-5 rounded ${s.color.replace('text-', 'bg-')}`} />
                </div>
                <h3 className="text-sm font-medium text-gray-500">{s.label}</h3>
                <p className={`text-3xl font-extrabold mt-1 ${s.color}`}>{s.value}{s.suffix || ''}</p>
              </div>
            ))}
          </div>
        )}

        {typeof window !== 'undefined' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Количество заказов по дням</h3>
              <Line data={ordersChartData} options={chartOptions} />
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Выручка по дням</h3>
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {navCards.map(c => (
            <Link key={c.href} href={c.href} className="card p-6 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1 group-hover:text-primary-600 transition-colors">{c.title}</h2>
                  <p className="text-gray-500">{c.desc}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
