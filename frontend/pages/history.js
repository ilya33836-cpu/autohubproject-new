import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import OrderCard from '../components/OrderCard';
import { API_BASE_URL } from '../utils/api';

export default function History() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // Состояние для отфильтрованных заказов
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // Состояние для фильтра статуса

  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      try {
        // Получаем данные текущего пользователя
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        setCurrentUser(user);

        // Получаем заказы пользователя
        const ordersResponse = await axios.get(`${API_BASE_URL}/orders/my?skip=0&limit=1000`, { // Увеличил лимит
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(ordersResponse.data);
        setFilteredOrders(ordersResponse.data); // Изначально отображаем все

      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Ошибка при загрузке истории обслуживания');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndOrders();
  }, [router]);

  // Применяем фильтр при изменении selectedStatusFilter
  useEffect(() => {
    if (orders.length > 0) {
      if (selectedStatusFilter === 'all') {
        setFilteredOrders(orders);
      } else {
        setFilteredOrders(orders.filter(order => order.status === selectedStatusFilter));
      }
    }
  }, [selectedStatusFilter, orders]);

  const handleStatusFilterChange = (e) => {
    setSelectedStatusFilter(e.target.value);
  };

  if (loading) {
    return <div className="text-center">Загрузка истории...</div>;
  }

  // Список возможных статусов для фильтра
  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'new', label: 'Новый' },
    { value: 'confirmed', label: 'Подтвержден' },
    { value: 'accepted', label: 'Принят' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'waiting_parts', label: 'Ожидание запчастей' },
    { value: 'completed', label: 'Завершен' },
    { value: 'cancelled', label: 'Отменен' },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <h1 className="text-3xl font-bold mb-6">История обслуживания</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Фильтр по статусу */}
        <div className="mb-6">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Фильтр по статусу
          </label>
          <select
            id="status-filter"
            value={selectedStatusFilter}
            onChange={handleStatusFilterChange}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-gray-600">Нет заказов с выбранным статусом.</p>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}