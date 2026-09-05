import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const BookingForm = ({ userId, onBookingSuccess }) => {
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    car_id: '',
    service_id: '',
    date_requested: '',
    mileage_at_order: '',
    comment_from_client: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        // Получаем автомобили текущего пользователя через специализированный эндпоинт
        const carsResponse = await axios.get(`${API_BASE_URL}/cars/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCars(carsResponse.data);

        // Получаем все услуги
        const servicesResponse = await axios.get(`${API_BASE_URL}/services/?skip=0&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(servicesResponse.data);

      } catch (err) {
        console.error('Error fetching cars or services for booking:', err);
        setError('Ошибка при загрузке данных для записи');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.car_id || !formData.service_id || !formData.date_requested) {
      alert('Пожалуйста, выберите автомобиль, услугу и дату.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/orders/`, {
        ...formData,
        user_id: userId, // Убедимся, что ID пользователя установлено
        // mileage_at_order: cars.find(c => c.id === parseInt(formData.car_id))?.mileage || 0 // Пример получения пробега
        // Пробег можно запросить отдельно или не отправлять, если необязателен
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Booking successful:', response.data);
      alert('Запись создана успешно!');
      onBookingSuccess(); // Уведомляем родительский компонент
      // Сброс формы
      setFormData({ car_id: '', service_id: '', date_requested: '', comment_from_client: '' });
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Ошибка при создании записи: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
    }
  };

  if (loading) {
    return <div>Загрузка данных для записи...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div>
        <label htmlFor="car_id" className="block text-sm font-medium text-gray-700 mb-1">Выберите автомобиль *</label>
        <select
          id="car_id"
          name="car_id"
          value={formData.car_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">-- Выберите автомобиль --</option>
          {cars.map(car => (
            <option key={car.id} value={car.id}>{car.brand} {car.model} ({car.license_plate || 'Без номера'})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="service_id" className="block text-sm font-medium text-gray-700 mb-1">Выберите услугу *</label>
        <select
          id="service_id"
          name="service_id"
          value={formData.service_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">-- Выберите услугу --</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>{service.name} - {service.price} руб.</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date_requested" className="block text-sm font-medium text-gray-700 mb-1">Желаемая дата и время *</label>
        <input
          type="datetime-local"
          id="date_requested"
          name="date_requested"
          value={formData.date_requested}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="mileage_at_order" className="block text-sm font-medium text-gray-700 mb-1">Пробег на момент записи (км)</label>
        <input
          type="number"
          id="mileage_at_order"
          name="mileage_at_order"
          value={formData.mileage_at_order}
          onChange={handleChange}
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="comment_from_client" className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
        <textarea
          id="comment_from_client"
          name="comment_from_client"
          value={formData.comment_from_client}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Записаться
      </button>
    </form>
  );
};

export default BookingForm;