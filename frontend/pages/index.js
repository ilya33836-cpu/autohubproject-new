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
  { title: 'Прозрачная смета', text: 'Точная стоимость работ до начала обслуживания.' },
  { title: 'Онлайн-запись', text: 'Запишитесь на удобное время в несколько кликов.' },
  { title: 'Уведомления', text: 'Статус заказа и рекомендации в реальном времени.' },
  { title: 'История обслуживания', text: 'Все данные по автомобилю в одном месте.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Регистрация', text: 'Создайте аккаунт и добавьте автомобиль.' },
  { step: '02', title: 'Выбор услуги', text: 'Подберите услугу и удобное время.' },
  { step: '03', title: 'Выполнение', text: 'Следите за прогрессом в личном кабинете.' },
  { step: '04', title: 'Результат', text: 'Получите уведомление о готовности.' },
];

const FAQ = [
  { q: 'Как записаться на обслуживание?', a: 'Зайдите в раздел «Онлайн-запись», выберите автомобиль, услугу и время.' },
  { q: 'Можно ли отслеживать историю?', a: 'Да, вся история обслуживания доступна в личном кабинете.' },
  { q: 'Как быстро приходят уведомления?', a: 'Сразу после изменения статуса заказа.' },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => { setIsAuthenticated(true); })
        .catch(() => { setIsAuthenticated(false); });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Главная | AUTOHUB — автосервис</title>
        <meta name="description" content="AUTOHUB — цифровая платформа для автосервиса: онлайн-запись, диагностика, история обслуживания." />
      </Head>

      {/* Hero */}
      <section className="relative bg-dark-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-stripes opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-28 text-center">
          <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-6">Автосервис</p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            Ваш автомобиль<br />
            <span className="gradient-text-brand">в надёжных руках</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-10">
            Онлайн-запись, диагностика, прозрачная смета и полный контроль
            обслуживания — всё в одном месте.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link href="/book-service" className="btn-brand">Записаться онлайн</Link>
                <Link href="/dashboard" className="btn-outline">Личный кабинет</Link>
              </>
            ) : (
              <>
                <button onClick={() => setShowAuthPrompt(true)} className="btn-brand">Записаться онлайн</button>
                <Link href="/services" className="btn-outline">Наши услуги</Link>
              </>
            )}
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { label: 'Лет на рынке', value: '10+' },
              { label: 'Автомобилей обслужено', value: '5000+' },
              { label: 'Профессионалов', value: '20+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-brand-400">{s.value}</div>
                <div className="text-dark-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-xl p-8 max-w-md mx-4 shadow-soft-xl border border-dark-700">
            <h2 className="text-2xl font-bold mb-4 text-dark-100">Войдите или зарегистрируйтесь</h2>
            <p className="text-dark-400 mb-6">Чтобы записаться на обслуживание онлайн, необходимо войти в аккаунт или создать новый.</p>
            <div className="flex gap-3">
              <Link href="/login" onClick={() => setShowAuthPrompt(false)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-dark-900 text-center font-bold py-3 px-4 rounded-lg transition-colors">Войти</Link>
              <Link href="/signup" onClick={() => setShowAuthPrompt(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-dark-100 text-center font-bold py-3 px-4 rounded-lg border border-dark-600 transition-colors">Регистрация</Link>
            </div>
            <button onClick={() => setShowAuthPrompt(false)} className="mt-4 w-full text-dark-400 hover:text-dark-200 py-2 transition-colors">Отмена</button>
          </div>
        </div>
      )}

      <div className="section-container">
        {/* Преимущества */}
        <section className="text-center max-w-3xl mx-auto mt-24" data-reveal>
          <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-3">Почему AUTOHUB</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Автосервис, который не подводит</h2>
          <p className="text-lg text-dark-300">
            Мы объединили профессиональный автосервис и цифровую платформу:
            минимум формальностей, максимум прозрачности.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {ADVANTAGES.map((item, i) => (
            <div key={item.title} className="card-dark p-6" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
              <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                <div className="w-5 h-5 bg-brand-500 rounded" />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-dark-400">{item.text}</p>
            </div>
          ))}
        </section>

        {/* Популярные услуги */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-3">Услуги</p>
            <h2 className="text-3xl md:text-4xl font-black" data-reveal>Популярные услуги</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_SERVICES.map((service, i) => (
              <div key={service.name} className="card-dark p-6 flex items-center gap-4" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center text-2xl flex-shrink-0">{service.icon}</div>
                <div>
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <p className="text-brand-400 font-bold">{service.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-3">Процесс</p>
            <h2 className="text-3xl md:text-4xl font-black" data-reveal>Как это работает</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="card-dark p-6 text-center" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <div className="text-3xl font-black text-brand-500 mb-4 tracking-tight">{item.step}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-dark-400">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto mt-24">
          <div className="text-center mb-12">
            <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black" data-reveal>Частые вопросы</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details key={item.q} className="card-static-dark p-5 cursor-pointer group" data-reveal style={{ '--reveal-delay': `${i * 80}ms` }}>
                <summary className="font-bold flex justify-between items-center list-none">
                  {item.q}
                  <span className="text-brand-500 group-hover:rotate-90 transition-transform">▸</span>
                </summary>
                <p className="mt-3 text-dark-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Контакты */}
        <section className="bg-dark-800 rounded-xl p-8 mt-24" data-reveal>
          <div className="text-center mb-8">
            <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-3">Контакты</p>
            <h2 className="text-3xl md:text-4xl font-black">Найти нас</h2>
          </div>
          <p className="text-dark-200 text-center text-lg font-medium">
            Москва, Ленинградский проспект, 39 • +7 (900) 000-00-00 • Ежедневно с 9:00 до 21:00
          </p>
          <div className="text-center mt-4">
            <Link href="/contact" className="inline-block text-brand-400 hover:text-brand-300 font-bold">Подробнее →</Link>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 mb-12">
          <div className="bg-gradient-to-r from-dark-800 to-dark-700 text-white rounded-xl p-12 text-center relative overflow-hidden" data-reveal>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black mb-3">
                {isAuthenticated ? 'Готовы записаться на обслуживание?' : 'Готовы доверить нам свой автомобиль?'}
              </h2>
              <p className="mb-8 text-dark-300 text-lg">
                {isAuthenticated ? 'Выберите автомобиль и услугу в личном кабинете.' : 'Создайте аккаунт и запишитесь на удобное время.'}
              </p>
              {isAuthenticated ? (
                <Link href="/book-service" className="btn-brand inline-block">Записаться онлайн</Link>
              ) : (
                <button onClick={() => setShowAuthPrompt(true)} className="btn-brand inline-block">Записаться онлайн</button>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
