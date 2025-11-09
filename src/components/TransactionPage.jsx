import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlus, FiMinus, FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import BillSummary from './BillSummary';
import PostSaleRestockModal from './PostSaleRestockModal'; 


// --- START: Integrated RestockBatchModal Component Definition ---
// ... (This component is unchanged) ...
const RestockBatchModal = ({ isOpen, onClose, onSave, medicine, initialData }) => {
  const newBatchDefault = {
    batchNumber: '', expiryDate: '', quantity: 1,
    purchasePrice: '', sellingPrice: '', mrp: '', gstRate: '',
  };
  const [formData, setFormData] = useState(newBatchDefault);

  const isNewBatch = !initialData;

  useEffect(() => {
    if (isOpen) {
      if (isNewBatch) {
        setFormData(newBatchDefault);
      } else {
        setFormData({
          batchNumber: initialData.batchNumber || initialData.id || '',
          expiryDate: initialData.expiryDate || initialData.exp || '',
          quantity: initialData.quantity || 1,
          purchasePrice: initialData.purchasePrice || '',
          sellingPrice: initialData.sellingPrice || initialData.price || '',
          mrp: initialData.mrp || initialData.price || '',
          gstRate: initialData.gstRate || '',
        });
      }
    }
  }, [isOpen, initialData, isNewBatch]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ['batchNumber', 'expiryDate', 'quantity', 'purchasePrice', 'sellingPrice', 'mrp'];
    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        alert(`Please fill the required field: ${field.replace(/([A-Z])/g, ' $1').trim()}`);
        return;
      }
    }
    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
       alert(`Quantity must be a positive whole number.`);
       return;
    }
    onSave(formData);
    onClose();
  };

   return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Add New Batch</h2>
              <p className="text-gray-600">{medicine?.brandName}</p>
            </div>
            <button type="button" onClick={onClose}><FiX className="text-2xl" /></button>
          </div>
          {/* Form Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Batch Number <span className="text-red-500">*</span></label>
              <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} 
                readOnly={!isNewBatch} 
                className={`mt-1 block w-full border p-2 rounded ${!isNewBatch ? 'bg-gray-100' : ''}`} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Expiry Date <span className="text-red-500">*</span></label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantity to Add <span className="text-red-500">*</span></label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" step="1" className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 100" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Purchase Price <span className="text-red-500">*</span></label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 25.50" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Selling Price <span className="text-red-500">*</span></label>
              <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 40.00" required />
            </div>
             <div>
              <label className="block text-sm font-medium">MRP <span className="text-red-500">*</span></label>
              <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} step="0.01" min="0" className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 45.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium">GST Rate (%)</label>
              <input type="text" name="gstRate" value={formData.gstRate} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 12 or 5%" />
            </div>
          </div>
          {/* Footer */}
          <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"> Cancel </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"> Add to Bill </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- END: Integrated RestockBatchModal Component Definition ---


// --- *** MODIFIED: Function Definition *** ---
export default function TransactionPage({
  mode,
  allMedicines, 
  pendingMedicine,
  cart,
  onCartUpdate,
  onSetCartQuantity,
  onModalSave,
  onRemoveFromCart,
  onClearCart,
  onTransaction, 
  onRemoveBatch,
  onDiscardPending,
  customerDetails,
  onCustomerDetailsChange,
  
  isPostSaleModalOpen,
  onClosePostSaleModal,
  onConfirm,

  invoiceDetails,
  onInvoiceDetailsChange,

  // --- *** NEW: Calculated totals prop *** ---
  checkoutTotals 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isRestockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedMedForRestock, setSelectedMedForRestock] = useState(null);

  const isRestock = mode === 'restock';

  const medicinesToDisplay = useMemo(() => {
      let combinedMedicines = JSON.parse(JSON.stringify(allMedicines));

      if (isRestock) {
        const newBatchesFromCart = cart.filter(item => item.isNew);
        
        newBatchesFromCart.forEach(cartItem => {
          const medIndex = combinedMedicines.findIndex(med => med.id === cartItem.medicineId);
          if (medIndex > -1) {
            const batchExists = combinedMedicines[medIndex].batches.some(b => b.id === cartItem.batchId);
            
            if (!batchExists) {
              combinedMedicines[medIndex].batches.push({
                id: cartItem.batchId,
                exp: cartItem.expiryDate,
                stock: 0,
                price: cartItem.sellingPrice,
                purchasePrice: cartItem.purchasePrice,
                mrp: cartItem.mrp,
                gstRate: cartItem.gstRate,
                isNew: true
              });
            }
          }
        });
      }

      return combinedMedicines.filter(med => {
            const query = searchQuery.toLowerCase().trim();
            if (!query) return true;
            const searchableFields = [
                med.brandName, med.medicineName, med.saltComposition, med.strength,
                med.form, med.packSize, med.description, med.hsnCode, med.gtinBarcode,
                med.manufacturer, med.marketingCompany, med.minStockLevel, med.maxStockLevel,
                med.reorderLevel, med.category, med.abcClassification
            ];
            const batchIds = med.batches.map(b => b.id).join(' ');
            const searchableText = searchableFields.filter(Boolean).join(' ').toLowerCase() + ' ' + batchIds.toLowerCase();
            return searchableText.includes(query);
      });
  }, [allMedicines, searchQuery, cart, mode]);


  // --- Handlers ---
  
  const handleBillQuantityChange = (batchId, change) => {
    const itemToUpdate = cart.find(item => item.batchId === batchId);
    if (!itemToUpdate) {
        console.warn(`Item ${batchId} not found in cart.`);
        return;
    }
    
    const medicine = medicinesToDisplay.find(m => m.id === itemToUpdate.medicineId);
    if (!medicine) {
        console.warn(`Medicine ${itemToUpdate.medicineId} not found.`);
        return;
    }
    
    let batch = medicine.batches.find(b => b.id === batchId);
    
    if (!batch) {
      console.warn(`Batch ${batchId} not in inventory, using cart item data.`);
      batch = {
          id: itemToUpdate.batchId, exp: itemToUpdate.expiryDate, stock: 0,
          price: itemToUpdate.sellingPrice, purchasePrice: itemToUpdate.purchasePrice,
          mrp: itemToUpdate.mrp, gstRate: itemToUpdate.gstRate, isNew: true
      };
    }
    
    onCartUpdate(medicine, batch, change, mode);
  };

  const handleOpenRestockModal = (medicine) => {
    setSelectedMedForRestock(medicine);
    setRestockModalOpen(true);
  };

  const handleSaveRestockBatch = (batchDataFromModal) => {
    onModalSave(selectedMedForRestock, batchDataFromModal);
    setRestockModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex gap-8">
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">{isRestock ? 'Restock Management' : 'Cart Management'}</h1>
            {isRestock && (
                <Link to="/add-medicine" className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center font-semibold">
                    <FiPlus className="mr-2" /> Add New Medicine
                </Link>
            )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search all fields: Brand, Generic Name, Batch No, HSN, etc..."
                className="bg-white rounded-lg pl-12 pr-4 py-3 w-full shadow-sm"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <h2 className="text-2xl font-bold text-gray-700 mb-4">All Medicines ({medicinesToDisplay.length})</h2>

        <div className="space-y-6">
          {medicinesToDisplay.map(med => {
            const isPending = pendingMedicine && med.id === pendingMedicine.id;
            const cardBg = isPending ? 'bg-yellow-50' : 'bg-white';
            const cardBorder = isPending ? 'border-yellow-300' : 'border';

            return (
            <div key={med.id} className={`${cardBg} rounded-lg p-6 shadow-sm ${cardBorder} mb-6 relative`}>

              {isPending && (
                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                   <span className="flex items-center text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full shadow-sm">
                       <FiAlertTriangle size={12} className="mr-1"/> Pending Finalization
                   </span>
                   <button
                        onClick={onDiscardPending}
                        className="p-1 text-red-500 hover:text-red-700 bg-white rounded-full shadow hover:bg-red-50"
                        title="Discard Staged Medicine">
                       <FiTrash2 size={14} />
                   </button>
                </div>
              )}

              {/* Medicine Card Header */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold">{med.brandName}</h3>
                  <p className="text-sm text-gray-500">Generic: {med.medicineName} | Manufacturer: {med.manufacturer}</p>
                </div>
                {isRestock && (
                    <button
                      onClick={() => handleOpenRestockModal(med)}
                      className="flex items-center text-sm text-blue-600 font-semibold"
                    >
                        <FiPlus className="mr-1"/>Add new batch
                    </button>
                )}
              </div>

              {/* Medicine Card Body - Batches */}
              <div className="pt-4">
                 <h3 className="text-lg font-semibold mb-3">Active Batches ({med.batches.length})</h3>
                 <div className="flex flex-wrap gap-6">
                    {med.batches.map(batch => {
                        const cartItem = cart.find(item => item.batchId === batch.id);
                        const quantityInCart = cartItem ? cartItem.quantity : 0;
                        
                        const priceToDisplay = isRestock ? batch.purchasePrice : batch.price;

                        const isNewBatchTag = batch.isNew || (cartItem && cartItem.isNew);
                        
                        const showRemoveIcon = isRestock && 
                            (quantityInCart === 0) &&
                            (
                                isNewBatchTag ||
                                (parseInt(batch.stock, 10) || 0) === 0
                            );

                        return (
                           <div key={batch.id} className={`relative p-4 rounded-lg border-2 ${ isNewBatchTag ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-300' }`}>
                               {quantityInCart > 0 && ( <button onClick={() => onRemoveFromCart(med.id, batch.id)} className="absolute -top-2 -left-2 p-0.5 bg-gray-400 text-white rounded-full" title="Remove from Bill"><FiX size={14} /></button> )}
                               
                               {showRemoveIcon && ( 
                                 <button 
                                     onClick={() => onRemoveBatch(med.id, batch.id)} 
                                     className="absolute -top-2 -right-2 p-0.5 bg-red-500 text-white rounded-full" 
                                     title="Remove Batch from Inventory">
                                     <FiX size={14}/>
                                 </button> 
                               )}
                               
                               {isNewBatchTag && <span className="absolute top-2 right-2 text-xs bg-yellow-400 text-black font-bold px-2 py-0.5 rounded">New</span>}

                               <p className="font-bold">Batch: {batch.id}</p>
                               <p className="text-sm text-gray-600">Exp: {batch.exp}</p>
                               <p className="text-sm text-gray-600">Price: {priceToDisplay.toFixed(2)}</p>
                               
                               <p className="text-sm text-gray-600">
                                 Stock: {batch.stock}
                               </p>
                               
                               <div className="mt-3 flex items-center justify-center gap-2">
                                   <button 
                                       onClick={() => onCartUpdate(med, batch, -1, mode)} 
                                       className="p-2 bg-gray-200 rounded disabled:opacity-50"
                                       disabled={quantityInCart <= 0}
                                   >
                                       <FiMinus />
                                   </button>
                                   <input 
                                        type="text" 
                                        value={quantityInCart} 
                                        onChange={(e) => onSetCartQuantity(med, batch, e.target.value, mode)}
                                        className="w-16 h-10 text-center font-bold text-xl bg-white border rounded" 
                                    />
                                   <button 
                                       onClick={() => onCartUpdate(med, batch, 1, mode)} 
                                       className="p-2 bg-gray-200 rounded disabled:opacity-50"
                                       disabled={!isRestock && !isNewBatchTag && quantityInCart >= batch.stock}
                                   >
                                       <FiPlus />
                                   </button>
                               </div>
                           </div>
                        );
                    })}
                     {med.batches.length === 0 && ( <p className="text-sm text-gray-500">No batches defined for this medicine yet.</p> )}
                 </div>
              </div>
            </div>
          )})}

          {medicinesToDisplay.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                No medicines found matching your search query.
            </div>
          )}
        </div>
      </div>

      {/* --- *** MODIFIED: BillSummary component call *** --- */}
      <BillSummary
        cart={cart}
        onQuantityChange={handleBillQuantityChange}
        onRemoveItem={onRemoveFromCart}
        onProcess={onTransaction}
        onHold={onClearCart}
        mode={mode}
        customerDetails={customerDetails}
        onCustomerDetailsChange={onCustomerDetailsChange}
        invoiceDetails={invoiceDetails}
        onInvoiceDetailsChange={onInvoiceDetailsChange}
        // --- *** NEW: Pass calculated totals *** ---
        totals={checkoutTotals} // Pass the calculated totals
      />

      {/* Render the integrated Restock Modal */}
      {isRestock && (
          <RestockBatchModal
            isOpen={isRestockModalOpen}
            onClose={() => setRestockModalOpen(false)}
            onSave={handleSaveRestockBatch}
            medicine={selectedMedForRestock}
            initialData={null}
          />
      )}
      
      {!isRestock && (
          <PostSaleRestockModal
            isOpen={isPostSaleModalOpen}
            onClose={onClosePostSaleModal}
            onConfirm={onConfirm}
            cartItems={cart}
          />
      )}
    </div>
  );
}