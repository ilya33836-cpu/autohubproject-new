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
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (err) {
        console.error('Error fetching user data for booking:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
        }
      }
    };

    fetchUserData();
  }, [router]);

  const handleBookingSuccess = () => {
    setBookingSuccess(true);
    // Можно добавить автоматическое снятие флага через некоторое время
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  if (!currentUser) {
    return <div className="text-center">Загрузка...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 mt-16">
        <h1 className="text-3xl font-bold mb-6">Онлайн-запись на обслуживание</h1>

        {bookingSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Запись успешно создана!
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <BookingForm userId={currentUser.id} onBookingSuccess={handleBookingSuccess} />
        </div>
      </div>
    </ProtectedRoute>
  );
}