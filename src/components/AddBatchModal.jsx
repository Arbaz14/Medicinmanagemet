import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

export default function AddBatchModal({ isOpen, onClose, onSave }) {
  const [id, setId] = useState('');
  const [exp, setExp] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBatchData = {
      id, exp, stock: parseInt(stock, 10), price: parseFloat(price), purchasePrice: parseFloat(purchasePrice)
    };
    onSave(newBatchData);
    // Clear form for next time
    setId(''); setExp(''); setStock(''); setPrice(''); setPurchasePrice('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Batch</h2>
          <button onClick={onClose}><FiX className="text-2xl" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input type="text" placeholder="Batch ID" value={id} onChange={(e) => setId(e.target.value)} required className="w-full p-2 border rounded" />
            <input type="date" value={exp} onChange={(e) => setExp(e.target.value)} required className="w-full p-2 border rounded" />
            <input type="number" placeholder="Stock Quantity" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full p-2 border rounded" />
            <input type="number" step="0.01" placeholder="Sale Price (MRP)" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full p-2 border rounded" />
            <input type="number" step="0.01" placeholder="Purchase Price" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required className="w-full p-2 border rounded" />
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save Batch</button>
          </div>
        </form>
      </div>
    </div>
  );
}