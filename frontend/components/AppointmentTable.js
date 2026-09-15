import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const AppointmentTable = ({ appointments, onUpdateStatus, dateFilter, plateQuery }) => {
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const statusLabels = { new: 'Новый', confirmed: 'Подтверждён', accepted: 'Принят', in_progress: 'В работе', waiting_parts: 'Ожидает запчасти', completed: 'Завершён', cancelled: 'Отменён' };
  const statusOptions = [{ value: 'new', label: 'Новый' }, { value: 'confirmed', label: 'Подтверждён' }, { value: 'accepted', label: 'Принят' }, { value: 'in_progress', label: 'В работе' }, { value: 'waiting_parts', label: 'Ожидает запчасти' }, { value: 'completed', label: 'Завершён' }, { value: 'cancelled', label: 'Отменён' }];

  const handleStatusChange = (id) => {
    setEditingId(id);
    setNewStatus(appointments.find(a => a.id === id)?.status || '');
  };

  const confirmStatusChange = async () => {
    if (!editingId || !newStatus) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      await axios.put(`${API_BASE_URL}/orders/${editingId}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      onUpdateStatus(editingId, newStatus);
      setEditingId(null);
      setNewStatus('');
    } catch (err) { console.error('Error updating order status:', err); alert('Ошибка при обновлении статуса заказа.'); }
  };

  const cancelEdit = () => { setEditingId(null); setNewStatus(''); };

  const getStatusColor = (status) => {
    const colors = { new: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', accepted: 'bg-indigo-100 text-indigo-800', in_progress: 'bg-purple-100 text-purple-800', waiting_parts: 'bg-orange-100 text-orange-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  let filtered = appointments || [];
  if (dateFilter) { const f = new Date(dateFilter).toDateString(); filtered = filtered.filter(a => new Date(a.date_requested).toDateString() === f); }
  if (plateQuery) { const q = plateQuery.toLowerCase(); filtered = filtered.filter(a => (a.car.license_plate || '').toLowerCase().includes(q)); }

  if (!filtered || filtered.length === 0) return <p className="py-8 text-gray-500">Записей не найдено.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-100">
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">ID</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Клиент</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Автомобиль</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Гос. номер</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Услуга</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Дата</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-xl">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((apt) => (
            <tr key={apt.id} className="bg-white hover:bg-surface-50 transition-colors">
              <td className="px-5 py-4 text-gray-500">{apt.id}</td>
              <td className="px-5 py-4">
                <div className="font-medium text-gray-900">{apt.user.full_name || apt.user.username}</div>
                <div className="text-gray-500">{apt.user.email}</div>
              </td>
              <td className="px-5 py-4">
                <div className="text-gray-900">{apt.car.brand} {apt.car.model}</div>
                <div className="text-gray-500">{apt.car.license_plate || 'Нет номера'}</div>
              </td>
              <td className="px-5 py-4 text-gray-500">{apt.car.license_plate || '-'}</td>
              <td className="px-5 py-4 text-gray-500">{apt.service.name}</td>
              <td className="px-5 py-4 text-gray-500">{new Date(apt.date_requested).toLocaleString('ru-RU')}</td>
              <td className="px-5 py-4">
                {editingId === apt.id ? (
                  <>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field py-1.5 text-xs mr-2" disabled>
                      {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={confirmStatusChange} className="inline-flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors">✓</button>
                    <button onClick={cancelEdit} className="inline-flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">✕</button>
                  </>
                ) : (
                  <span className={`badge ${getStatusColor(apt.status)}`}>{statusLabels[apt.status] || apt.status}</span>
                )}
              </td>
              <td className="px-5 py-4 text-gray-500">
                {!editingId && <button onClick={() => handleStatusChange(apt.id)} className="text-primary-600 hover:text-primary-700 font-medium">Изменить статус</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
