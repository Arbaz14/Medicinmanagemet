import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function AddMedicineModal({ isOpen, onClose, onSave, medicine }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [hsn, setHsn] = useState('');
  const [manufacturer, setManufacturer] = useState('');

  useEffect(() => {
    if (medicine) {
      setName(medicine.name); setType(medicine.type); setHsn(medicine.hsn); setManufacturer(medicine.manufacturer);
    } else {
      setName(''); setType(''); setHsn(''); setManufacturer('');
    }
  }, [medicine, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMedicineData = { name, type, hsn, manufacturer };
    onSave(newMedicineData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{medicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
          <button onClick={onClose}><FiX className="text-2xl" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input type="text" placeholder="Medicine Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
            <input type="text" placeholder="Type (e.g., Tablet)" value={type} onChange={(e) => setType(e.target.value)} required className="w-full p-2 border rounded" />
            <input type="text" placeholder="HSN" value={hsn} onChange={(e) => setHsn(e.target.value)} required className="w-full p-2 border rounded" />
            <input type="text" placeholder="Manufacturer" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save Medicine</button>
          </div>
        </form>
      </div>
    </div>
  );
}