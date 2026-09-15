import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import AdminCarTable from '../../components/AdminCarTable';
import { API_BASE_URL } from '../../utils/api';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminCars() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchUserDataAndCars = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const user = userResponse.data;
        if (user.role !== 'admin' && user.role !== 'manager') { setError('У вас нет доступа к этой странице.'); return; }
        setCurrentUser(user);
        let url = `${API_BASE_URL}/cars/?skip=0&limit=1000`;
        if (debouncedSearchQuery) url += `&q=${encodeURIComponent(debouncedSearchQuery)}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setCars(res.data);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Ошибка при загрузке автомобилей');
        if (err.response?.status === 401) { localStorage.removeItem('access_token'); router.push('/login'); }
      } finally { setLoading(false); }
    };
    fetchUserDataAndCars();
  }, [router, debouncedSearchQuery]);

  if (loading) return <div className="text-center py-24 text-gray-500">Загрузка автомобилей...</div>;
  if (error) return <div className="text-center py-24"><p className="text-red-500 mb-2">{error}</p><Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-700">Вернуться в админ-панель</Link></div>;
  if (!currentUser) return <div className="text-center py-24"><p className="text-red-500 mb-2">Доступ запрещен.</p><Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-700">Вернуться на главную</Link></div>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">&larr; Назад в админ-панель</Link>
        </div>
        <h1 className="text-3xl font-extrabold mb-6">Управление автомобилями</h1>

        <div className="mb-6">
          <label htmlFor="search-input-cars" className="input-label">Поиск</label>
          <input id="search-input-cars" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Введите ID, марку, модель, гос. номер или VIN..." className="input-field max-w-md" />
        </div>

        <div className="card-static p-6">
          <AdminCarTable cars={cars} />
        </div>
      </div>
    </AdminLayout>
  );
}
