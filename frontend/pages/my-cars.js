import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import CarCard from '../components/CarCard';
import AddCarModal from '../components/AddCarModal';
import EditCarModal from '../components/EditCarModal';
import { API_BASE_URL } from '../utils/api';

export default function MyCars() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [carToEdit, setCarToEdit] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserDataAndCars = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const user = userResponse.data;
        setCurrentUser(user);
        const carsResponse = await axios.get(`${API_BASE_URL}/cars/my`, { headers: { Authorization: `Bearer ${token}` } });
        setCars(carsResponse.data);
      } catch (err) {
        setError('Ошибка при загрузке автомобилей');
        if (err.response?.status === 401) localStorage.removeItem('access_token');
      } finally { setLoading(false); }
    };
    fetchUserDataAndCars();
  }, [router]);

  const handleAddCar = (data) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    axios.post(`${API_BASE_URL}/cars/`, data, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setCars(prev => [...prev, r.data]); setShowModal(false); })
      .catch(err => alert('Ошибка: ' + (err.response?.data?.detail || 'Неизвестная ошибка')));
  };

  const handleUpdateCar = (id, data) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    axios.put(`${API_BASE_URL}/cars/${id}`, data, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setCars(prev => prev.map(c => c.id === id ? r.data : c)); setShowEditModal(false); setCarToEdit(null); })
      .catch(err => alert('Ошибка: ' + (err.response?.data?.detail || 'Неизвестная ошибка')));
  };

  const handleDeleteCar = (id) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    axios.delete(`${API_BASE_URL}/cars/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setCars(prev => prev.filter(c => c.id !== id)))
      .catch(err => alert('Ошибка: ' + (err.response?.data?.detail || 'Неизвестная ошибка')));
  };

  if (loading) return <div className="text-center py-24 text-dark-400">Загрузка автомобилей...</div>;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-8">
          <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-2">Автомобили</p>
          <h1 className="text-3xl md:text-4xl font-black">Мои автомобили</h1>
        </div>

        {error && <div className="bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <button onClick={() => setShowModal(true)} className="btn-brand mb-6">Добавить автомобиль</button>

        {cars.length === 0 ? (
          <div className="card-static-dark p-12 text-center"><p className="text-dark-400 text-lg">У вас пока нет добавленных автомобилей.</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {cars.map(car => (
              <CarCard key={car.id} car={car} onDelete={handleDeleteCar} onEditClick={(c) => { setCarToEdit(c); setShowEditModal(true); }} />
            ))}
          </div>
        )}

        <AddCarModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleAddCar} userId={currentUser?.id} />
        <EditCarModal carToEdit={carToEdit} isOpen={showEditModal} onClose={() => { setShowEditModal(false); setCarToEdit(null); }} onUpdate={handleUpdateCar} />
      </div>
    </ProtectedRoute>
  );
}
