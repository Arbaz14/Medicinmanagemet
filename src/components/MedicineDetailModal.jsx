import React from 'react';
import { FiX } from 'react-icons/fi';

// Helper component for displaying a single detail
const DetailItem = ({ label, value }) => {
  // Don't render the item if the value is empty, null, or undefined
  if (!value && typeof value !== 'boolean' && typeof value !== 'number') return null;
  
  let displayValue = value;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="mt-1 text-md text-gray-900">{displayValue}</p>
    </div>
  );
};

export default function MedicineDetailModal({ isOpen, onClose, medicine }) {
  if (!isOpen || !medicine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Main modal content */}
      <div className="bg-white rounded-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{medicine.brandName}adda</h2>
            <p className="text-lg font-semibold text-gray-600">{ medicine.name || medicine.saltComposition}</p>
              </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <FiX className="text-2xl text-gray-500" />
          </button>
        </div>

        <div className="space-y-8">
          {/* --- Basic Information --- */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="Generic Name" value={medicine.name} />
              <DetailItem label="Salt Compostion" value={medicine.saltComposition} />
              <DetailItem label="Strength" value={medicine.strength} />
              <DetailItem label="Form" value={medicine.type} />
              <DetailItem label="Pack Size" value={medicine.packSize} />
            </div>
            {medicine.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-md text-gray-900 leading-relaxed">{medicine.description}</p>
              </div>
            )}
          </section>

          {/* --- Regulatory Information --- */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Regulatory Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="HSN Code" value={medicine.hsn} />
              <DetailItem label="GTIN/Barcode" value={medicine.gtinBarcode} />
              <DetailItem label="Manufacturer" value={medicine.manufacturer} />
              <DetailItem label="Marketing Company" value={medicine.marketingCompany} />
              <DetailItem label="Schedule H1" value={medicine.isScheduleH1} />
            </div>
          </section>
          
          {/* --- THIS IS THE CORRECTED SECTION --- */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Inventory Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DetailItem label="Category" value={medicine.category} />
              <DetailItem label="ABC Classification" value={medicine.abcClassification} />
              <DetailItem label="Minimum Stock" value={medicine.minStockLevel} />
              <DetailItem label="Maximum Stock" value={medicine.maxStockLevel} />
              <DetailItem label="Reorder Level" value={medicine.reorderLevel} />
            </div>
          </section>

          {/* --- Batch Details Section --- */}
          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Active Batches ({medicine.batches.length})</h3>
            {medicine.batches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {medicine.batches.map(batch => (
                  <div key={batch.id} className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-bold text-gray-800">Batch: {batch.id}</p>
                    <p className="text-sm text-gray-600">Exp: {new Date(batch.exp).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Stock: <span className="font-bold">{batch.stock}</span></p>
                    <p className="text-sm font-semibold text-blue-600">MRP: ₹{batch.price}</p>
                    <p className="text-sm text-gray-600">Purchase Price: ₹{batch.purchasePrice}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                <p className="text-gray-500">No active batches for this medicine.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}