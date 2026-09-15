import React, { useState } from 'react';
import { generateOrderPDF } from '../utils/pdfGenerator';

const OrderCard = ({ order }) => {
  const { id, date_requested, car, service, total_cost, status, mileage_at_order } = order;
  const formattedDate = new Date(date_requested).toLocaleString('ru-RU');

  const statusLabels = {
    new: 'Новый', confirmed: 'Подтверждён', accepted: 'Принят', in_progress: 'В работе',
    waiting_parts: 'Ожидает запчасти', completed: 'Завершён', cancelled: 'Отменён',
  };
  const statusColors = {
    new: 'bg-yellow-900/40 text-yellow-400', confirmed: 'bg-blue-900/40 text-blue-400',
    accepted: 'bg-indigo-900/40 text-indigo-400', in_progress: 'bg-purple-900/40 text-purple-400',
    waiting_parts: 'bg-orange-900/40 text-orange-400', completed: 'bg-green-900/40 text-green-400',
    cancelled: 'bg-red-900/40 text-red-400',
  };
  const statusColorClass = statusColors[status] || 'bg-dark-700 text-dark-200';
  const statusLabel = statusLabels[status] || status;

  return (
    <div className="card-dark p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{service.name}</h3>
          <p className="text-dark-400">Автомобиль: {car.brand} {car.model}</p>
          <p className="text-dark-400">Дата: {formattedDate}</p>
        </div>
        <span className={`badge-dark ${statusColorClass}`}>{statusLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-dark-700/50 rounded-lg p-3"><span className="text-dark-400">Статус:</span>{' '}<span className="font-medium">{statusLabel}</span></div>
        <div className="bg-dark-700/50 rounded-lg p-3"><span className="text-dark-400">Стоимость:</span>{' '}<span className="font-medium">{total_cost} руб.</span></div>
        <div className="bg-dark-700/50 rounded-lg p-3"><span className="text-dark-400">Пробег:</span>{' '}<span className="font-medium">{mileage_at_order || 'N/A'} км</span></div>
        <div className="bg-dark-700/50 rounded-lg p-3"><span className="text-dark-400">Услуга:</span>{' '}<span className="font-medium">{service.category || 'N/A'}</span></div>
      </div>

      <div className="mt-4">
        <button onClick={() => generateOrderPDF(order)} className="inline-flex items-center gap-2 text-sm bg-dark-700 hover:bg-dark-600 text-steel-300 font-medium py-2 px-4 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Скачать PDF
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
