import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import { API_BASE_URL } from '../../utils/api';

// Импортируем компонент таблицы
import AdminCarTable from '../../components/AdminCarTable';

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

export default function AdminCars() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Состояние для поискового запроса
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Дебаунсим на 500мс

  useEffect(() => {
    const fetchUserDataAndCars = async () => {
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

        // Получаем все автомобили с учетом поискового запроса
        let url = `${API_BASE_URL}/cars/?skip=0&limit=1000`; // Увеличим лимит
        if (debouncedSearchQuery) {
          url += `&q=${encodeURIComponent(debouncedSearchQuery)}`;
        }
        const carsResponse = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCars(carsResponse.data);

      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Ошибка при загрузке автомобилей');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndCars();
  }, [router, debouncedSearchQuery]); // Зависимость от debouncedSearchQuery

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return <div className="text-center">Загрузка автомобилей...</div>;
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
        <h1 className="text-3xl font-bold mb-6">Управление автомобилями</h1>

      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800">&larr; Назад в админ-панель</Link>
      </div>

      {/* Поле поиска */}
      <div className="mb-6">
        <label htmlFor="search-input-cars" className="block text-sm font-medium text-gray-700 mb-1">
          Поиск (по ID, марке, модели, гос. номеру, VIN, ID владельца)
        </label>
        <input
          id="search-input-cars"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Введите ID, марку, модель, гос. номер или VIN..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <AdminCarTable cars={cars} />
      </div>
      </div>
    </AdminLayout>
  );
}