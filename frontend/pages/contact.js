import Head from 'next/head';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Контакты | AUTOHUB</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 mt-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Контакты</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Как нас найти</h2>
            <address className="not-italic space-y-2 text-gray-700">
              <p>📍 Москва, Ленинградский проспект, 39, стр. 2</p>
              <p>🕐 Ежедневно с 9:00 до 21:00</p>
            </address>
            <a href="https://yandex.ru/maps" target="_blank" rel="noreferrer" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Открыть на карте →
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Связаться с нами</h2>
            <ul className="space-y-3 text-gray-700">
              <li>
                📞 <a href="tel:+79000000000" className="hover:text-blue-700">+7 (900) 000-00-00</a>
              </li>
              <li>
                ✉️ <a href="mailto:info@autohub.ru" className="hover:text-blue-700">info@autohub.ru</a>
              </li>
              <li>
                💬 Telegram: <a href="https://t.me/autohub" className="hover:text-blue-700">@autohub</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-16 bg-gray-900 text-white py-10 px-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Удобнее записаться онлайн</h2>
          <p className="mb-6 text-gray-300">Займёт меньше минуты — просто выберите услугу и время.</p>
          <Link href="/book-service" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg">
            Онлайн-запись
          </Link>
        </div>
      </div>
    </>
  );
}