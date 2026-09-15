import React from 'react';

const CarCard = ({ car, onDelete, onEditClick }) => {
  const { brand, model, year, license_plate, mileage, last_service_mileage, service_interval_km } = car;

  const handleDelete = () => {
    if (window.confirm(`Вы уверены, что хотите удалить ${brand} ${model}?`)) onDelete(car.id);
  };

  const handleEdit = () => onEditClick(car);

  const nextServiceThreshold = (last_service_mileage || 0) + (service_interval_km || 10000);
  const needsService = (mileage || 0) >= nextServiceThreshold;
  const remainingKm = nextServiceThreshold - (mileage || 0);

  return (
    <div className="card-dark p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow min-w-0">
          <h3 className="text-lg font-bold mb-1">{brand} {model}</h3>
          <p className="text-dark-400 text-sm">{year} | {license_plate || 'Номер не указан'} | Пробег: {mileage || 0} км</p>
          <div className="mt-3 space-y-1">
            <p className="text-sm text-dark-300">Посл. ТО: {last_service_mileage || 0} км</p>
            <p className="text-sm text-dark-300">Интервал: {service_interval_km || 10000} км</p>
            {needsService ? (
              <p className="text-sm text-red-400 font-semibold mt-2 bg-red-900/20 inline-block px-3 py-1 rounded-lg">Требуется ТО!</p>
            ) : (
              <p className="text-sm text-green-400 bg-green-900/20 inline-block px-3 py-1 rounded-lg mt-2">След. ТО через {remainingKm} км</p>
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-2 flex-shrink-0">
          <button onClick={handleEdit} className="p-2 rounded-lg hover:bg-steel-300/10 text-dark-400 hover:text-steel-300 transition-colors" aria-label="Редактировать">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
          <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-900/30 text-dark-400 hover:text-red-400 transition-colors" aria-label="Удалить">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
