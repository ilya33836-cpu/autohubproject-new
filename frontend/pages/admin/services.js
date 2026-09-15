import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';
import ServiceTable from '../../components/ServiceTable';
import { API_BASE_URL } from '../../utils/api';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]);
  return debouncedValue;
}

export default function AdminServices() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchUserDataAndServices = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { router.push('/login'); return; }
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const user = userResponse.data;
        if (user.role !== 'admin' && user.role !== 'manager') { setError('У вас нет доступа к этой странице.'); return; }
        setCurrentUser(user);
        let url = `${API_BASE_URL}/services/?skip=0&limit=1000`;
        if (debouncedSearchQuery) url += `&q=${encodeURIComponent(debouncedSearchQuery)}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        setServices(res.data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Ошибка при загрузке услуг');
        if (err.response?.status === 401) { localStorage.removeItem('access_token'); router.push('/login'); }
      } finally { setLoading(false); }
    };
    fetchUserDataAndServices();
  }, [router, debouncedSearchQuery]);

  const handleServiceUpdate = (id, data) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  const handleServiceDelete = (id) => setServices(prev => prev.filter(s => s.id !== id));
  const handleServiceCreate = (svc) => setServices(prev => [...prev, svc]);

  if (loading) return <div className="text-center py-24 text-steel-400">Загрузка услуг...</div>;
  if (error) return <div className="text-center py-24"><p className="text-red-500 mb-2">{error}</p><Link href="/admin/dashboard" className="text-steel-600 hover:text-steel-700">Вернуться в админ-панель</Link></div>;
  if (!currentUser) return <div className="text-center py-24"><p className="text-red-500 mb-2">Доступ запрещен.</p><Link href="/admin/dashboard" className="text-steel-600 hover:text-steel-700">Вернуться на главную</Link></div>;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-steel-600 hover:text-steel-700 text-sm font-medium">&larr; Назад в админ-панель</Link>
        </div>
        <h1 className="text-3xl font-extrabold mb-6">Управление услугами</h1>

        <div className="card-static-dark p-6">
          <ServiceTable services={services} onServiceUpdate={handleServiceUpdate} onServiceDelete={handleServiceDelete} onServiceCreate={handleServiceCreate} />
        </div>
      </div>
    </AdminLayout>
  );
}
