import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Ошибка при загрузке данных пользователя');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <div className="text-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <h1 className="text-3xl font-bold mb-6">Личный кабинет, {userData?.full_name || userData?.username}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/my-cars" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Мои автомобили</h2>
            <p>Управляйте своими автомобилями.</p>
          </Link>
          <Link href="/book-service" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Онлайн-запись</h2>
            <p>Запишитесь на обслуживание.</p>
          </Link>
          <Link href="/history" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">История обслуживания</h2>
            <p>Просмотрите историю ваших посещений.</p>
          </Link>
          <Link href="/notifications" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Уведомления</h2>
            <p>Проверьте последние уведомления.</p>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}