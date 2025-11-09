import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi'; // Import FiSearch
import MedicineCard from './MedicineCard';
import AddBatchModal from './AddBatchModal';
import MedicineDetailModal from './MedicineDetailModal';

// The component now accepts 'onDeleteMedicine' as a prop
export default function Inventory({ allMedicines, onAddNewBatch, onRemoveBatch, onDeleteMedicine }) {
  const navigate = useNavigate();
  const [isBatchModalOpen, setBatchModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineForBatch, setMedicineForBatch] = useState(null);
  // 1. Add state for search query
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenAddBatch = (medicineId) => {
    setMedicineForBatch(medicineId);
    setBatchModalOpen(true);
  };

  const handleSaveNewBatch = (newBatchData) => {
    onAddNewBatch(medicineForBatch, newBatchData);
    setBatchModalOpen(false);
  };
  
  const handleViewDetails = (medicineId) => {
    const med = allMedicines.find(m => m.id === medicineId);
    setSelectedMedicine(med);
    setDetailModalOpen(true);
  };
  
  const handleConfirmDelete = (medicine) => {
      if (window.confirm(`Are you sure you want to permanently delete the medicine: ${medicine.brandName} (${medicine.medicineName})? This action cannot be undone.`)) {
          onDeleteMedicine(medicine);
      }
  };

  // 2. Implement filtering logic based on ALL fields, including Batch IDs.
  const filteredMedicines = allMedicines.filter(med => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; // Show all if search is empty

    // List all metadata fields
    const searchableFields = [
        med.brandName, 
        med.medicineName, 
        med.saltComposition,
        med.strength,
        med.form,
        med.packSize,
        med.description,
        med.hsnCode,
        med.gtinBarcode,
        med.manufacturer,
        med.marketingCompany,
        med.minStockLevel,
        med.maxStockLevel,
        med.reorderLevel,
        med.category,
        med.abcClassification
    ];
    
    // Include Batch IDs (b.id corresponds to Batch No)
    const batchIds = med.batches.map(b => b.id).join(' ');

    // Combine all fields into one string for simple checking
    const searchableText = searchableFields
        .filter(Boolean) 
        .join(' ')
        .toLowerCase() + ' ' + batchIds.toLowerCase();
    
    return searchableText.includes(query);
  });


  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Inventory Management</h1>
        <button 
          onClick={() => navigate('/add-medicine')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center font-semibold"
        >
          <FiPlus className="mr-2" /> Add New Medicine
        </button>
      </div>
      
      {/* 3. Add Search Bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search all fields: Brand, Generic Name, Batch No, Strength, Manufacturer, HSN, etc." 
          className="bg-white rounded-lg pl-12 pr-4 py-3 w-full shadow-sm" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>
      
      <div className="space-y-6">
        {filteredMedicines.map(medicine => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
            onAddBatch={handleOpenAddBatch}
            onRemoveBatch={onRemoveBatch}
            onViewDetails={handleViewDetails}
            onDelete={() => handleConfirmDelete(medicine)}
            onEdit={() => navigate(`/inventory/edit/${medicine.id}`)}
          />
        ))}
        {filteredMedicines.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                No medicines found matching your search query.
            </div>
        )}
      </div>
      
      <AddBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSave={handleSaveNewBatch}
      />
      
      <MedicineDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        medicine={selectedMedicine}
      />
    </div>
  );
}