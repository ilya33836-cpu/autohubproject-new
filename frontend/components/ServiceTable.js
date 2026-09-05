import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const ServiceTable = ({ services, onServiceUpdate, onServiceDelete, onServiceCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentService, setCurrentService] = useState({
    name: '', description: '', price: '', estimated_duration: '', category: ''
  });

  const handleEdit = (service) => {
    setEditingId(service.id);
    setCurrentService({ ...service });
  };

  const handleSave = async () => {
    if (!currentService.name || !currentService.price) {
        alert('Название и цена обязательны.');
        return;
    }
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      if (editingId) {
        // Обновление
        await axios.put(`${API_BASE_URL}/services/${editingId}`, currentService, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onServiceUpdate(editingId, currentService);
      } else {
        // Создание
        const response = await axios.post(`${API_BASE_URL}/services/`, currentService, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onServiceCreate(response.data);
      }
      setEditingId(null);
      setIsCreating(false);
      setCurrentService({ name: '', description: '', price: '', estimated_duration: '', category: '' });
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Ошибка при сохранении услуги.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setCurrentService({ name: '', description: '', price: '', estimated_duration: '', category: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      axios.delete(`${API_BASE_URL}/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(() => {
          onServiceDelete(id);
        })
        .catch(err => {
          console.error('Error deleting service:', err);
          alert('Ошибка при удалении услуги.');
        });
    }
  };

  const handleChange = (e) => {
    setCurrentService({
      ...currentService,
      [e.target.name]: e.target.value
    });
  };

  const isEditingOrCreateing = editingId !== null || isCreating;

  return (
    <div className="overflow-x-auto">
      <button
        onClick={() => {
          setIsCreating(true);
          setEditingId(null); // Убедимся, что редактирование отменено
          setCurrentService({ name: '', description: '', price: '', estimated_duration: '', category: '' });
        }}
        className="mb-4 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
      >
        Добавить услугу
      </button>

      {/* Форма для создания/редактирования */}
      {isEditingOrCreateing && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-lg font-medium mb-2">{editingId ? 'Редактировать' : 'Создать'} услугу</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input
                type="text"
                name="name"
                value={currentService.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена *</label>
              <input
                type="number"
                name="price"
                value={currentService.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <input
                type="text"
                name="category"
                value={currentService.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Примерная длительность (мин)</label>
              <input
                type="number"
                name="estimated_duration"
                value={currentService.estimated_duration}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                name="description"
                value={currentService.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded mr-2"
            >
              Сохранить
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Длит-сть (мин)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.category || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.price} руб.</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.estimated_duration || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => handleEdit(service)}
                  className="text-blue-600 hover:text-blue-900 mr-2"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;