import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ClientTable = ({ clients, currentUser }) => {
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updating, setUpdating] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const roles = [
    { value: 'client', label: 'Клиент' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'admin', label: 'Администратор' },
  ];

  const handleRoleEdit = (client) => {
    setEditingRole(client.id);
    setSelectedRole(client.role);
  };

  const handleRoleCancel = () => {
    setEditingRole(null);
    setSelectedRole('');
  };

  const handleRoleSave = async (userId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setUpdating(true);
    try {
      await axios.put(
        `${API}/users/${userId}`,
        { role: selectedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingRole(null);
      window.location.reload();
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Ошибка при обновлении роли');
    } finally {
      setUpdating(false);
    }
  };

  if (!clients || clients.length === 0) {
    return <p>Клиентов не найдено.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активен</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Зарегистрирован</th>
            {isAdmin && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{client.full_name || client.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone_number || 'Не указан'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {client.is_active ? 'Да' : 'Нет'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {editingRole === client.id ? (
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={updating}
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    client.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {roles.find(r => r.value === client.role)?.label || client.role}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(client.created_at).toLocaleDateString('ru-RU')}
              </td>
              {isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingRole === client.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRoleSave(client.id)}
                        disabled={updating}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        {updating ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        onClick={handleRoleCancel}
                        disabled={updating}
                        className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      >
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRoleEdit(client)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Изменить роль
                    </button>
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