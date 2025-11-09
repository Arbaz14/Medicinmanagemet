import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function PostSaleRestockModal({ isOpen, onClose, onConfirm, cartItems }) {
  const [restockQuantities, setRestockQuantities] = useState({});

  // When the modal opens, create a state to hold the restock quantity for each item
  useEffect(() => {
    if (isOpen) {
      const initialQuantities = cartItems.reduce((acc, item) => {
        // Use batchId as the unique key
        acc[item.batchId] = 0;
        return acc;
      }, {});
      setRestockQuantities(initialQuantities);
    }
  }, [isOpen, cartItems]);

  const handleQuantityChange = (batchId, value) => {
    const quantity = parseInt(value, 10);
    setRestockQuantities(prev => ({
      ...prev,
      [batchId]: isNaN(quantity) || quantity < 0 ? 0 : quantity,
    }));
  };

  const handleConfirmClick = () => {
    onConfirm(restockQuantities);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Add Sold Items to Restock?</h2>
            <p className="text-gray-600">Optionally, add these items to your restock list.</p>
          </div>
          <button type="button" onClick={onClose}><FiX className="text-2xl" /></button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <p className="text-sm text-gray-500">
            Enter the quantity you wish to add to your restock cart. Leave at 0 to skip.
          </p>
          {cartItems.map(item => (
            <div key={item.batchId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <p className="font-semibold">{item.brandName}</p>
                <p className="text-sm text-gray-500">Batch: {item.batchId} (Sold: {item.quantity})</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Restock Qty:</label>
                <input
                  type="number"
                  min="0"
                  value={restockQuantities[item.batchId] || 0}
                  onChange={(e) => handleQuantityChange(item.batchId, e.target.value)}
                  className="w-20 h-10 text-center font-bold border rounded-md"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          
          {/* --- THIS IS THE ONLY CONFIRM BUTTON --- */}
          <button 
            type="button" 
            onClick={handleConfirmClick} 
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center"
          >
            Confirm Sale
          </button>
        </div>
      </div>
    </div>
  );
}