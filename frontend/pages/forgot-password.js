import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { API_BASE_URL } from '../utils/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMessage('Если пользователь с таким email существует, инструкции отправлены.');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.detail || 'Ошибка при запросе восстановления пароля');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Восстановление пароля</h1>
      {message && <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-900/40 border border-steel-500 text-red-300 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-dark-600 rounded-md focus:outline-none focus:ring-1 focus:ring-steel-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-steel-300 hover:bg-steel-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Восстановить пароль
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-steel-500">
          Вспомнили пароль?{' '}
          <Link href="/login" className="text-steel-400 hover:text-steel-300 font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
