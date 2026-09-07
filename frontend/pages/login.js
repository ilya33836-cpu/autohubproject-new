import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/token`, new URLSearchParams({
        'grant_type': 'password',
        'username': username,
        'password': password,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });

      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.role === 'admin' || response.data.role === 'manager') {
        router.push('/crm');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Вход в аккаунт</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Имя пользователя или Email
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
            Зарегистрироваться
          </Link>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
            Забыли пароль?
          </Link>
        </p>
      </div>
    </div>
  );
}