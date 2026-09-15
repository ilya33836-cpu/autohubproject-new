import '../styles/globals.css';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isCRM, setIsCRM] = useState(false);

  useEffect(() => {
    setIsCRM(router.pathname === '/crm');
  }, [router.pathname]);

  // Плавная прокрутка к якорям + естественное восстановление позиции страницы
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }, []);

  // Анимация появления секций и элементов при скролле (атрибут data-reveal)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const selector = '[data-reveal]:not(.is-visible)';
    const elements = document.querySelectorAll(selector);

    // Сначала сразу показываем элементы, уже попавшие в область видимости — иначе при
    // включении reveal-js они исчезли бы до первого срабатывания IntersectionObserver.
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });

    // Включаем CSS, скрывающий ещё невидимые элементы (только те, что за пределами вьюпорта)
    document.documentElement.classList.add('reveal-js');
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll(selector).forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -64px 0px' }
    );

    const observeAll = () =>
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    observeAll();

    // Повторно сканировать новые элементы после клиентской навигации и динамического рендера
    const onRouteChange = () => observeAll();
    router.events?.on('routeChangeComplete', onRouteChange);

    let mo = null;
    if (typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(observeAll);
      mo.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      router.events?.off('routeChangeComplete', onRouteChange);
      if (mo) mo.disconnect();
    };
  }, [router]);

  if (isCRM) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout title={Component.title || 'AUTOHUB'}>
      <Component {...pageProps} />
    </Layout>
  );
}

MyApp.title = 'AUTOHUB';

export default MyApp;
