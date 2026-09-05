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
