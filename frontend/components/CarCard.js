import React from 'react';

const CarCard = ({ car, onDelete, onEditClick }) => {
  // const { brand, model, year, license_plate, vin, mileage, photo_url } = car;
  const { brand, model, year, license_plate, mileage, last_service_mileage, service_interval_km } = car;

  const handleDelete = () => {
    if (window.confirm(`Вы уверены, что хотите удалить ${brand} ${model}?`)) {
      onDelete(car.id);
    }
  };

  const handleEdit = () => {
    onEditClick(car); // Передаем данные машины в родительский компонент
  };

  // Рассчитываем порог для напоминания
  const nextServiceThreshold = (last_service_mileage || 0) + (service_interval_km || 10000);
  const needsService = (mileage || 0) >= nextServiceThreshold;
  const remainingKm = nextServiceThreshold - (mileage || 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-start">
        {/* <div className="flex-shrink-0 mr-4">
          {photo_url ? (
            <img src={photo_url} alt={`${brand} ${model}`} className="w-16 h-16 object-cover rounded" />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
          )}
        </div> */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold">{brand} {model}</h3>
          <p className="text-gray-600">{year} | {license_plate || 'Номер не указан'} | Пробег: {mileage || 0} км</p>
          {/* <p className="text-sm text-gray-500 truncate">VIN: {vin || 'Не указан'}</p> */}
          
          {/* Информация о ТО */}
          <p className="text-sm text-gray-600 mt-1">Посл. ТО: {last_service_mileage || 0} км</p>
          <p className="text-sm text-gray-600">Интервал: {service_interval_km || 10000} км</p>
          {needsService ? (
            <p className="text-sm text-red-600 font-semibold">Требуется ТО!</p>
          ) : (
            <p className="text-sm text-green-600">След. ТО через {remainingKm} км</p>
          )}
        </div>
        <div className="flex flex-col space-y-2"> {/* Контейнер для кнопок */}
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;