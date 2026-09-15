import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import BookingForm from '../components/BookingForm';
import { API_BASE_URL } from '../utils/api';

export default function BookService() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        setCurrentUser(response.data);
      } catch (err) {
        if (err.response?.status === 401) localStorage.removeItem('access_token');
      }
    };
    fetchUserData();
  }, [router]);

  const handleBookingSuccess = () => {
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  if (!currentUser) return <div className="text-center py-24 text-dark-400">Загрузка...</div>;

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-10">
          <p className="text-steel-300 font-bold tracking-[0.3em] uppercase text-xs mb-2">Запись</p>
          <h1 className="text-3xl md:text-4xl font-black">Онлайн-запись на обслуживание</h1>
        </div>

        {bookingSuccess && <div className="bg-green-900/30 border border-green-800/50 text-green-400 px-4 py-3 rounded-lg mb-6">Запись успешно создана!</div>}

        <div className="card-static-dark p-6 md:p-8">
          <BookingForm userId={currentUser.id} onBookingSuccess={handleBookingSuccess} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
