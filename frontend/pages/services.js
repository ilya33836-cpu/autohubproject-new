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
        if (res.data && res.data.length > 0) {
          setServices(res.data);
        }
      })
      .catch(() => {
        /* API недоступен — оставляем список-заглушку */
      })
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
      <Head>
        <title>Услуги | AUTOHUB</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 mt-16">
          <h1 className="text-4xl font-bold mb-3">Услуги автосервиса</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Полный спектр работ по ремонту и обслуживанию автомобиля.
            Точную стоимость каждого заказа рассчитает менеджер после диагностики.
          </p>
        </div>

        {loading && <p className="text-center text-gray-500 mb-12">Загрузка услуг...</p>}

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                  <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600 flex-grow">{service.description || '—'}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">{service.price} ₽</span>
                    {service.estimated_duration && (
                      <span className="text-sm text-gray-500">≈ {service.estimated_duration} мин</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="text-center mt-16 bg-gray-900 text-white py-10 px-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Готовы записаться?</h2>
          <p className="mb-6 text-gray-300">Оставьте онлайн-заявку — перезвоним и подтвердим запись.</p>
          <Link href="/book-service" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg">
            Записаться онлайн
          </Link>
        </div>
      </div>
    </>
  );
}