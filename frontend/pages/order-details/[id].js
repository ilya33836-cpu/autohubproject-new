import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import { generateOrderPDF } from '../../utils/pdfGenerator'; // Импортируем функцию генерации PDF
import { API_BASE_URL } from '../../utils/api';

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query; // Получаем ID заказа из URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return; // Ждем, пока router.query.id станет доступен

    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Проверяем, принадлежит ли заказ текущему пользователю
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = userResponse.data;

        if (response.data.user.id !== currentUser.id) {
            throw new Error('У вас нет доступа к этому заказу.');
        }

        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Ошибка при загрузке данных заказа');
        if (err.response?.status === 401 || err.message.includes('нет доступа')) {
          if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
          }
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, router]);

  const statusLabels = {
    new: 'Новый',
    confirmed: 'Подтверждён',
    accepted: 'Принят',
    in_progress: 'В работе',
    waiting_parts: 'Ожидает запчасти',
    completed: 'Завершён',
    cancelled: 'Отменён',
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-yellow-900/40 text-yellow-300',
      confirmed: 'bg-blue-900/40 text-blue-300',
      accepted: 'bg-indigo-900/40 text-indigo-300',
      in_progress: 'bg-purple-900/40 text-purple-300',
      waiting_parts: 'bg-orange-900/40 text-orange-300',
      completed: 'bg-green-900/40 text-green-300',
      cancelled: 'bg-red-900/40 text-red-300',
    };
    return colors[status] || 'bg-dark-700 text-steel-100';
  };

  if (loading) {
    return <div className="text-center">Загрузка деталей заказа...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const formattedDate = new Date(order.date_requested).toLocaleString('ru-RU');

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Детали заказа #{order.id}</h1>

        <div className="bg-dark-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Информация о заказе</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Статус:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>{statusLabels[order.status] || order.status}</span></p>
              <p><strong>Дата и время записи:</strong> {formattedDate}</p>
              <p><strong>Комментарий клиента:</strong> {order.comment_from_client || 'Нет'}</p>
              <p><strong>Мастер:</strong> {order.assigned_worker?.full_name || 'Не назначен'}</p>
            </div>
            <div>
              <p><strong>Итоговая стоимость:</strong> {order.total_cost} руб.</p>
              <p><strong>Пробег при записи:</strong> {order.mileage_at_order || 'N/A'} км</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Информация об автомобиле</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Марка:</strong> {order.car.brand}</p>
              <p><strong>Модель:</strong> {order.car.model}</p>
              <p><strong>Год:</strong> {order.car.year}</p>
            </div>
            <div>
              <p><strong>Гос. номер:</strong> {order.car.license_plate || 'Не указан'}</p>
              <p><strong>VIN:</strong> {order.car.vin || 'Не указан'}</p>
              <p><strong>Пробег:</strong> {order.car.mileage || 'N/A'} км</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Выполненная работа (Услуга)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Название:</strong> {order.service.name}</p>
              <p><strong>Категория:</strong> {order.service.category || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Описание:</strong> {order.service.description || 'Нет'}</p>
              <p><strong>Цена:</strong> {order.service.price} руб.</p>
            </div>
          </div>
        </div>

        {order.order_services && order.order_services.length > 0 && (
          <div className="bg-dark-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Дополнительные работы</h2>
            <table className="min-w-full divide-y divide-dark-600">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-steel-400 uppercase">Название</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-steel-400 uppercase">Цена</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-steel-400 uppercase">Кол-во</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-steel-400 uppercase">Сумма</th>
                </tr>
              </thead>
              <tbody className="bg-dark-800 divide-y divide-dark-600">
                {order.order_services.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-2 text-sm text-steel-100">{line.name}</td>
                    <td className="px-4 py-2 text-sm text-steel-400">{line.price} руб.</td>
                    <td className="px-4 py-2 text-sm text-steel-400">{line.quantity}</td>
                    <td className="px-4 py-2 text-sm text-steel-400">{line.total} руб.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(order.comment_from_master || order.recommendations) && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Комментарии и рекомендации</h2>
            {order.comment_from_master && (
              <div className="mb-3">
                <p className="font-medium">Комментарий мастера:</p>
                <p>{order.comment_from_master}</p>
              </div>
            )}
            {order.recommendations && (
              <div>
                <p className="font-medium">Рекомендации:</p>
                <p>{order.recommendations}</p>
              </div>
            )}
          </div>
        )}

        {/* Кнопка экспорта в PDF */}
        <div className="mt-6">
          <button
            onClick={() => generateOrderPDF(order)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Скачать PDF
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
