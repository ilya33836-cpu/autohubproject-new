import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../utils/api';

// Импортируем компонент таблицы
import ServiceTable from '../../components/ServiceTable';

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

export default function AdminServices() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Состояние для поискового запроса
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Дебаунсим на 500мс

  useEffect(() => {
    const fetchUserDataAndServices = async () => {
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

        // Получаем все услуги с учетом поискового запроса
        let url = `${API_BASE_URL}/services/?skip=0&limit=1000`; // Увеличим лимит
        if (debouncedSearchQuery) {
          url += `&q=${encodeURIComponent(debouncedSearchQuery)}`;
        }
        const servicesResponse = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(servicesResponse.data);

      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Ошибка при загрузке услуг');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndServices();
  }, [router, debouncedSearchQuery]); // Зависимость от debouncedSearchQuery

  const handleServiceUpdate = (id, updatedData) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  const handleServiceDelete = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleServiceCreate = (newService) => {
    setServices(prev => [...prev, newService]);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return <div className="text-center">Загрузка услуг...</div>;
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
        <h1 className="text-3xl font-bold mb-6">Управление услугами</h1>

      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">&larr; Назад в админ-панель</Link>
      </div>

      {/* Поле поиска */}
      <div className="mb-6">
        <label htmlFor="search-input-services" className="block text-sm font-medium text-gray-700 mb-1">
          Поиск (по ID, названию, описанию, категории)
        </label>
        <input
          id="search-input-services"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Введите ID, название, описание или категорию..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <ServiceTable
          services={services}
          onServiceUpdate={handleServiceUpdate}
          onServiceDelete={handleServiceDelete}
          onServiceCreate={handleServiceCreate}
        />
      </div>
      </div>
    </AdminLayout>
  );
}