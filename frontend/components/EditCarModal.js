import { useState, useEffect } from 'react';
import axios from 'axios';

const EditCarModal = ({ carToEdit, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    mileage: '',
    photo_url: '',
    last_service_mileage: '',
    service_interval_km: ''
  });

  // Заполняем форму при открытии
  useEffect(() => {
    if (carToEdit) {
      setFormData({
        brand: carToEdit.brand || '',
        model: carToEdit.model || '',
        year: carToEdit.year || '',
        license_plate: carToEdit.license_plate || '',
        vin: carToEdit.vin || '',
        mileage: carToEdit.mileage || '',
        photo_url: carToEdit.photo_url || '',
        last_service_mileage: carToEdit.last_service_mileage || '',
        service_interval_km: carToEdit.service_interval_km || ''
      });
    }
  }, [carToEdit]);

  if (!isOpen || !carToEdit) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Валидация
    if (!formData.brand || !formData.model || !formData.year) {
      alert('Марка, модель и год выпуска обязательны.');
      return;
    }
    // Вызов внешней функции обновления
    onUpdate(carToEdit.id, formData);
    // Закрытие модального окна после обновления
    // onClose(); // Это делает родительский компонент
  };

  const handleClose = () => {
    // Сброс формы при закрытии
    setFormData({
      brand: '',
      model: '',
      year: '',
      license_plate: '',
      vin: '',
      mileage: '',
      photo_url: '',
      last_service_mileage: '',
      service_interval_km: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Редактировать автомобиль</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Марка *</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Модель *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Год выпуска *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 mb-1">Гос. номер</label>
            <input
              type="text"
              id="license_plate"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
            <input
              type="text"
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">Пробег (км)</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="last_service_mileage" className="block text-sm font-medium text-gray-700 mb-1">Пробег при последнем ТО (км)</label>
            <input
              type="number"
              id="last_service_mileage"
              name="last_service_mileage"
              value={formData.last_service_mileage}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="service_interval_km" className="block text-sm font-medium text-gray-700 mb-1">Интервал ТО (км)</label>
            <input
              type="number"
              id="service_interval_km"
              name="service_interval_km"
              value={formData.service_interval_km}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700 mb-1">Ссылка на фото</label>
            <input
              type="text"
              id="photo_url"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCarModal;