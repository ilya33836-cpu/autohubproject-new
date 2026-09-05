import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import CarCard from '../components/CarCard';
import AddCarModal from '../components/AddCarModal';
import EditCarModal from '../components/EditCarModal'; // Импортируем новый компонент
import { API_BASE_URL } from '../utils/api';

export default function MyCars() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Новое состояние для модального окна редактирования
  const [carToEdit, setCarToEdit] = useState(null); // Новое состояние для машины, которую редактируем
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserDataAndCars = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      try {
        // Получаем данные текущего пользователя
        const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        setCurrentUser(user);

        // Получаем автомобили пользователя через его ID
        const carsResponse = await axios.get(`${API_BASE_URL}/cars/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCars(carsResponse.data);

      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Ошибка при загрузке автомобилей');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndCars();
  }, [router]);

  const handleAddCar = (newCarData) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    axios.post(`${API_BASE_URL}/cars/`, newCarData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        // Добавляем новый автомобиль в список
        setCars(prev => [...prev, response.data]);
        setShowModal(false);
      })
      .catch(err => {
        console.error('Error adding car:', err);
        alert('Ошибка при добавлении автомобиля: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
      });
  };

  const handleUpdateCar = (carId, updatedData) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    axios.put(`${API_BASE_URL}/cars/${carId}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        // Обновляем автомобиль в списке
        setCars(prev => prev.map(car => car.id === carId ? response.data : car));
        setShowEditModal(false);
        setCarToEdit(null);
      })
      .catch(err => {
        console.error('Error updating car:', err);
        alert('Ошибка при обновлении автомобиля: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
      });
  };

  const handleDeleteCar = (carId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    axios.delete(`${API_BASE_URL}/cars/${carId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        // Удаляем автомобиль из списка
        setCars(prev => prev.filter(car => car.id !== carId));
      })
      .catch(err => {
        console.error('Error deleting car:', err);
        alert('Ошибка при удалении автомобиля: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
      });
  };

  const handleEditClick = (car) => {
    setCarToEdit(car);
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="text-center">Загрузка автомобилей...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <h1 className="text-3xl font-bold mb-6">Мои автомобили</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
        >
          Добавить автомобиль
        </button>

        {cars.length === 0 ? (
          <p className="text-gray-600">У вас пока нет добавленных автомобилей.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {cars.map(car => (
              <CarCard key={car.id} car={car} onDelete={handleDeleteCar} onEditClick={handleEditClick} />
            ))}
          </div>
        )}

        <AddCarModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleAddCar}
          userId={currentUser?.id}
        />

        <EditCarModal
          carToEdit={carToEdit}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setCarToEdit(null); // Сбрасываем carToEdit при закрытии
          }}
          onUpdate={handleUpdateCar}
        />
      </div>
    </ProtectedRoute>
  );
}