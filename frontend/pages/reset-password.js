import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token: router.query.token,
        new_password: password,
      });
      setMessage('Пароль изменён. Теперь можно войти.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось изменить пароль');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Новый пароль</h1>
      {message && <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-900/40 border border-steel-500 text-red-300 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-1">Новый пароль</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
          className="w-full px-3 py-2 border border-dark-600 rounded-md mb-4"
        />
        <button type="submit" className="w-full bg-steel-300 hover:bg-steel-200 text-white font-bold py-2 px-4 rounded">
          Изменить пароль
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-steel-500">
        <Link href="/login" className="text-steel-400 hover:text-steel-300 font-medium">Вернуться ко входу</Link>
      </p>
    </div>
  );
}
