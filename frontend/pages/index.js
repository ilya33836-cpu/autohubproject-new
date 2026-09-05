import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const POPULAR_SERVICES = [
  { name: 'Замена масла', price: 'от 2 500 ₽', icon: '🛢️' },
  { name: 'Компьютерная диагностика', price: 'от 1 500 ₽', icon: '💻' },
  { name: 'Замена тормозных колодок', price: 'от 3 200 ₽', icon: '🛑' },
  { name: 'Техническое обслуживание', price: 'от 7 500 ₽', icon: '🔧' },
  { name: 'Шиномонтаж', price: 'от 2 200 ₽', icon: '⚙️' },
  { name: 'Ремонт подвески', price: 'от 4 000 ₽', icon: '🔩' },
];

const ADVANTAGES = [
  { title: 'Прозрачная смета', text: 'Вы видите точную стоимость работ до начала обслуживания.' },
  { title: 'Онлайн-запись', text: 'Запишитесь на удобное время в несколько кликов.' },
  { title: 'Уведомления', text: 'Получайте статусы заказа и рекомендации в реальном времени.' },
  { title: 'История обслуживания', text: 'Все данные по вашему автомобилю в одном месте.' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Создайте аккаунт', text: 'Зарегистрируйтесь и добавьте свой автомобиль.' },
  { step: '2', title: 'Выберите услугу', text: 'Подберите нужную услугу и удобное время.' },
  { step: '3', title: 'Отслеживайте статус', text: 'Следите за прогрессом работы в личном кабинете.' },
  { step: '4', title: 'Получайте уведомления', text: 'Мы сообщим, когда автомобиль будет готов.' },
];

const FAQ = [
  { q: 'Как записаться на обслуживание?', a: 'Зайдите в раздел «Онлайн-запись», выберите автомобиль, услугу и удобное время.' },
  { q: 'Можно ли отслеживать историю работ?', a: 'Да, вся история обслуживания доступна в личном кабинете.' },
  { q: 'Как быстро приходят уведомления?', a: 'Уведомления отправляются сразу после изменения статуса заказа.' },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          setIsAuthenticated(true);
          setUserRole(data.role);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setUserRole(null);
        });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Главная | AUTOHUB — автосервис нового формата</title>
        <meta name="description" content="AUTOHUB — цифровая платформа для управления автосервисом: онлайн-запись, история обслуживания, уведомления." />
      </Head>

      {/* Hero */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p className="text-blue-400 font-semibold tracking-widest uppercase text-sm mb-3">AUTOHUB</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Автосервис,
            <br />
            который говорит с вами на одном языке
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Онлайн-запись, прозрачная смета, история обслуживания
            и уведомления о статусе — всё в личном кабинете.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/book-service" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-10 rounded-lg">
                  Записаться онлайн
                </Link>
                <Link href="/dashboard" className="bg-transparent border border-gray-500 hover:border-white text-white font-semibold py-3 px-10 rounded-lg">
                  Личный кабинет
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthPrompt(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-10 rounded-lg"
                >
                  Записаться онлайн
                </button>
                <Link href="/services" className="bg-transparent border border-gray-500 hover:border-white text-white font-semibold py-3 px-10 rounded-lg">
                  Наши услуги
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4">Войдите или зарегистрируйтесь</h2>
            <p className="text-gray-600 mb-6">
              Чтобы записаться на обслуживание онлайн, необходимо войти в аккаунт или создать новый.
            </p>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-2 px-4 rounded"
                onClick={() => setShowAuthPrompt(false)}
              >
                Войти
              </Link>
              <Link
                href="/signup"
                className="flex-1 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 text-center font-semibold py-2 px-4 rounded"
                onClick={() => setShowAuthPrompt(false)}
              >
                Регистрация
              </Link>
            </div>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="mt-4 w-full text-gray-500 hover:text-gray-700"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Преимущества */}
        <section className="text-center max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-bold mb-4">Почему AUTOHUB</h2>
          <p className="text-lg text-gray-600">
            Мы объединили классический автосервис и современную IT-платформу:
            минимум формальностей, максимум прозрачности
            и полный контроль над обслуживанием вашего автомобиля.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {ADVANTAGES.map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Популярные услуги */}
        <section className="mt-24">
          <h2 className="text-3xl font-bold mb-6">Популярные услуги</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_SERVICES.map((service) => (
              <div key={service.name} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{service.icon} {service.name}</h3>
                  <p className="text-gray-600">{service.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section className="mt-24">
          <h2 className="text-3xl font-bold mb-6 text-center">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-bold mb-6 text-center">Частые вопросы</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details key={item.q} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <summary className="font-semibold cursor-pointer">{item.q}</summary>
                <p className="mt-2 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Контакты */}
        <section className="bg-gray-100 rounded-xl p-8 mt-24">
          <h2 className="text-3xl font-bold mb-4">Контакты</h2>
          <p className="text-gray-700">
            Москва, Ленинградский проспект, 39 • +7 (900) 000-00-00 • Ежедневно с 9:00 до 21:00
          </p>
          <Link href="/contact" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
            Подробнее →
          </Link>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white rounded-xl p-10 text-center mt-24">
          <h2 className="text-3xl font-bold mb-3">
            {isAuthenticated ? 'Готовы записаться на обслуживание?' : 'Готовы доверить нам свой автомобиль?'}
          </h2>
          <p className="mb-6 text-blue-100">
            {isAuthenticated ? 'Выберите автомобиль и услугу в личном кабинете.' : 'Создайте аккаунт и запишитесь на удобное время.'}
          </p>
          {isAuthenticated ? (
            <Link href="/book-service" className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-10 rounded-lg">
              Записаться онлайн
            </Link>
          ) : (
            <button
              onClick={() => setShowAuthPrompt(true)}
              className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-10 rounded-lg"
            >
              Записаться онлайн
            </button>
          )}
        </section>
      </div>
    </>
  );
}
