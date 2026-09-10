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
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Получаем данные пользователя
        const userResponse = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;

        // Проверяем роль
        if (user.role !== 'admin' && user.role !== 'manager') {
          setError('У вас нет доступа к административной панели.');
          return;
        }
        setCurrentUser(user);

        // Получаем статистику
        const [statsResponse, ordersResponse, revenueResponse] = await Promise.all([
          axios.get(`${API}/admin/stats/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/admin/stats/orders-by-day?days=14`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/admin/stats/revenue-by-day?days=14`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setStats(statsResponse.data);
        setOrdersByDay(ordersResponse.data);
        setRevenueByDay(revenueResponse.data);

      } catch (err) {
        console.error('Error fetching data for admin dashboard:', err);
        setError('Ошибка при загрузке данных админ-панели');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndStats();
  }, [router]);

  const ordersChartData = {
    labels: ordersByDay?.labels || [],
    datasets: [
      {
        label: 'Заказы',
        data: ordersByDay?.values || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const revenueChartData = {
    labels: revenueByDay?.labels || [],
    datasets: [
      {
        label: 'Выручка (руб)',
        data: revenueByDay?.values || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  if (loading) {
    return <div className="text-center">Загрузка админ-панели...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">Вернуться на главную</Link>
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
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <h1 className="text-3xl font-bold mb-6">Административная панель</h1>
      <p className="mb-4">Добро пожаловать, {currentUser.full_name || currentUser.username} (Роль: {currentUser.role})</p>

      {/* Сводная статистика */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Новые заявки</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.new_appointments_count}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">В работе</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.cars_in_work_count}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Завершено</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed_orders_count}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Выручка</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.total_revenue} руб</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mb-8">Не удалось загрузить статистику.</p>
      )}

      {/* Графики */}
      {typeof window !== 'undefined' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Количество заказов по дням</h3>
          <Line data={ordersChartData} options={chartOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Выручка по дням</h3>
          <Line data={revenueChartData} options={chartOptions} />
        </div>
      </div>
      )}

      {/* Ссылки на другие разделы админки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/appointments" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <h2 className="text-xl font-semibold mb-2">Управление записями</h2>
          <p>Просмотр и изменение статусов всех записей.</p>
        </Link>
        <Link href="/admin/clients" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <h2 className="text-xl font-semibold mb-2">Управление клиентами</h2>
          <p>Просмотр списка клиентов и их автомобилей.</p>
        </Link>
        <Link href="/admin/cars" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <h2 className="text-xl font-semibold mb-2">Управление автомобилями</h2>
          <p>Просмотр всех автомобилей.</p>
        </Link>
        <Link href="/admin/services" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <h2 className="text-xl font-semibold mb-2">Управление услугами</h2>
          <p>Создание, редактирование и удаление услуг.</p>
        </Link>
      </div>
      </div>
    </AdminLayout>
  );
}