import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null); // null - проверка, true/false - результат

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Если токена нет, перенаправляем на логин
      router.push('/login');
    } else {
      // Токен есть, можно считать пользователя авторизованным
      // В реальном приложении тут стоит проверить валидность токена через API
      setIsAuthorized(true);
    }
  }, [router]);

  // Пока идет проверка, можно показать заглушку
  if (isAuthorized === null) {
    return <div className="text-center">Проверка авторизации...</div>;
  }

  // Если пользователь авторизован, рендерим дочерние элементы
  if (isAuthorized) {
    return children;
  }

  // Этот рендер не должен сработать, так как router.push вызывается выше
  // Но на всякий случай возвращаем null
  return null;
};

export default ProtectedRoute;