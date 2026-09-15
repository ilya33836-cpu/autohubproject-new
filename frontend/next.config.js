/** @type {import('next').NextConfig} */
const nextConfig = {
  // Стандартный режим Next.js dev/prod-сервера.
  // НЕ используем output:'export', т.к. приложение обращается к REST API
  // (http://localhost:8000) и содержит динамический маршрут /order-details/[id].
  reactStrictMode: true,
}

module.exports = nextConfig
