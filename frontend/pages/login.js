import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { API_BASE_URL } from '../utils/api';

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
      const response = await axios.post(`${API_BASE_URL}/auth/token`, new URLSearchParams({
        'grant_type': 'password',
        'username': username,
        'password': password,
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md card-static p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <h1 className="text-2xl font-bold">Вход в аккаунт</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="username" className="input-label">Имя пользователя или Email</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="input-field" />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="input-label">Пароль</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-xl shadow-soft hover:shadow-glow transition-all duration-300">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">Зарегистрироваться</Link>
          </p>
          <p className="text-sm text-gray-500">
            <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">Забыли пароль?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
