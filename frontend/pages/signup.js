import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { API_BASE_URL } from '../utils/api';

const API = API_BASE_URL;

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', full_name: '', phone_number: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      router.push('/login');
    } catch (err) { setError(err.response?.data?.detail || 'Ошибка при регистрации'); }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md card-static-dark p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-steel-300/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-steel-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h1 className="text-2xl font-bold">Регистрация</h1>
        </div>
        {error && <div className="bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4"><label htmlFor="username" className="input-label-dark">Имя пользователя *</label><input id="username" name="username" type="text" value={formData.username} onChange={handleChange} required className="input-dark" /></div>
          <div className="mb-4"><label htmlFor="email" className="input-label-dark">Email *</label><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="input-dark" /></div>
          <div className="mb-4"><label htmlFor="full_name" className="input-label-dark">Полное имя</label><input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} className="input-dark" /></div>
          <div className="mb-4"><label htmlFor="phone_number" className="input-label-dark">Номер телефона</label><input id="phone_number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} className="input-dark" /></div>
          <div className="mb-8"><label htmlFor="password" className="input-label-dark">Пароль *</label><input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="input-dark" /></div>
          <button type="submit" className="w-full bg-steel-300 hover:bg-steel-200 text-dark-900 font-bold py-3 px-4 rounded-lg shadow-glow hover:shadow-glow-lg transition-all duration-300">Зарегистрироваться</button>
        </form>
        <div className="mt-8 pt-6 border-t border-dark-700 text-center">
          <p className="text-sm text-dark-400">Уже есть аккаунт?{' '}<Link href="/login" className="text-steel-300 hover:text-steel-200 font-bold">Войти</Link></p>
        </div>
      </div>
    </div>
  );
}
