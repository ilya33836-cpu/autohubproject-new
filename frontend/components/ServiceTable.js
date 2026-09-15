import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const ServiceTable = ({ services, onServiceUpdate, onServiceDelete, onServiceCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentService, setCurrentService] = useState({ name: '', description: '', price: '', estimated_duration: '', category: '' });

  const handleEdit = (service) => {
    setEditingId(service.id);
    setCurrentService({ ...service });
  };

  const handleSave = async () => {
    if (!currentService.name || !currentService.price) { alert('Название и цена обязательны.'); return; }
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/services/${editingId}`, currentService, { headers: { Authorization: `Bearer ${token}` } });
        onServiceUpdate(editingId, currentService);
      } else {
        const response = await axios.post(`${API_BASE_URL}/services/`, currentService, { headers: { Authorization: `Bearer ${token}` } });
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
      axios.delete(`${API_BASE_URL}/services/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => onServiceDelete(id))
        .catch(err => { console.error('Error deleting service:', err); alert('Ошибка при удалении услуги.'); });
    }
  };

  const handleChange = (e) => setCurrentService({ ...currentService, [e.target.name]: e.target.value });
  const isEditingOrCreateing = editingId !== null || isCreating;

  return (
    <div className="overflow-x-auto">
      <button onClick={() => { setIsCreating(true); setEditingId(null); setCurrentService({ name: '', description: '', price: '', estimated_duration: '', category: '' }); }}
        className="mb-4 bg-steel-300 hover:bg-steel-200 text-dark-900 py-2.5 px-5 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 text-sm">Добавить услугу</button>

      {isEditingOrCreateing && (
        <div className="mb-6 p-5 bg-dark-700 rounded-xl shadow-soft border border-dark-600">
          <h3 className="text-lg font-medium mb-4 text-dark-100">{editingId ? 'Редактировать' : 'Создать'} услугу</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label-dark">Название *</label>
              <input type="text" name="name" value={currentService.name} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="input-label-dark">Цена *</label>
              <input type="number" name="price" value={currentService.price} onChange={handleChange} min="0" step="0.01" className="input-dark" />
            </div>
            <div>
              <label className="input-label-dark">Категория</label>
              <input type="text" name="category" value={currentService.category} onChange={handleChange} className="input-dark" />
            </div>
            <div>
              <label className="input-label-dark">Примерная длительность (мин)</label>
              <input type="number" name="estimated_duration" value={currentService.estimated_duration} onChange={handleChange} min="0" className="input-dark" />
            </div>
            <div className="md:col-span-2">
              <label className="input-label-dark">Описание</label>
              <textarea name="description" value={currentService.description} onChange={handleChange} rows="2" className="input-dark resize-none" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="bg-steel-300 hover:bg-steel-200 text-dark-900 py-2.5 px-5 rounded-xl transition-colors text-sm">Сохранить</button>
            <button onClick={handleCancel} className="bg-dark-600 hover:bg-dark-500 text-dark-200 py-2.5 px-5 rounded-xl transition-colors text-sm">Отмена</button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dark-700">
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tl-xl">ID</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Название</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Категория</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Цена</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Длит-сть</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tr-xl">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-600">
          {services.map((service) => (
            <tr key={service.id} className="bg-dark-800 hover:bg-dark-700 transition-colors">
              <td className="px-5 py-4 text-steel-400">{service.id}</td>
              <td className="px-5 py-4 font-medium text-dark-100">{service.name}</td>
              <td className="px-5 py-4 text-steel-400">{service.category || '-'}</td>
              <td className="px-5 py-4 text-steel-400">{service.price} руб.</td>
              <td className="px-5 py-4 text-steel-400">{service.estimated_duration || 'N/A'}</td>
              <td className="px-5 py-4 text-steel-400">
                <button onClick={() => handleEdit(service)} className="text-steel-300 hover:text-steel-200 mr-3 font-medium">Редактировать</button>
                <button onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-300 font-medium">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;
