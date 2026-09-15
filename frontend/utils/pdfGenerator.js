import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Импорт плагина autoTable для красивых таблиц

/**
 * Генерирует и скачивает PDF-файл с данными заказа.
 * @param {Object} order - Объект заказа из API.
 */
export const generateOrderPDF = (order) => {
  const doc = new jsPDF();

  // Заголовок
  doc.setFontSize(18);
  doc.text('Заказ на обслуживание', 14, 20);

  // Информация о заказе
  doc.setFontSize(12);
  doc.text(`ID заказа: ${order.id}`, 14, 30);
  doc.text(`Дата: ${new Date(order.date_requested).toLocaleString('ru-RU')}`, 14, 36);
  doc.text(`Статус: ${order.status}`, 14, 42);
  doc.text(`Стоимость: ${order.total_cost} руб.`, 14, 48);

  // Информация о клиенте
  doc.text(`Клиент: ${order.user.full_name || order.user.username}`, 14, 58);
  doc.text(`Email: ${order.user.email}`, 14, 64);
  doc.text(`Телефон: ${order.user.phone_number || 'N/A'}`, 14, 70);

  // Информация об автомобиле
  doc.text(`Автомобиль: ${order.car.brand} ${order.car.model}`, 14, 80);
  doc.text(`Год: ${order.car.year}`, 14, 86);
  doc.text(`Гос. номер: ${order.car.license_plate || 'N/A'}`, 14, 92);
  doc.text(`VIN: ${order.car.vin || 'N/A'}`, 14, 98);
  doc.text(`Пробег при заказе: ${order.mileage_at_order || 0} км`, 14, 104);

  // Информация об услуге
  doc.text(`Услуга: ${order.service.name}`, 14, 114);
  doc.text(`Описание: ${order.service.description || 'N/A'}`, 14, 120);
  doc.text(`Категория: ${order.service.category || 'N/A'}`, 14, 126);

  // Комментарии и рекомендации
  let yPos = 136;
  if (order.comment_from_master) {
    doc.text('Комментарий мастера:', 14, yPos);
    doc.setFontSize(10);
    // Разбиваем комментарий на строки
    const splitText = doc.splitTextToSize(order.comment_from_master, 180);
    doc.text(splitText, 14, yPos + 6);
    yPos += 6 + splitText.length * 5; // Примерный расчет высоты текста
  }

  if (order.recommendations) {
    doc.setFontSize(12);
    doc.text('Рекомендации:', 14, yPos);
    doc.setFontSize(10);
    const splitRecs = doc.splitTextToSize(order.recommendations, 180);
    doc.text(splitRecs, 14, yPos + 6);
    yPos += 6 + splitRecs.length * 5;
  }

  // Подпись
  doc.setFontSize(10);
  doc.text('Подпись: ________________________', 14, yPos + 20);
  doc.text('AUTOHUB Автосервис', 14, yPos + 30);
  doc.text('Дата генерации: ' + new Date().toLocaleDateString('ru-RU'), 14, yPos + 36);

  // Сохраняем файл
  doc.save(`Заказ_${order.id}.pdf`);
};
