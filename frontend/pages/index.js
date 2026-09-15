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
  { step: '01', title: 'Создайте аккаунт', text: 'Зарегистрируйтесь и добавьте свой автомобиль.' },
  { step: '02', title: 'Выберите услугу', text: 'Подберите нужную услугу и удобное время.' },
  { step: '03', title: 'Отслеживайте статус', text: 'Следите за прогрессом работы в личном кабинете.' },
  { step: '04', title: 'Получайте уведомления', text: 'Мы сообщим, когда автомобиль будет готов.' },
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
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-28 text-center">
          <p className="text-primary-400 font-semibold tracking-widest uppercase text-sm mb-4">AUTOHUB</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Автосервис,
            <br />
            <span className="hero-gradient-text">который говорит с вами</span>
            <br />
            на одном языке
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Онлайн-запись, прозрачная смета, история обслуживания
            и уведомления о статусе — всё в личном кабинете.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/book-service" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-10 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300">
                  Записаться онлайн
                </Link>
                <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3.5 px-10 rounded-xl backdrop-blur-sm transition-all duration-300">
                  Личный кабинет
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthPrompt(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-10 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300"
                >
                  Записаться онлайн
                </button>
                <Link href="/services" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3.5 px-10 rounded-xl backdrop-blur-sm transition-all duration-300">
                  Наши услуги
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-soft-xl animate-float">
            <h2 className="text-2xl font-bold mb-4">Войдите или зарегистрируйтесь</h2>
            <p className="text-gray-600 mb-6">
              Чтобы записаться на обслуживание онлайн, необходимо войти в аккаунт или создать новый.
            </p>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                onClick={() => setShowAuthPrompt(false)}
              >
                Войти
              </Link>
              <Link
                href="/signup"
                className="flex-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-primary-600 text-center font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                onClick={() => setShowAuthPrompt(false)}
              >
                Регистрация
              </Link>
            </div>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="mt-4 w-full text-gray-500 hover:text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="section-container">
        {/* Преимущества */}
        <section className="text-center max-w-3xl mx-auto mt-24" data-reveal>
          <p className="text-primary-600 font-semibold tracking-widest uppercase text-sm mb-3">Преимущества</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Почему AUTOHUB</h2>
          <p className="text-lg text-gray-600">
            Мы объединили классический автосервис и современную IT-платформу:
            минимум формальностей, максимум прозрачности
            и полный контроль над обслуживанием вашего автомобиля.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {ADVANTAGES.map((item, i) => (
            <div key={item.title} className="card p-6" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-primary-500 rounded-lg" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Популярные услуги */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold tracking-widest uppercase text-sm mb-3">Услуги</p>
            <h2 className="text-3xl md:text-4xl font-bold" data-reveal>Популярные услуги</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_SERVICES.map((service, i) => (
              <div key={service.name} className="card p-6 flex items-center gap-4" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <p className="text-primary-600 font-medium">{service.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold tracking-widest uppercase text-sm mb-3">Процесс</p>
            <h2 className="text-3xl md:text-4xl font-bold" data-reveal>Как это работает</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="card p-6 text-center" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <div className="text-3xl font-extrabold text-primary-600 mb-4 tracking-tight">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mt-24">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold tracking-widest uppercase text-sm mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold" data-reveal>Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details key={item.q} className="card-static p-5 cursor-pointer group" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <summary className="font-semibold flex justify-between items-center list-none">
                  {item.q}
                  <span className="text-gray-400 group-hover:text-primary-600 transition-colors ml-2">▸</span>
                </summary>
                <p className="mt-3 text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Контакты */}
        <section className="bg-surface-100 rounded-2xl p-8 mt-24" data-reveal>
          <div className="text-center mb-8">
            <p className="text-primary-600 font-semibold tracking-widest uppercase text-sm mb-3">Контакты</p>
            <h2 className="text-3xl md:text-4xl font-bold">Найти нас</h2>
          </div>
          <p className="text-gray-700 text-center text-lg">
            Москва, Ленинградский проспект, 39 • +7 (900) 000-00-00 • Ежедневно с 9:00 до 21:00
          </p>
          <div className="text-center mt-4">
            <Link href="/contact" className="inline-block text-primary-600 hover:text-primary-700 font-medium">
              Подробнее →
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 mb-12">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl p-12 text-center relative overflow-hidden" data-reveal>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                {isAuthenticated ? 'Готовы записаться на обслуживание?' : 'Готовы доверить нам свой автомобиль?'}
              </h2>
              <p className="mb-8 text-blue-100 text-lg">
                {isAuthenticated ? 'Выберите автомобиль и услугу в личном кабинете.' : 'Создайте аккаунт и запишитесь на удобное время.'}
              </p>
              {isAuthenticated ? (
                <Link href="/book-service" className="inline-block bg-white hover:bg-gray-100 text-primary-600 font-semibold py-3.5 px-10 rounded-xl shadow-lg transition-all duration-300">
                  Записаться онлайн
                </Link>
              ) : (
                <button
                  onClick={() => setShowAuthPrompt(true)}
                  className="inline-block bg-white hover:bg-gray-100 text-primary-600 font-semibold py-3.5 px-10 rounded-xl shadow-lg transition-all duration-300"
                >
                  Записаться онлайн
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
