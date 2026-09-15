import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../utils/api';

const DEFAULT_SERVICES = [
  { id: 1, name: 'Замена масла', description: 'Замена моторного масла и масляного фильтра', price: 2500, category: 'ТО' },
  { id: 2, name: 'Диагностика двигателя', description: 'Диагностика и поиск неисправностей', price: 1800, category: 'Диагностика' },
  { id: 3, name: 'Компьютерная диагностика', description: 'Считывание ошибок и анализ параметров', price: 1500, category: 'Диагностика' },
  { id: 4, name: 'Замена тормозных колодок', description: 'Замена передних/задних тормозных колодок', price: 3200, category: 'Ремонт' },
  { id: 5, name: 'Шиномонтаж', description: 'Монтаж и балансировка шин', price: 2200, category: 'Шиномонтаж' },
  { id: 6, name: 'Техническое обслуживание', description: 'Комплексное ТО по регламенту производителя', price: 7500, category: 'ТО' },
  { id: 7, name: 'Ремонт подвески', description: 'Диагностика и ремонт ходовой части', price: 4000, category: 'Ремонт' },
];

export default function ServicesPage() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services/?skip=0&limit=100')
      .then((res) => {
        if (res.data && res.data.length > 0) setServices(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = services.reduce((acc, s) => {
    const cat = s.category || 'Прочее';
    acc[cat] = acc[cat] || [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <>
      <Head><title>Услуги | AUTOHUB</title></Head>

      <div className="section-container">
        <div className="text-center mb-20 mt-8">
          <p className="text-primary-600 font-semibold tracking-widest uppercase text-sm mb-3">Каталог</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Услуги автосервиса</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Полный спектр работ по ремонту и обслуживанию автомобиля.
            Точную стоимость каждого заказа рассчитает менеджер после диагностики.
          </p>
        </div>

        {loading && <p className="text-center text-gray-500 mb-12">Загрузка услуг...</p>}

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-20">
            <h2 className="text-2xl font-bold mb-8 pb-3 border-b border-gray-200">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((service) => (
                <div key={service.id} className="card p-6 flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description || '—'}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-extrabold text-primary-600">{service.price} ₽</span>
                    {service.estimated_duration && (
                      <span className="text-sm text-gray-400">≈ {service.estimated_duration} мин</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="text-center mt-20 pb-12">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl py-14 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Готовы записаться?</h2>
              <p className="mb-8 text-gray-300 text-lg">Оставьте онлайн-заявку — перезвоним и подтвердим запись.</p>
              <Link href="/book-service" className="btn-primary inline-block">Записаться онлайн</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
