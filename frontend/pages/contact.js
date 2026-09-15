import Head from 'next/head';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      <Head><title>Контакты | AUTOHUB</title></Head>

      <div className="section-container mt-8">
        <div className="text-center mb-14">
          <p className="text-brand-400 font-bold tracking-[0.3em] uppercase text-xs mb-3">Свяжитесь с нами</p>
          <h1 className="text-4xl md:text-5xl font-black">Контакты</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          <div className="card-dark p-8">
            <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center mb-5">
              <span className="text-2xl">📍</span>
            </div>
            <h2 className="text-xl font-bold mb-4">Как нас найти</h2>
            <address className="not-italic space-y-3 text-dark-300">
              <p>Москва, Ленинградский проспект, 39, стр. 2</p>
              <p>Ежедневно с 9:00 до 21:00</p>
            </address>
            <a href="https://yandex.ru/maps" target="_blank" rel="noreferrer" className="mt-6 inline-block text-brand-400 hover:text-brand-300 font-bold">Открыть на карте →</a>
          </div>

          <div className="card-dark p-8">
            <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center mb-5">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-bold mb-4">Связаться с нами</h2>
            <ul className="space-y-3 text-dark-300">
              <li>📞 <a href="tel:+79000000000" className="hover:text-brand-400 transition-colors">+7 (900) 000-00-00</a></li>
              <li>✉️ <a href="mailto:info@autohub.ru" className="hover:text-brand-400 transition-colors">info@autohub.ru</a></li>
              <li>💬 Telegram: <a href="https://t.me/autohub" className="hover:text-brand-400 transition-colors">@autohub</a></li>
            </ul>
          </div>
        </div>

        <div className="text-center pb-12">
          <div className="bg-gradient-to-r from-brand-600 to-orange-600 text-dark-900 rounded-xl py-14 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-black mb-2">Удобнее записаться онлайн</h2>
              <p className="mb-8 text-dark-800 text-lg">Займёт меньше минуты — просто выберите услугу и время.</p>
              <Link href="/book-service" className="bg-dark-900 hover:bg-dark-800 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block">Онлайн-запись</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
