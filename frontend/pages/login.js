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
      if (response.data.role === 'admin' || response.data.role === 'manager') router.push('/crm');
      else router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при входе');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md card-static-dark p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <h1 className="text-2xl font-bold">Вход в аккаунт</h1>
        </div>
        {error && <div className="bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="username" className="input-label-dark">Имя пользователя или Email</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="input-dark" />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="input-label-dark">Пароль</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-dark" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-70 text-dark-900 font-bold py-3 px-4 rounded-lg shadow-glow hover:shadow-glow-lg transition-all duration-300">
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-dark-700 text-center space-y-2">
          <p className="text-sm text-dark-400">Нет аккаунта?{' '}<Link href="/signup" className="text-brand-400 hover:text-brand-300 font-bold">Зарегистрироваться</Link></p>
          <p className="text-sm text-dark-400"><Link href="/forgot-password" className="text-brand-400 hover:text-brand-300 font-bold">Забыли пароль?</Link></p>
        </div>
      </div>
    </div>
  );
}
