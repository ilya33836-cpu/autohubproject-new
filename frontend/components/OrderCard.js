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

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <p className="text-gray-500">Автомобиль: {car.brand} {car.model}</p>
          <p className="text-gray-500">Дата: {formattedDate}</p>
        </div>
        <span className={`badge ${statusColorClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-surface-50 rounded-lg p-3">
          <span className="text-gray-500">Статус:</span>{' '}
          <span className="font-medium">{statusLabel}</span>
        </div>
        <div className="bg-surface-50 rounded-lg p-3">
          <span className="text-gray-500">Стоимость:</span>{' '}
          <span className="font-medium">{total_cost} руб.</span>
        </div>
        <div className="bg-surface-50 rounded-lg p-3">
          <span className="text-gray-500">Пробег:</span>{' '}
          <span className="font-medium">{mileage_at_order || 'N/A'} км</span>
        </div>
        <div className="bg-surface-50 rounded-lg p-3">
          <span className="text-gray-500">Услуга:</span>{' '}
          <span className="font-medium">{service.category || 'N/A'}</span>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => generateOrderPDF(order)}
          className="inline-flex items-center gap-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Скачать PDF
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
