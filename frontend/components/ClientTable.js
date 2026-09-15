import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const API = API_BASE_URL;

const ClientTable = ({ clients, currentUser }) => {
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const roles = [{ value: 'client', label: 'Клиент' }, { value: 'manager', label: 'Менеджер' }, { value: 'admin', label: 'Администратор' }];

  const handleRoleEdit = (client) => { setEditingRole(client.id); setSelectedRole(client.role); };
  const handleRoleCancel = () => { setEditingRole(null); setSelectedRole(''); };

  const handleRoleSave = async (userId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setUpdating(true);
    try {
      await axios.put(`${API}/users/${userId}`, { role: selectedRole }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingRole(null);
      window.location.reload();
    } catch (err) { console.error('Error updating role:', err); alert('Ошибка при обновлении роли'); }
    finally { setUpdating(false); }
  };

  if (!clients || clients.length === 0) return <p className="py-8 text-gray-500">Клиентов не найдено.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-100">
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">ID</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Имя</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Телефон</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Активен</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Роль</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Зарегистрирован</th>
            {isAdminOrManager && <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-xl">Действия</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.map(client => (
            <tr key={client.id} className="bg-white hover:bg-surface-50 transition-colors">
              <td className="px-5 py-4 text-gray-500">{client.id}</td>
              <td className="px-5 py-4 font-medium text-gray-900">{client.full_name || client.username}</td>
              <td className="px-5 py-4 text-gray-500">{client.email}</td>
              <td className="px-5 py-4 text-gray-500">{client.phone_number || 'Не указан'}</td>
              <td className="px-5 py-4">
                <span className={`badge rounded-full ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{client.is_active ? 'Да' : 'Нет'}</span>
              </td>
              <td className="px-5 py-4">
                {editingRole === client.id ? (
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="input-field py-1.5 text-xs w-auto" disabled={updating}>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                ) : (
                  <span className={`badge rounded-full ${client.role === 'admin' ? 'bg-purple-100 text-purple-800' : client.role === 'manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {roles.find(r => r.value === client.role)?.label || client.role}
                  </span>
                )}
              </td>
              <td className="px-5 py-4 text-gray-500">{new Date(client.created_at).toLocaleDateString('ru-RU')}</td>
              {isAdminOrManager && (
                <td className="px-5 py-4">
                  {editingRole === client.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleRoleSave(client.id)} disabled={updating} className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                        {updating ? '...' : 'Сохранить'}
                      </button>
                      <button onClick={handleRoleCancel} disabled={updating} className="text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50">Отмена</button>
                    </div>
                  ) : (
                    <button onClick={() => handleRoleEdit(client)} className="text-primary-600 hover:text-primary-700 font-medium">Изменить роль</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
