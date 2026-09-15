import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import OrderCard from '../components/OrderCard';
import { API_BASE_URL } from '../utils/api';

export default function History() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const ordersResponse = await axios.get(`${API_BASE_URL}/orders/my?skip=0&limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
        setOrders(ordersResponse.data);
        setFilteredOrders(ordersResponse.data);
      } catch (err) {
        setError('Ошибка при загрузке истории обслуживания');
        if (err.response?.status === 401) localStorage.removeItem('access_token');
      } finally { setLoading(false); }
    };
    fetchUserDataAndOrders();
  }, [router]);

  useEffect(() => {
    if (orders.length > 0) {
      setFilteredOrders(selectedStatusFilter === 'all' ? orders : orders.filter(o => o.status === selectedStatusFilter));
    }
  }, [selectedStatusFilter, orders]);

  if (loading) return <div className="text-center py-24 text-dark-400">Загрузка истории...</div>;

  const statusOptions = [
    { value: 'all', label: 'Все статусы' }, { value: 'new', label: 'Новый' }, { value: 'confirmed', label: 'Подтверждён' },
    { value: 'accepted', label: 'Принят' }, { value: 'in_progress', label: 'В работе' }, { value: 'waiting_parts', label: 'Ожидает запчасти' },
    { value: 'completed', label: 'Завершён' }, { value: 'cancelled', label: 'Отменён' },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-8">
          <p className="text-steel-300 font-bold tracking-[0.3em] uppercase text-xs mb-2">История</p>
          <h1 className="text-3xl md:text-4xl font-black">История обслуживания</h1>
        </div>

        {error && <div className="bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <div className="mb-6">
          <label htmlFor="status-filter" className="input-label-dark">Фильтр по статусу</label>
          <select id="status-filter" value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className="input-dark max-w-xs">
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="card-static-dark p-12 text-center"><p className="text-dark-400 text-lg">Нет заказов с выбранным статусом.</p></div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
