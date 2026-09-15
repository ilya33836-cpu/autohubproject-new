import { useState } from 'react';

const AddCarModal = ({ isOpen, onClose, onSave, userId }) => {
  const [formData, setFormData] = useState({ brand: '', model: '', year: '', license_plate: '', vin: '', mileage: '', photo_url: '', owner_id: userId });

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.year) { alert('Марка, модель и год выпуска обязательны.'); return; }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 pb-0">
          <h2 className="text-xl font-bold">Добавить новый автомобиль</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div>
            <label htmlFor="brand" className="input-label">Марка *</label>
            <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label htmlFor="model" className="input-label">Модель *</label>
            <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label htmlFor="year" className="input-label">Год выпуска *</label>
            <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} required min="1900" max="2030" className="input-field" />
          </div>
          <div>
            <label htmlFor="license_plate" className="input-label">Гос. номер</label>
            <input type="text" id="license_plate" name="license_plate" value={formData.license_plate} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label htmlFor="vin" className="input-label">VIN</label>
            <input type="text" id="vin" name="vin" value={formData.vin} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label htmlFor="mileage" className="input-label">Пробег (км)</label>
            <input type="number" id="mileage" name="mileage" value={formData.mileage} onChange={handleChange} min="0" className="input-field" />
          </div>
          <div>
            <label htmlFor="photo_url" className="input-label">Ссылка на фото</label>
            <input type="text" id="photo_url" name="photo_url" value={formData.photo_url} onChange={handleChange} placeholder="https://..." className="input-field" />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-5 rounded-xl transition-colors">Отмена</button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white py-2.5 px-5 rounded-xl shadow-soft hover:shadow-glow transition-all duration-300">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarModal;
