import React, { useState } from 'react';
import Link from 'next/link';
import { generateOrderPDF } from '../utils/pdfGenerator';

const OrderCard = ({ order }) => {
  const { id, date_requested, car, service, total_cost, status, comment_from_master, recommendations, mileage_at_order } = order;
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(date_requested).toLocaleString('ru-RU');

  const statusLabels = {
    new: 'Новый',
    confirmed: 'Подтверждён',
    accepted: 'Принят',
    in_progress: 'В работе',
    waiting_parts: 'Ожидает запчасти',
    completed: 'Завершён',
    cancelled: 'Отменён',
  };

  const statusColors = {
    new: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-purple-100 text-purple-800',
    waiting_parts: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const statusColorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  const statusLabel = statusLabels[status] || status;

  const hasDetails = comment_from_master || recommendations;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <p className="text-gray-600">Автомобиль: {car.brand} {car.model}</p>
          <p className="text-gray-600">Дата: {formattedDate}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColorClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <p><span className="font-medium">Статус:</span> {statusLabel}</p>
        <p><span className="font-medium">Стоимость:</span> {total_cost} руб.</p>
        <p><span className="font-medium">Пробег:</span> {mileage_at_order || 'N/A'} км</p>
        <p><span className="font-medium">Услуга:</span> {service.category || 'N/A'}</p>
      </div>

      <div className="mt-4">
        <button
          onClick={() => generateOrderPDF(order)}
          className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded"
        >
          Скачать PDF
        </button>
      </div>
    </div>
  );
};

export default OrderCard;