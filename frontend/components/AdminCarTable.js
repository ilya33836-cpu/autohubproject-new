const AdminCarTable = ({ cars }) => {
  if (!cars || cars.length === 0) return <p className="py-8 text-steel-400">Автомобилей не найдено.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-dark-700">
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tl-xl">ID</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Марка</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Модель</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Год</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Гос. номер</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">VIN</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Пробег</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider">Владелец</th>
            <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-steel-300 uppercase tracking-wider rounded-tr-xl">Заказов</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-600">
          {cars.map(car => (
            <tr key={car.id} className="bg-dark-800 hover:bg-dark-700 transition-colors">
              <td className="px-5 py-4 text-steel-400">{car.id}</td>
              <td className="px-5 py-4 font-medium text-dark-100">{car.brand}</td>
              <td className="px-5 py-4 text-steel-400">{car.model}</td>
              <td className="px-5 py-4 text-steel-400">{car.year}</td>
              <td className="px-5 py-4 text-steel-400">{car.license_plate || 'Не указан'}</td>
              <td className="px-5 py-4 text-steel-400">{car.vin || 'Не указан'}</td>
              <td className="px-5 py-4 text-steel-400">{car.mileage || 0} км</td>
              <td className="px-5 py-4">
                <div className="font-medium text-dark-100">{car.owner.full_name || car.owner.username}</div>
                <div className="text-steel-400">{car.owner.email}</div>
              </td>
              <td className="px-5 py-4 text-steel-400">{car.orders?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCarTable;
