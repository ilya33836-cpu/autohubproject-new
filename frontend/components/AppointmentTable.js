import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const AppointmentTable = ({ appointments, onUpdateStatus, dateFilter, plateQuery }) => {
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const statusLabels = {
    new: 'Новый',
    confirmed: 'Подтверждён',
    accepted: 'Принят',
    in_progress: 'В работе',
    waiting_parts: 'Ожидает запчасти',
    completed: 'Завершён',
    cancelled: 'Отменён',
  };

  const statusOptions = [
    { value: 'new', label: 'Новый' },
    { value: 'confirmed', label: 'Подтверждён' },
    { value: 'accepted', label: 'Принят' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'waiting_parts', label: 'Ожидает запчасти' },
    { value: 'completed', label: 'Завершён' },
    { value: 'cancelled', label: 'Отменён' },
  ];

  const handleStatusChange = (id) => {
    setEditingId(id);
    const currentStatus = appointments.find(a => a.id === id)?.status;
    setNewStatus(currentStatus || '');
  };

  const confirmStatusChange = async () => {
    if (!editingId || !newStatus) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await axios.put(`${API_BASE_URL}/orders/${editingId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdateStatus(editingId, newStatus);
      setEditingId(null);
      setNewStatus('');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Ошибка при обновлении статуса заказа.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewStatus('');
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      accepted: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-purple-100 text-purple-800',
      waiting_parts: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  let filtered = appointments || [];
  if (dateFilter) {
    const filterDate = new Date(dateFilter).toDateString();
    filtered = filtered.filter(a => new Date(a.date_requested).toDateString() === filterDate);
  }
  if (plateQuery) {
    const q = plateQuery.toLowerCase();
    filtered = filtered.filter(a => (a.car.license_plate || '').toLowerCase().includes(q));
  }

  if (!filtered || filtered.length === 0) {
    return <p>Записей не найдено.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Автомобиль</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Гос. номер</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Услуга</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.map((appointment) => (
            <tr key={appointment.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{appointment.user.full_name || appointment.user.username}</div>
                <div className="text-sm text-gray-500">{appointment.user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{appointment.car.brand} {appointment.car.model}</div>
                <div className="text-sm text-gray-500">{appointment.car.license_plate || 'Нет номера'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.car.license_plate || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.service.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(appointment.date_requested).toLocaleString('ru-RU')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === appointment.id ? (
                  <>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 mr-2"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <button onClick={confirmStatusChange} className="text-green-600 hover:text-green-900 mr-1">✓</button>
                    <button onClick={cancelEdit} className="text-red-600 hover:text-red-900">✕</button>
                  </>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                    {statusLabels[appointment.status] || appointment.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {!editingId && (
                  <button
                    onClick={() => handleStatusChange(appointment.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Изменить статус
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;