import React, { useState, useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Component Imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import TransactionPage from './components/TransactionPage';
import TransactionHistory from './components/TransactionHistory';
import NewMedicinePage from './components/NewMedicinePage';
import EditMedicinePage from './components/EditMedicinePage';
import EditBatchesPage from './components/EditBatchesPage';
import AddBatchModal from './components/AddBatchModal'; 
import { generateInvoicePDF } from './utils/generateInvoice';


// --- Sample Initial Data ---
const initialMedicines = [
    {
        id: 1, medicineName: 'Paracetamol', brandName: 'Dolo-650', saltComposition: 'Paracetamol 650mg', strength: '650 mg',
        form: 'Tablet', packSize: '15 tablets/strip', manufacturer: 'GSK', hsnCode: '30049099',
        description: 'Used to treat pain and reduce fever.', gtinBarcode: '8901234567890', marketingCompany: 'GSK Consumer Healthcare',
        isScheduleH1: false, minStockLevel: '10', maxStockLevel: '100', reorderLevel: '20', category: 'Analgesic', abcClassification: 'C',
        status: 'active',
        batches: [
            { id: 'PCMD01', exp: '2025-01-31', stock: 81, price: 25, purchasePrice: 22.75, mrp: 25, isNew: false, gstRate: '5' },
            { id: 'PCMD02', exp: '2025-03-15', stock: 120, price: 24, purchasePrice: 22.75, mrp: 24, isNew: false, gstRate: '12' },
        ]
    },
    {
        id: 2, medicineName: 'Amoxicillin & Potassium Clavulanate', brandName: 'Moxikind-CV 625',
        saltComposition: 'Amoxicillin 500mg & Potassium Clavulanate 125mg', strength: '625 mg', form: 'Tablet',
        packSize: '10 tablets/strip', manufacturer: 'Cipla', hsnCode: '30042019',
        description: 'A penicillin-type antibiotic used to treat a wide variety of bacterial infections.',
        gtinBarcode: '8909876543210', marketingCompany: 'Cipla Ltd.', isScheduleH1: true,
        minStockLevel: '20', maxStockLevel: '200', reorderLevel: '40', category: 'Antibiotic', abcClassification: 'A',
        status: 'active',
        batches: [
            { id: 'PCMD03', exp: '2025-04-30', stock: 95, price: 15, purchasePrice: 12.50, mrp: 15, isNew: false, gstRate: '12' },
            { id: 'PCMD04', exp: '2025-05-31', stock: 200, price: 15, purchasePrice: 12.50, mrp: 15, isNew: false, gstRate: '12' },
        ]
    },
];

const initialTransactions = [
  { invoice: '#INV-00123', customer: 'John Smith', date: 'Oct 27, 2023', amount: '₹45.50', status: 'Paid' },
];
// --- End Sample Data ---

// --- Central Calculation Function ---
const calculateTotals = (cart, discountString, buyerStateCode) => {
  const discount = parseFloat(discountString) || 0;
  // Seller State Code (fixed to 20 based on invoice example)
  const SELLER_STATE_CODE = '20'; 
  const isInterState = buyerStateCode !== SELLER_STATE_CODE; 
  
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const discountAmount = (subtotal * (discount / 100));
  const taxableAmount = subtotal - discountAmount;

  const totalGst = cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = itemSubtotal * (discount / 100);
      const itemTaxableAmount = itemSubtotal - itemDiscount;
      const rate = parseFloat(item.gstRate) || 0;
      return sum + (itemTaxableAmount * (rate / 100));
  }, 0);

  const cgstTotal = isInterState ? 0 : totalGst / 2;
  const sgstTotal = isInterState ? 0 : totalGst / 2;
  const igstTotal = isInterState ? totalGst : 0;
  
  const netTotal = taxableAmount + totalGst;
  const finalTotal = Math.round(netTotal);
  const roundOff = finalTotal - netTotal;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    totalGst,
    cgstTotal,
    sgstTotal,
    igstTotal, // NEW
    roundOff,
    netTotal,
    finalTotal,
    isInterState // NEW
  };
};


function App() {
  const navigate = useNavigate(); 

  const [medicines, setMedicines] = useState(initialMedicines);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [checkoutCart, setCheckoutCart] = useState([]);
  const [restockCart, setRestockCart] = useState([]);
  const [stagedBatchChanges, setStagedBatchChanges] = useState({});
  const [pendingMedicineForRestock, setPendingMedicineForRestock] = useState(null);
  
  // --- *** MODIFIED: customerDetails state *** ---
  const [customerDetails, setCustomerDetails] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    gstin: '', 
    dlNumber: '',
    buyerStateCode: '' // NEW
  });

  const [invoiceDetails, setInvoiceDetails] = useState({
    dueDate: '',
    refNo: '',
    poNo: '',
    challanNo: '',
    discount: '', 
    noteType: 'thank_you',
    noteCustom: ''
  });

  const [isPostSaleModalOpen, setPostSaleModalOpen] = useState(false);

  // --- *** MODIFIED: useMemo now depends on buyerStateCode *** ---
  const checkoutTotals = useMemo(
    () => calculateTotals(checkoutCart, invoiceDetails.discount, customerDetails.buyerStateCode),
    [checkoutCart, invoiceDetails.discount, customerDetails.buyerStateCode]
  );

  const handleCustomerDetailsChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleInvoiceDetailsChange = (name, value) => {
    if (value && value.target) {
      const { name: targetName, value: targetValue } = value.target;
      setInvoiceDetails(prev => ({ ...prev, [targetName]: targetValue }));
    } else {
      setInvoiceDetails(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // --- *** NEW: Free Quantity Handler *** ---
  const handleSetFreeQuantity = (batchId, freeQty) => {
    const freeQuantity = parseInt(freeQty, 10) || 0;
    if (freeQuantity < 0) return;
    
    setCheckoutCart(prev => prev.map(item =>
        item.batchId === batchId ? { ...item, freeQuantity } : item
    ));
  };


  // --- Discard Pending Medicine ---
  const handleDiscardPendingMedicine = () => {
    if (pendingMedicineForRestock) {
      const pendingMedId = pendingMedicineForRestock.id;
      setRestockCart(prev => prev.filter(item => item.medicineId !== pendingMedId));
      setPendingMedicineForRestock(null);
      alert("Staged medicine discarded.");
    }
  };


  // --- Add/Update/Delete Medicine Functions ---
  const handleAddNewMedicine = (medicineData, batchesData) => {
    const newBatches = batchesData.map(batch => ({
      id: batch.batchNumber.trim(), exp: batch.expiryDate,
      stock: parseInt(batch.initialQuantity, 10) || 0,
      price: parseFloat(batch.sellingPrice) || 0,
      purchasePrice: parseFloat(batch.purchasePrice) || 0,
      mrp: parseFloat(batch.mrp) || 0,
      gstRate: batch.gstRate ? batch.gstRate.trim() : '',
      isNew: false,
    }));
    const newId = Date.now();
    const newMedicineObject = {
      ...medicineData, id: newId, batches: newBatches, status: 'active', 
      metadataHistory: [{ type: 'add', fieldName: 'Medicine Record', newValue: medicineData.brandName, timestamp: new Date().toISOString() }],
    };
    setPendingMedicineForRestock(newMedicineObject);
    if (newBatches.length > 0) {
       const itemsToAdd = newBatches.map(batch => ({
            medicineId: newMedicineObject.id, brandName: newMedicineObject.brandName,
            medicineName: newMedicineObject.medicineName, batchId: batch.id,
            batchNumber: batch.id, expiryDate: batch.exp,
            quantity: batch.stock, purchasePrice: batch.purchasePrice,
            sellingPrice: batch.price, mrp: batch.mrp, gstRate: batch.gstRate,
            isNew: true,
       }));
       setRestockCart(prev => [...prev, ...itemsToAdd]);
    }
    navigate('/restock');
  };

  const handleUpdateMedicine = (updatedMedicineData, metadataHistory) => {
    const medicineId = updatedMedicineData.id;
    const stagedChanges = stagedBatchChanges[medicineId];
    let combinedHistory = [];
    const newTransactions = [];
    if (stagedChanges) {
        const isFinancialUpdate = stagedChanges.billSummary.total !== 0;
        const hasHistory = stagedChanges.history.length > 0;
        if (hasHistory) {
            if (isFinancialUpdate) {
                newTransactions.push({ invoice: `#SUP-${Date.now().toString().slice(-5)}`, customer: `Batch Price/Restock Update: ${updatedMedicineData.brandName}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), amount: `- ₹${stagedChanges.billSummary.total.toFixed(2)}`, status: 'Paid', });
            } else {
                 newTransactions.push({ invoice: `#BAT-${Date.now().toString().slice(-5)}`, customer: `Batch Admin Change: ${updatedMedicineData.brandName}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), amount: `0.00`, status: 'Pending', });
            }
            combinedHistory.push(...stagedChanges.history);
        }
        updatedMedicineData = { ...updatedMedicineData, batches: stagedChanges.batches.map(b => ({ ...b, isNew: false })), };
        setStagedBatchChanges(prev => { const newState = { ...prev }; delete newState[medicineId]; return newState; });
    }
    if (metadataHistory && metadataHistory.length > 0) {
        newTransactions.push({ invoice: `#MED-${Date.now().toString().slice(-5)}`, customer: `Metadata Update: ${updatedMedicineData.brandName}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), amount: `0.00`, status: 'Pending', });
        combinedHistory.push(...metadataHistory.map(log => ({ ...log, field: `Metadata: ${log.fieldName}` })));
    }
    updatedMedicineData = { ...updatedMedicineData, metadataHistory: combinedHistory, };
    setMedicines(prevMedicines => prevMedicines.map(med => med.id === medicineId ? updatedMedicineData : med));
    if (newTransactions.length > 0) { setTransactions(prev => [...newTransactions, ...prev]); }
  };

  const handleDeleteMedicine = (medicineToDelete) => {
      const deletionTime = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const logTransaction = { invoice: `#DEL-${Date.now().toString().slice(-5)}`, customer: `Medicine Deleted: ${medicineToDelete.brandName}`, date: deletionTime, amount: `0.00`, status: 'Deleted', };
      setTransactions(prev => [logTransaction, ...prev]);
      setMedicines(prev => prev.filter(med => med.id !== medicineToDelete.id));
  };

  const handleStageBatchUpdate = (medicineId, updatedBatches, billSummary, batchHistory) => {
     setMedicines(prevMedicines => prevMedicines.map(med => med.id === medicineId ? { ...med, batches: updatedBatches } : med));
     setStagedBatchChanges(prev => ({ ...prev, [medicineId]: { batches: updatedBatches, billSummary, history: batchHistory, } }));
  };
  const handleCancelBatchStaging = (medicineId) => {
    setMedicines(prevMeds => prevMeds.map(med => { if(med.id === medicineId) { const originalMed = initialMedicines.find(m => m.id === medicineId); if (originalMed) { return { ...med, batches: JSON.parse(JSON.stringify(originalMed.batches)) }; } } return med; }));
    setStagedBatchChanges(prev => { const newState = { ...prev }; delete newState[medicineId]; return newState; });
  };

  const handleAddNewBatch = (medicineId, newBatchData) => {
    const batchToAdd = {
      id: newBatchData.id.trim(), exp: newBatchData.exp,
      stock: parseInt(newBatchData.stock, 10) || 0,
      price: parseFloat(newBatchData.price) || 0,
      purchasePrice: parseFloat(newBatchData.purchasePrice) || 0,
      mrp: parseFloat(newBatchData.price) || 0, gstRate: '', isNew: true
    };
    let batchExists = false;
    setMedicines(prev => prev.map(med => {
        if (med.id === medicineId) {
            if (med.batches.some(b => b.id === batchToAdd.id)) {
                batchExists = true;
                alert(`Batch ID "${batchToAdd.id}" already exists.`);
                return med;
            }
            return { ...med, batches: [...med.batches, batchToAdd] };
        }
        return med;
    }));
    if (!batchExists) { console.log(`Batch ${batchToAdd.id} added to inventory.`); }
  };

  const handleRemoveBatch = (medicineId, batchId) => {
    const cartItem = restockCart.find(item => 
        item.medicineId === medicineId && 
        item.batchId === batchId && 
        item.isNew
    );
    
    if (cartItem) {
        setRestockCart(prev => prev.filter(item => !(item.medicineId === medicineId && item.batchId === batchId)));
        console.log(`Removed new batch ${batchId} from restock cart.`);
        return;
    }

    const medicine = medicines.find(med => med.id === medicineId) || (pendingMedicineForRestock?.id === medicineId ? pendingMedicineForRestock : null);
    if (!medicine) {
        console.warn(`Cannot find medicine ${medicineId} to remove batch.`);
        return;
    }
    setRestockCart(prev => prev.filter(item => !(item.medicineId === medicineId && item.batchId === batchId)));
    if (pendingMedicineForRestock && pendingMedicineForRestock.id === medicineId) {
        setPendingMedicineForRestock(prevMed => ({
            ...prevMed,
            batches: prevMed.batches.filter(b => b.id !== batchId)
        }));
    } else {
        setMedicines(prev => prev.map(med => med.id === medicineId ? { ...med, batches: med.batches.filter(b => b.id !== batchId) } : med));
    }
    console.log(`Removed batch ${batchId} from medicine ${medicineId}`);
  };

  // --- *** MODIFIED: handleCartUpdate to save HSN, PackSize, and Free Quantity *** ---
  const handleCartUpdate = (medicine, batch, change, mode) => {
    const isRestock = mode === 'restock';
    const cart = isRestock ? restockCart : checkoutCart;
    const setCart = isRestock ? setRestockCart : setCheckoutCart;

    const existingItem = cart.find(item => item.batchId === batch.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + change;
    
    const availableStock = parseInt(batch.stock, 10) || 0;

    if (!isRestock && !batch.isNew && newQuantity > availableStock) {
        console.warn(`Only ${availableStock} in stock.`);
        return;
    }
    if (newQuantity < 0) return;

    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.batchId !== batch.id));
    } else if (existingItem) {
      setCart(prev => prev.map(item =>
        item.batchId === batch.id ? { ...item, quantity: newQuantity } : item
      ));
    } else if (change > 0) {
      if (!isRestock && cart.length === 0) {
        const timestamp = Date.now().toString().slice(-5);
        setInvoiceDetails(prev => ({ 
          ...prev, 
          refNo: `REF-${timestamp}`,
          challanNo: `CH-${timestamp}`,
          poNo: `POW-${timestamp}` // Default PO for Walk-in
        }));
      }

      setCart(prev => [...prev, {
        medicineId: medicine.id, medicineName: medicine.medicineName, brandName: medicine.brandName,
        batchId: batch.id,
        price: parseFloat(batch.price) || 0,
        purchasePrice: parseFloat(batch.purchasePrice) || 0,
        quantity: newQuantity,
        expiryDate: batch.exp,
        mrp: parseFloat(batch.mrp || batch.price) || 0,
        gstRate: batch.gstRate || '',
        hsnCode: medicine.hsnCode || '',
        isNew: batch.isNew || false,
        packSize: medicine.packSize || '', // *** NEW: Pack Size ***
        freeQuantity: 0, // *** NEW: Free Quantity ***
      }]);
    }
  };
  
  // --- *** MODIFIED: handleSetCartQuantity to save HSN, PackSize, and Free Quantity *** ---
  const handleSetCartQuantity = (medicine, batch, newQuantityString, mode) => {
    const isRestock = mode === 'restock';
    const cart = isRestock ? restockCart : checkoutCart;
    const setCart = isRestock ? setRestockCart : setCheckoutCart;

    let newQuantity = parseInt(newQuantityString, 10);
    
    if (isNaN(newQuantity)) {
        newQuantity = 0;
    }

    const availableStock = parseInt(batch.stock, 10) || 0;

    if (!isRestock && !batch.isNew && newQuantity > availableStock) {
        newQuantity = availableStock;
    }
    
    if (newQuantity < 0) {
        newQuantity = 0;
    }

    const existingItem = cart.find(item => item.batchId === batch.id);

    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.batchId !== batch.id));
    } else if (existingItem) {
      setCart(prev => prev.map(item =>
        item.batchId === batch.id ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      if (!isRestock && cart.length === 0) {
        const timestamp = Date.now().toString().slice(-5);
        setInvoiceDetails(prev => ({ 
          ...prev, 
          refNo: `REF-${timestamp}`,
          challanNo: `CH-${timestamp}`,
          poNo: `POW-${timestamp}` // Default PO for Walk-in
        }));
      }

      setCart(prev => [...prev, {
        medicineId: medicine.id, medicineName: medicine.medicineName, brandName: medicine.brandName,
        batchId: batch.id,
        price: parseFloat(batch.price) || 0,
        purchasePrice: parseFloat(batch.purchasePrice) || 0,
        quantity: newQuantity,
        expiryDate: batch.exp,
        mrp: parseFloat(batch.mrp || batch.price) || 0,
        gstRate: batch.gstRate || '',
        hsnCode: medicine.hsnCode || '',
        isNew: batch.isNew || false,
        packSize: medicine.packSize || '', // *** NEW: Pack Size ***
        freeQuantity: 0, // *** NEW: Free Quantity ***
      }]);
    }
  };

  const handleRestockModalSave = (medicine, batchDataFromModal) => {
    const batchId = batchDataFromModal.batchNumber.trim();
    if (!batchId) {
        alert("Batch Number is required.");
        return;
    }
    const quantityToCart = parseInt(batchDataFromModal.quantity, 10) || 0;
    if (quantityToCart <= 0) {
        alert("Quantity to add must be greater than 0.");
        return;
    }

    const existingItemIndex = restockCart.findIndex(item => item.batchId === batchId);
    
    const cartItemData = {
        medicineId: medicine.id,
        brandName: medicine.brandName,
        medicineName: medicine.medicineName,
        batchId: batchId,
        batchNumber: batchId,
        expiryDate: batchDataFromModal.expiryDate,
        quantity: quantityToCart,
        purchasePrice: parseFloat(batchDataFromModal.purchasePrice) || 0,
        sellingPrice: parseFloat(batchDataFromModal.sellingPrice) || 0,
        mrp: parseFloat(batchDataFromModal.mrp) || 0,
        gstRate: batchDataFromModal.gstRate ? batchDataFromModal.gstRate.trim() : '',
        hsnCode: medicine.hsnCode || '',
        isNew: true 
    };
    
    if (existingItemIndex > -1) {
      setRestockCart(prev => prev.map((item, index) => {
        if (index === existingItemIndex) {
          const oldQuantity = parseInt(item.quantity, 10) || 0;
          const newTotalQuantity = oldQuantity + quantityToCart;
          
          return {
            ...cartItemData,
            quantity: newTotalQuantity
          };
        }
        return item;
      }));
    } else {
      setRestockCart(prev => [...prev, cartItemData]);
    }
    
    console.log("Restock cart updated.");
  };

  const handleRemoveFromCart = (setCart, medicineId, batchId) => {
    setCart(prev => prev.filter(item => !(item.medicineId === medicineId && item.batchId === batchId)));
    
    let batchWasNew = false;
    if (pendingMedicineForRestock && pendingMedicineForRestock.id === medicineId) {
        const batch = pendingMedicineForRestock.batches.find(b => b.id === batchId);
        if (batch) { 
            batchWasNew = true;
            setPendingMedicineForRestock(prevMed => ({
                ...prevMed,
                batches: prevMed.batches.filter(b => b.id !== batchId)
            }));
        }
    } 
    if (batchWasNew) {
        console.log(`Removed new batch ${batchId} from pending medicine and cart.`);
    }
  };

  // --- Post-Sale Modal Handlers ---
  const handleOpenPostSaleModal = () => {
    if (checkoutCart.length === 0) { 
      alert("Checkout cart is empty."); 
      return; 
    }
    setPostSaleModalOpen(true);
  };

  const handleClosePostSaleModal = () => {
    setPostSaleModalOpen(false);
  };
  
  const _processSale = (cartToProcess, customerName, totals) => {
    const newTransaction = { 
        invoice: `#INV-${Date.now().toString().slice(-5)}`, 
        customer: customerName,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
        amount: `₹${totals.finalTotal.toFixed(2)}`,
        status: 'Paid', 
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    setMedicines(prevMeds => { 
        const medsCopy = JSON.parse(JSON.stringify(prevMeds)); 
        cartToProcess.forEach(cartItem => { 
            const med = medsCopy.find(m => m.id === cartItem.medicineId); 
            if (med) { 
                const batch = med.batches.find(b => b.id === cartItem.batchId); 
                if (batch) { 
                    // Stock is reduced by the quantity - NOT the free quantity
                    batch.stock = Math.max(0, (parseInt(batch.stock, 10) || 0) - cartItem.quantity); 
                } 
            } 
        }); 
        return medsCopy; 
    });
    
    return { newTransaction, totals };
  };
  
  
  const handleConfirmSaleAndRestock = (restockQuantities) => {
    const customerName = customerDetails.name.trim() || 'Walk-in Customer';

    const { newTransaction, totals } = _processSale(checkoutCart, customerName, checkoutTotals);

    const itemsToRestock = [];
    checkoutCart.forEach(cartItem => {
        const restockQty = restockQuantities[cartItem.batchId] || 0;
        if (restockQty > 0) {
            const medicine = medicines.find(m => m.id === cartItem.medicineId);
            const batch = medicine?.batches.find(b => b.id === cartItem.batchId);
            
            if (medicine && batch) {
                 itemsToRestock.push({
                    medicineId: medicine.id,
                    medicineName: medicine.medicineName,
                    brandName: medicine.brandName,
                    batchId: batch.id,
                    price: parseFloat(batch.price) || 0,
                    purchasePrice: parseFloat(batch.purchasePrice) || 0,
                    quantity: restockQty,
                    expiryDate: batch.exp,
                    mrp: parseFloat(batch.mrp || batch.price) || 0,
                    gstRate: batch.gstRate || '',
                    hsnCode: medicine.hsnCode || '',
                    packSize: medicine.packSize || '', // NEW
                });
            }
        }
    });
    
    if (itemsToRestock.length > 0) {
      setRestockCart(prevCart => {
        const newCart = [...prevCart];
        itemsToRestock.forEach(itemToAdd => {
            const existingItemIndex = newCart.findIndex(
                item => item.batchId === itemToAdd.batchId
            );
            if (existingItemIndex > -1) {
                const oldQuantity = parseInt(newCart[existingItemIndex].quantity, 10) || 0;
                const newQuantity = parseInt(itemToAdd.quantity, 10) || 0;
                newCart[existingItemIndex].quantity = oldQuantity + newQuantity;
            } else {
                newCart.push(itemToAdd);
            }
        });
        return newCart;
      });
    }
    
    generateInvoicePDF(customerDetails, checkoutCart, newTransaction, totals, invoiceDetails);
    
    setCheckoutCart([]);
    setCustomerDetails({ name: '', phone: '', address: '', gstin: '', dlNumber: '', buyerStateCode: '' });
    setInvoiceDetails({ dueDate: '', refNo: '', poNo: '', challanNo: '', discount: '', noteType: 'thank_you', noteCustom: '' });
    
    handleClosePostSaleModal();
    alert(`Checkout successful! ${itemsToRestock.length > 0 ? 'Items added to restock list.' : ''}`);
  };

  const handleRestockTransaction = (cartToProcess) => {
    if (cartToProcess.length === 0 && !pendingMedicineForRestock) {
        alert("Restock cart is empty and no new medicine staged.");
        return;
    }

    let finalMedicinesState = [...medicines];
    let medicineAdded = false;
    let addedMedicineCost = 0;

    if (pendingMedicineForRestock) {
        if (!finalMedicinesState.some(med => med.id === pendingMedicineForRestock.id)) {
            finalMedicinesState = [pendingMedicineForRestock, ...finalMedicinesState];
            medicineAdded = true;
            addedMedicineCost = pendingMedicineForRestock.batches.reduce((sum, batch) => sum + (batch.purchasePrice * batch.stock), 0);
            const addTransaction = { invoice: `#ADD-${pendingMedicineForRestock.id.toString().slice(-5)}`, customer: `New Medicine Added: ${pendingMedicineForRestock.brandName}`, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), amount: `₹${addedMedicineCost.toFixed(2)}`, status: 'Paid', };
             setTransactions(prev => [addTransaction, ...prev]);
        } else { console.warn(`Attempted to finalize medicine ID ${pendingMedicineForRestock.id}, but it already exists.`); }
        setPendingMedicineForRestock(null);
    }

    const cartPurchaseCost = cartToProcess.reduce((sum, item) => {
      if (medicineAdded && item.medicineId === finalMedicinesState[0].id) { return sum; }
      return sum + (item.purchasePrice || 0) * (item.quantity || 0);
    }, 0);

    if (cartPurchaseCost > 0) {
        const supTransaction = { invoice: `#SUP-${Date.now().toString().slice(-5)}`, customer: 'Supplier Purchase', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), amount: `- ₹${cartPurchaseCost.toFixed(2)}`, status: 'Paid', };
        setTransactions(prev => [supTransaction, ...prev]);
    }

    setMedicines(() => {
        const medsCopy = JSON.parse(JSON.stringify(finalMedicinesState));
        cartToProcess.forEach(cartItem => {
            const med = medsCopy.find(m => m.id === cartItem.medicineId);
            if (med) {
                const batchIndex = med.batches.findIndex(b => b.id === cartItem.batchId);
                const quantityToAdd = parseInt(cartItem.quantity, 10) || 0;

                if (batchIndex > -1) {
                    const currentStock = parseInt(med.batches[batchIndex].stock, 10) || 0;
                    med.batches[batchIndex].stock = currentStock + quantityToAdd;
                    med.batches[batchIndex].isNew = false; 
                    
                    if (cartItem.expiryDate) med.batches[batchIndex].exp = cartItem.expiryDate;
                    if (cartItem.purchasePrice) med.batches[batchIndex].purchasePrice = cartItem.purchasePrice;
                    if (cartItem.sellingPrice) med.batches[batchIndex].price = cartItem.sellingPrice;
                    if (cartItem.mrp) med.batches[batchIndex].mrp = cartItem.mrp;
                    if (cartItem.gstRate) med.batches[batchIndex].gstRate = cartItem.gstRate;

                } else if (cartItem.isNew) {
                    const newBatch = {
                      id: cartItem.batchId,
                      exp: cartItem.expiryDate,
                      stock: quantityToAdd,
                      price: cartItem.sellingPrice,
                      purchasePrice: cartItem.purchasePrice,
                      mrp: cartItem.mrp,
                      gstRate: cartItem.gstRate,
                      isNew: false
                    };
                    med.batches.push(newBatch);
                } else {
                    console.error(`CRITICAL: Batch ${cartItem.batchId} was in cart but not found in medicine ${med.brandName} during transaction.`);
                }
            } else { console.warn(`Medicine ${cartItem.medicineId} not found (Restock).`); }
        });
        return medsCopy;
    });

    setRestockCart([]);
    alert(`Restock successful! ${medicineAdded ? 'New medicine is now active.' : ''}`);
  };


  // --- JSX Structure (Routes) ---
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<MainContentWrapper><Dashboard transactions={transactions} /></MainContentWrapper>} />
          <Route
            path="/inventory"
            element={<Inventory
                allMedicines={medicines.filter(m => m.status !== 'pending')}
                onAddNewBatch={handleAddNewBatch}
                onRemoveBatch={handleRemoveBatch}
                onDeleteMedicine={handleDeleteMedicine}
            />}
          />
          <Route path="/transactions" element={<TransactionHistory transactions={transactions} />} />
          <Route path="/add-medicine" element={<MainContentWrapper><NewMedicinePage onAddNewMedicine={handleAddNewMedicine} /></MainContentWrapper>} />
          <Route
            path="/inventory/edit/:id"
            element={<MainContentWrapper> <EditMedicinePage allMedicines={medicines.filter(m => m.status !== 'pending')} onUpdateMedicine={handleUpdateMedicine} stagedBatchChanges={stagedBatchChanges} onCancelStaging={handleCancelBatchStaging}/> </MainContentWrapper>}
          />
          <Route
            path="/inventory/edit/:id/batches"
            element={<MainContentWrapper> <EditBatchesPage allMedicines={medicines.filter(m => m.status !== 'pending')} onUpdateMedicine={handleUpdateMedicine} stagedBatchChanges={stagedBatchChanges} onCancelStaging={handleCancelBatchStaging}/> </MainContentWrapper>}
          />

          <Route
            path="/restock"
            element={<TransactionPage
                mode="restock"
                allMedicines={pendingMedicineForRestock ? [pendingMedicineForRestock, ...medicines.filter(m => m.status !== 'pending')] : medicines.filter(m => m.status !== 'pending')}
                pendingMedicine={pendingMedicineForRestock}
                cart={restockCart}
                onCartUpdate={handleCartUpdate}
                onSetCartQuantity={handleSetCartQuantity}
                onModalSave={handleRestockModalSave}
                onRemoveFromCart={(medId, batchId) => handleRemoveFromCart(setRestockCart, medId, batchId)}
                onClearCart={() => setRestockCart([])}
                onTransaction={() => handleRestockTransaction(restockCart)}
                onRemoveBatch={handleRemoveBatch}
                onDiscardPending={handleDiscardPendingMedicine}
              />}
          />

          <Route
            path="/checkout"
            element={<TransactionPage
                mode="checkout"
                allMedicines={medicines.filter(m => m.status !== 'pending')}
                cart={checkoutCart}
                onCartUpdate={handleCartUpdate}
                onSetCartQuantity={handleSetCartQuantity}
                onRemoveFromCart={(medId, batchId) => handleRemoveFromCart(setCheckoutCart, medId, batchId)}
                onClearCart={() => {
                    setCheckoutCart([]);
                    setCustomerDetails({ name: '', phone: '', address: '', gstin: '', dlNumber: '', buyerStateCode: '' });
                    setInvoiceDetails({ dueDate: '', refNo: '', poNo: '', challanNo: '', discount: '', noteType: 'thank_you', noteCustom: '' });
                }}
                
                onTransaction={handleOpenPostSaleModal}
                isPostSaleModalOpen={isPostSaleModalOpen}
                onClosePostSaleModal={handleClosePostSaleModal}
                onConfirm={handleConfirmSaleAndRestock}
                
                customerDetails={customerDetails}
                onCustomerDetailsChange={handleCustomerDetailsChange}
                
                invoiceDetails={invoiceDetails}
                onInvoiceDetailsChange={handleInvoiceDetailsChange}

                checkoutTotals={checkoutTotals}
              />}
          />
        </Routes>
      </div>
    </div>
  );
}

// MainContentWrapper (Renders Header and main content area)
const MainContentWrapper = ({ children }) => {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </>
  );
};

export default App;