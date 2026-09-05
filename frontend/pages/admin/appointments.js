import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../utils/api';

// Импортируем компонент таблицы
import AppointmentTable from '../../components/AppointmentTable';

// Простой хук для дебаунсинга
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

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
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Проверяем роль пользователя
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        if (user.role !== 'admin' && user.role !== 'manager') {
          setError('У вас нет доступа к этой странице.');
          return;
        }
        setCurrentUser(user);

        // Получаем все заказы с учетом поискового запроса
        let url = `${API_BASE_URL}/orders/?skip=0&limit=1000`;
        if (debouncedSearchQuery) {
          url += `&q=${encodeURIComponent(debouncedSearchQuery)}`;
        }
        const appointmentsResponse = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(appointmentsResponse.data);

      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Ошибка при загрузке записей');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndAppointments();
  }, [router, debouncedSearchQuery]); // Зависимость от debouncedSearchQuery

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handlePlateQueryChange = (e) => {
    setPlateQuery(e.target.value);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    setAppointments(prev => prev.map(app => app.id === orderId ? { ...app, status: newStatus } : app));
  };

  if (loading) {
    return <div className="text-center">Загрузка записей...</div>;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">Вернуться в админ-панель</Link>
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Управление записями</h1>

      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">&larr; Назад в админ-панель</Link>
      </div>

      {/* Поле поиска */}
      <div className="mb-6">
        <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">
          Поиск (по ID заказа, ID клиента, ID авто, ID услуги или статусу)
        </label>
        <input
          id="search-input"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Введите ID или статус..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Фильтр по дате
          </label>
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={handleDateFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="plate-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Поиск по гос. номеру
          </label>
          <input
            id="plate-filter"
            type="text"
            value={plateQuery}
            onChange={handlePlateQueryChange}
            placeholder="Введите гос. номер..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <AppointmentTable appointments={appointments} onUpdateStatus={handleStatusUpdate} dateFilter={dateFilter} plateQuery={plateQuery} />
      </div>
      </div>
    </AdminLayout>
  );
}