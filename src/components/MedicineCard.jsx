import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit3, FiX, FiEye, FiChevronDown } from 'react-icons/fi';

export default function MedicineCard({ medicine, onAddBatch, onDelete, onRemoveBatch, onViewDetails }) {
  const [isBatchesVisible, setBatchesVisible] = useState(false);
  const navigate = useNavigate();

  // Ensure stock is parsed for total calculation
  const totalStock = medicine.batches.reduce((sum, batch) => sum + (parseInt(batch.stock, 10) || 0), 0);
  const inStock = totalStock > 0;

  const handleEdit = (e) => {
    e.preventDefault();
    navigate(`/inventory/edit/${medicine.id}`);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
      <div className="flex justify-between items-start border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">{medicine.brandName}</h2>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <p className="text-md font-semibold text-gray-600 mt-1">
            {medicine.saltComposition || medicine.medicineName}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Manufacturer: {medicine.manufacturer} | Type: {medicine.form}
          </p>
        </div>
        <div className="flex items-start space-x-6">
            <div className="text-right flex-shrink-0">
                <span className="text-sm text-gray-500">Total Stock</span>
                <p className="text-3xl font-bold text-gray-800">{totalStock}</p>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-gray-500">
                <button onClick={() => onViewDetails(medicine.id)} className="hover:text-blue-600" title="View Details"><FiEye size={18} /></button>
         
                <button onClick={handleEdit} className="hover:text-green-600" title="Edit Medicine"><FiEdit3 size={16} /></button>
                <button onClick={() => onDelete(medicine)} className="hover:text-red-600" title="Delete Medicine"><FiTrash2 size={16} /></button> 
            </div>
        </div> 
      </div>
      
      <div className="mt-4 border-t border-gray-200">
        <button 
          type="button" 
          onClick={() => setBatchesVisible(!isBatchesVisible)}
          className="w-full flex justify-between items-center py-4 font-semibold text-gray-700"
        >
          <h3 className="text-lg">Active Batches ({medicine.batches.length})</h3>
          <FiChevronDown className={`transform transition-transform duration-200 ${isBatchesVisible ? 'rotate-180' : ''}`} size={20} />
        </button>

        {isBatchesVisible && (
          <div className="pb-4">
            {medicine.batches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {medicine.batches.map(batch => (
                  <div key={batch.id} className="relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all">
                    {/* FIX: Use parseInt to ensure correct comparison even if stock is a string "0" */}
                    {(batch.isNew || (parseInt(batch.stock, 10) || 0) === 0) && (
                      <button onClick={() => onRemoveBatch(medicine.id, batch.id)} className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full" title="Remove Batch">
                        <FiX size={14} />
                      </button>
                    )}
                    <p className="font-bold text-gray-800">Batch: {batch.id}</p>
                    <p className="text-sm text-gray-600">Exp: {new Date(batch.exp).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Stock: <span className="font-bold">{batch.stock}</span></p>
                    <p className="text-sm font-semibold text-blue-600">MRP: ₹{batch.price}</p>
                  </div>
                ))}
              </div>
            ) : ( 
              <div className="text-center py-8 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                <p className="text-gray-500">No active batches for this medicine.</p>
              </div> 
            )}
            
            {medicine.description && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{medicine.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}