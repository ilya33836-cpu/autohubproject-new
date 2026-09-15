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
        const carsResponse = await axios.get(`${API_BASE_URL}/cars/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCars(carsResponse.data);

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
        user_id: userId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Booking successful:', response.data);
      alert('Запись создана успешно!');
      onBookingSuccess();
      setFormData({ car_id: '', service_id: '', date_requested: '', comment_from_client: '' });
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Ошибка при создании записи: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Загрузка данных для записи...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div>
        <label htmlFor="car_id" className="input-label">Выберите автомобиль *</label>
        <select
          id="car_id"
          name="car_id"
          value={formData.car_id}
          onChange={handleChange}
          required
          className="input-field"
        >
          <option value="">-- Выберите автомобиль --</option>
          {cars.map(car => (
            <option key={car.id} value={car.id}>{car.brand} {car.model} ({car.license_plate || 'Без номера'})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="service_id" className="input-label">Выберите услугу *</label>
        <select
          id="service_id"
          name="service_id"
          value={formData.service_id}
          onChange={handleChange}
          required
          className="input-field"
        >
          <option value="">-- Выберите услугу --</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>{service.name} — {service.price} руб.</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date_requested" className="input-label">Желаемая дата и время *</label>
        <input
          type="datetime-local"
          id="date_requested"
          name="date_requested"
          value={formData.date_requested}
          onChange={handleChange}
          required
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="mileage_at_order" className="input-label">Пробег на момент записи (км)</label>
        <input
          type="number"
          id="mileage_at_order"
          name="mileage_at_order"
          value={formData.mileage_at_order}
          onChange={handleChange}
          min="0"
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="comment_from_client" className="input-label">Комментарий</label>
        <textarea
          id="comment_from_client"
          name="comment_from_client"
          value={formData.comment_from_client}
          onChange={handleChange}
          rows="3"
          className="input-field resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-soft hover:shadow-glow transition-all duration-300"
      >
        Записаться
      </button>
    </form>
  );
};

export default BookingForm;
