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
    const colors = { new: 'bg-yellow-900/40 text-yellow-300', confirmed: 'bg-blue-900/40 text-blue-300', accepted: 'bg-indigo-900/40 text-indigo-300', in_progress: 'bg-purple-900/40 text-purple-300', waiting_parts: 'bg-orange-900/40 text-orange-300', completed: 'bg-green-900/40 text-green-300', cancelled: 'bg-red-900/40 text-red-300' };
    return colors[status] || 'bg-dark-700 text-dark-200';
  };

  let filtered = appointments || [];
  if (dateFilter) { const f = new Date(dateFilter).toDateString(); filtered = filtered.filter(a => new Date(a.date_requested).toDateString() === f); }
  if (plateQuery) { const q = plateQuery.toLowerCase(); filtered = filtered.filter(a => (a.car.license_plate || '').toLowerCase().includes(q)); }

  if (!filtered || filtered.length === 0) return <p className="py-8 text-steel-400">Записей не найдено.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dark-700">
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tl-xl">ID</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Клиент</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Автомобиль</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Гос. номер</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Услуга</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Дата</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Статус</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tr-xl">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-600">
          {filtered.map((apt) => (
            <tr key={apt.id} className="bg-dark-800 hover:bg-dark-700 transition-colors">
              <td className="px-5 py-4 text-steel-400">{apt.id}</td>
              <td className="px-5 py-4">
                <div className="font-medium text-dark-100">{apt.user.full_name || apt.user.username}</div>
                <div className="text-steel-400">{apt.user.email}</div>
              </td>
              <td className="px-5 py-4">
                <div className="text-dark-100">{apt.car.brand} {apt.car.model}</div>
                <div className="text-steel-400">{apt.car.license_plate || 'Нет номера'}</div>
              </td>
              <td className="px-5 py-4 text-steel-400">{apt.car.license_plate || '-'}</td>
              <td className="px-5 py-4 text-steel-400">{apt.service.name}</td>
              <td className="px-5 py-4 text-steel-400">{new Date(apt.date_requested).toLocaleString('ru-RU')}</td>
              <td className="px-5 py-4">
                {editingId === apt.id ? (
                  <>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-dark py-1.5 text-xs mr-2" disabled>
                      {statusOptions.map(o => <option key={o.value} value={o.value} className="bg-dark-800">{o.label}</option>)}
                    </select>
                    <button onClick={confirmStatusChange} className="inline-flex items-center justify-center w-8 h-8 bg-dark-600 hover:bg-dark-500 text-steel-300 rounded-lg transition-colors">✓</button>
                    <button onClick={cancelEdit} className="inline-flex items-center justify-center w-8 h-8 bg-dark-600 hover:bg-dark-500 text-red-400 rounded-lg transition-colors">✕</button>
                  </>
                ) : (
                  <span className={`badge-dark ${getStatusColor(apt.status)}`}>{statusLabels[apt.status] || apt.status}</span>
                )}
              </td>
              <td className="px-5 py-4 text-steel-400">
                {!editingId && <button onClick={() => handleStatusChange(apt.id)} className="text-steel-300 hover:text-steel-200 font-medium">Изменить статус</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
