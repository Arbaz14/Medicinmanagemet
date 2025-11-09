import React, { useState, useEffect } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

const InfoIcon = ({ tooltip }) => (
  <div className="relative group flex items-center ml-2">
    <FiHelpCircle size={14} className="text-gray-400 cursor-help" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {tooltip}
    </div>
  </div>
);

export default function BatchEditModal({ isOpen, onClose, batch, onSave }) {
  const [formData, setFormData] = useState(batch);

  // This ensures the form updates if the user clicks a different batch
  // while the modal is already open (though unlikely in this flow, it's good practice)
  useEffect(() => {
    setFormData(batch);
  }, [batch]);

  if (!isOpen || !batch) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold">Edit Batch: {batch.id}</h2>
            <p className="text-gray-600 mt-1">Update the details for this batch.</p>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Batch Number <span className="text-red-500">*</span></label><InfoIcon tooltip="Unique code for this production run." /></div>
                <input type="text" name="id" value={formData.id} onChange={handleChange} className="mt-1 block w-full border p-2 rounded bg-gray-100" placeholder="e.g., BT240115" required readOnly />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Expiry Date <span className="text-red-500">*</span></label><InfoIcon tooltip="Date after which the medicine is not effective." /></div>
                <input type="date" name="exp" value={formData.exp} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Stock <span className="text-red-500">*</span></label><InfoIcon tooltip="Number of units in this batch." /></div>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 100" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Purchase Price <span className="text-red-500">*</span></label><InfoIcon tooltip="The price you paid per unit." /></div>
                <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} step="0.01" className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 25.50" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Selling Price (MRP) <span className="text-red-500">*</span></label><InfoIcon tooltip="The price you will sell per unit (MRP)." /></div>
                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 40.00" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">GST Rate (%)</label><InfoIcon tooltip="Enter the applicable GST percentage." /></div>
                <input type="text" name="gstRate" value={formData.gstRate} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 12 or 5%" />
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Save Batch Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}