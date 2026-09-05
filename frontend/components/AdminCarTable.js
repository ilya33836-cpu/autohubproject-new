const AdminCarTable = ({ cars }) => {
  if (!cars || cars.length === 0) {
    return <p>Автомобилей не найдено.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Марка</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Модель</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Год</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Гос. номер</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пробег</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Владелец</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказов</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cars.map((car) => (
            <tr key={car.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{car.brand}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.year}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.license_plate || 'Не указан'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.vin || 'Не указан'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.mileage || 0} км</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{car.owner.full_name || car.owner.username}</div>
                <div className="text-sm text-gray-500">{car.owner.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.orders?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCarTable;