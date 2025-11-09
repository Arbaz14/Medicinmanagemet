import React, { useState } from 'react';
import { FiSearch, FiPlus, FiMinus, FiX } from 'react-icons/fi';
import BillSummary from './BillSummary';
import AddMedicineModal from './AddMedicineModal';

// This is our new, reusable component. It takes a 'mode' prop.
export default function TransactionPage({ mode, allMedicines, onTransaction, onAddNewMedicine, onAddNewBatch, onRemoveBatch }) {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  // This variable makes it easy to switch between modes
  const isRestock = mode === 'restock';

  // --- Cart and Quantity Management ---
  const handleCartUpdate = (medicine, batch, change) => {
    const existingItem = cart.find(item => item.batchId === batch.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + change;

    // Use the correct price based on the mode
    const price = isRestock ? batch.purchasePrice : batch.price;

    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.batchId !== batch.id));
    } else if (existingItem) {
      setCart(prev => prev.map(item => (item.batchId === batch.id ? { ...item, quantity: newQuantity } : item)));
    } else if (change > 0) {
      setCart(prev => [...prev, { 
        medicineId: medicine.id, name: medicine.name, batchId: batch.id, purchasePrice: price, quantity: 1, // Store the price
      }]);
    }
  };

  const handleBillQuantityChange = (batchId, change) => {
    const itemToUpdate = cart.find(item => item.batchId === batchId);
    if (!itemToUpdate) return;
    const medicine = allMedicines.find(m => m.id === itemToUpdate.medicineId);
    const batch = medicine?.batches.find(b => b.id === batchId);
    if (medicine && batch) {
      handleCartUpdate(medicine, batch, change);
    }
  };
  
  const handleRemoveFromCart = (medicineId, batchId) => {
    setCart(prev => prev.filter(item => !(item.medicineId === medicineId && item.batchId === batchId)));
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) return alert("Your bill is empty.");
    // Call the correct transaction function based on the mode
    onTransaction(cart); 
    alert(`${isRestock ? 'Restock' : 'Checkout'} successful!`);
    setCart([]);
  };

  const filteredMedicines = allMedicines.filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex gap-8">
      <div className="flex-1">
        {/* Title changes based on the mode */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8">{isRestock ? 'Restock Management' : 'Cart Management'}</h1>
        
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search medicine here" className="bg-white rounded-lg pl-12 pr-4 py-3 w-full shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700">All Medicines ({filteredMedicines.length})</h2>
          <button onClick={() => setModalOpen(true)} className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center font-semibold"><FiPlus className="mr-2" /> Add New Medicine</button>
        </div>
        <div className="space-y-6">
          {filteredMedicines.map(med => (
            <div key={med.id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold">{med.name}</h3>
                  <p className="text-sm text-gray-500">Manufacturer: {med.manufacturer} | HSN/ID: {med.hsn}</p>
                </div>
                <button onClick={() => onAddNewBatch(med.id)} className="flex items-center text-sm text-blue-600 font-semibold"><FiPlus className="mr-1"/>Add new batch</button>
              </div>
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-3">Active Batches ({med.batches.length})</h3>
                <div className="flex flex-wrap gap-6">
                  {med.batches.map(batch => {
                    const cartItem = cart.find(item => item.batchId === batch.id);
                    const quantityInCart = cartItem ? cartItem.quantity : 0;
                    const priceToDisplay = isRestock ? batch.purchasePrice : batch.price;

                    return (
                      <div key={batch.id} className={`relative p-4 rounded-lg border-2 ${ batch.isNew ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-300' }`}>
                        {quantityInCart > 0 && (
                          <button onClick={() => handleRemoveFromCart(med.id, batch.id)} className="absolute -top-2 -left-2 p-0.5 bg-gray-400 text-white rounded-full hover:bg-gray-600" title="Unselect (Remove from Bill)"><FiX size={14} /></button>
                        )}
                        {(batch.isNew || batch.stock === 0) && (
                            <button onClick={() => onRemoveBatch(med.id, batch.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-700" title="Permanently Remove Batch"><FiTrash2 size={12}/></button>
                        )}
                        {batch.isNew && <span className="absolute top-2 right-2 text-xs bg-yellow-400 text-black font-bold px-2 py-0.5 rounded">New</span>}
                        <p className="font-bold">Batch: {batch.id}</p>
                        <p className="text-sm text-gray-600">Exp: {batch.exp}</p>
                        <p className="text-sm text-gray-600">Price: ₹{priceToDisplay.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Stock: {batch.stock}</p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button onClick={() => handleCartUpdate(med, batch, -1)} className="p-2 bg-gray-200 rounded"><FiMinus /></button>
                          <input type="text" readOnly value={quantityInCart} className="w-16 h-10 text-center font-bold text-xl bg-white border rounded" />
                          <button onClick={() => handleCartUpdate(med, batch, 1)} className="p-2 bg-gray-200 rounded"><FiPlus /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BillSummary 
        cart={cart}
        onQuantityChange={handleBillQuantityChange}
        onRemoveItem={handleRemoveFromCart}
        onProcess={handleProcessPayment}
        onHold={() => setCart([])}
        mode={mode} // Pass the mode down to the bill summary
      />
      <AddMedicineModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onAddNewMedicine}
      />
    </div>
  );
}