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

  if (!clients || clients.length === 0) return <p className="py-8 text-steel-400">Клиентов не найдено.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dark-700">
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tl-xl">ID</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Имя</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Телефон</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Активен</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Роль</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Зарегистрирован</th>
            {isAdminOrManager && <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tr-xl">Действия</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-600">
          {clients.map(client => (
            <tr key={client.id} className="bg-dark-800 hover:bg-dark-700 transition-colors">
              <td className="px-5 py-4 text-steel-400">{client.id}</td>
              <td className="px-5 py-4 font-medium text-dark-100">{client.full_name || client.username}</td>
              <td className="px-5 py-4 text-steel-400">{client.email}</td>
              <td className="px-5 py-4 text-steel-400">{client.phone_number || 'Не указан'}</td>
              <td className="px-5 py-4">
                <span className={`badge-dark ${client.is_active ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>{client.is_active ? 'Да' : 'Нет'}</span>
              </td>
              <td className="px-5 py-4">
                {editingRole === client.id ? (
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="input-dark py-1.5 text-xs w-auto" disabled={updating}>
                    {roles.map(r => <option key={r.value} value={r.value} className="bg-dark-800">{r.label}</option>)}
                  </select>
                ) : (
                  <span className={`badge-dark ${client.role === 'admin' ? 'bg-purple-900/40 text-purple-300' : client.role === 'manager' ? 'bg-blue-900/40 text-blue-300' : 'bg-steel-700 text-steel-200'}`}>
                    {roles.find(r => r.value === client.role)?.label || client.role}
                  </span>
                )}
              </td>
              <td className="px-5 py-4 text-steel-400">{new Date(client.created_at).toLocaleDateString('ru-RU')}</td>
              {isAdminOrManager && (
                <td className="px-5 py-4">
                  {editingRole === client.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleRoleSave(client.id)} disabled={updating} className="text-green-400 hover:text-green-300 font-medium disabled:opacity-50">Сохранить</button>
                      <button onClick={handleRoleCancel} disabled={updating} className="text-steel-400 hover:text-steel-200 font-medium disabled:opacity-50">Отмена</button>
                    </div>
                  ) : (
                    <button onClick={() => handleRoleEdit(client)} className="text-steel-300 hover:text-steel-200 font-medium">Изменить роль</button>
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
