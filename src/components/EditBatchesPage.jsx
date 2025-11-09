import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiMenu, FiArrowLeft, FiSave } from 'react-icons/fi';

// Utility function to deep clone an object
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export default function EditBatchesPage({ allMedicines, onStageBatchUpdate }) {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // State for medicine data and batches
    const [medicine, setMedicine] = useState(null);
    const [originalBatches, setOriginalBatches] = useState([]);
    const [editedBatches, setEditedBatches] = useState([]);
    
    // State for tracking unsaved status for navigation protection
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // --- Data Loading and Initialization (omitted for brevity) ---
    useEffect(() => {
        const medToEdit = allMedicines.find(m => m.id.toString() === id);
        if (medToEdit) {
            setMedicine(medToEdit);
            const clonedBatches = deepClone(medToEdit.batches);
            setOriginalBatches(clonedBatches);
            setEditedBatches(clonedBatches);
            setHasUnsavedChanges(false);
        }
    }, [allMedicines, id]);

    // --- Navigation Protection (omitted for brevity) ---
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = ''; 
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    // --- FINAL CHANGE HISTORY (omitted for brevity) ---
    const finalBatchHistory = useMemo(() => {
        const history = [];

        const originalBatchMap = originalBatches.reduce((map, b) => ({ ...map, [b.id]: b }), {});
        const currentBatchIds = new Set(editedBatches.map(b => b.id));
        
        originalBatches.forEach(originalBatch => {
            if (!currentBatchIds.has(originalBatch.id)) {
                 history.push({
                    type: 'delete',
                    batchId: originalBatch.id,
                    field: 'Batch',
                    previousValue: originalBatch.id,
                    updatedValue: 'N/A',
                    timestamp: new Date().toISOString(),
                });
            }
        });

        editedBatches.forEach(editedBatch => {
            const originalBatch = originalBatchMap[editedBatch.id];
            
            if (!originalBatch) {
                history.push({
                    type: 'add',
                    batchId: editedBatch.id,
                    field: 'Batch',
                    previousValue: 'N/A',
                    updatedValue: 'New Batch Added',
                    timestamp: new Date().toISOString(),
                });
                return;
            }

            for (const key of Object.keys(originalBatch)) {
                if (['isNew'].includes(key)) continue;

                // For history calculation, we rely on the difference between TRIMMED values
                const oldValue = String(originalBatch[key]).trim();
                const newValue = String(editedBatch[key]).trim();
                
                if (oldValue !== newValue) {
                     history.push({
                        type: 'edit',
                        batchId: editedBatch.id,
                        field: key,
                        previousValue: originalBatch[key],
                        updatedValue: editedBatch[key],
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        });

        return history;
    }, [editedBatches, originalBatches]);

    useEffect(() => {
        setHasUnsavedChanges(finalBatchHistory.length > 0);
    }, [finalBatchHistory.length]);


    // --- BILL SUMMARY CALCULATION (omitted for brevity) ---
    const billSummary = useMemo(() => {
        let costDifference = 0;
        let totalGST = 0;

        editedBatches.forEach(editedBatch => {
            const originalBatch = originalBatches.find(b => b.id === editedBatch.id && !editedBatch.isNew);

            const editedPurchasePrice = parseFloat(editedBatch.purchasePrice) || 0;
            const editedStock = parseInt(editedBatch.stock, 10) || 0;
            const gstRate = parseFloat(editedBatch.gstRate) || 0;


            if (!originalBatch) {
                const subtotalCost = editedPurchasePrice * editedStock;
                costDifference += subtotalCost;
                totalGST += (subtotalCost * gstRate) / 100;
            } else {
                const originalStock = parseInt(originalBatch.stock, 10) || 0;
                const originalPurchasePrice = parseFloat(originalBatch.purchasePrice) || 0;
                
                const stockIncrease = editedStock - originalStock;
                const priceChange = editedPurchasePrice - originalPurchasePrice;
                
                let netChangeCost = 0;

                if (stockIncrease > 0) {
                    netChangeCost += stockIncrease * editedPurchasePrice;
                }
                
                if (priceChange !== 0) {
                    netChangeCost += originalStock * priceChange;
                }
                
                costDifference += netChangeCost;
                totalGST += (netChangeCost * gstRate) / 100;
            }
        });

        const total = costDifference + totalGST;
        return { subtotal: costDifference, gst: totalGST, total };

    }, [editedBatches, originalBatches]);

    // --- Handlers ---
    // FIX: Store the raw value without trimming in state (allows spaces while typing)
    const handleBatchChange = (index, e) => {
        const { name, value } = e.target;
        
        const processedValue = value;

        setEditedBatches(prevBatches => 
            prevBatches.map((batch, i) => {
                if (i === index) {
                    return { ...batch, [name]: processedValue }; 
                }
                return batch;
            })
        );
    };

    const handleAddBatch = () => {
        const newBatchId = `NEW-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const newBatch = {
            id: newBatchId, exp: '', stock: 0, price: 0, purchasePrice: 0, mrp: 0, gstRate: '', isNew: true 
        };
        setEditedBatches(prev => [...prev, newBatch]);
    };

    const handleRemoveBatch = (index) => {
        const batchToRemove = editedBatches[index];
        
        if (window.confirm(`Are you sure you want to permanently remove batch ${batchToRemove.id}? This will be removed upon saving.`)) {
            setEditedBatches(prevBatches => prevBatches.filter((_, i) => i !== index));
        }
    };
    
    const handleNavigateBack = () => {
        const targetRoute = `/inventory/edit/${medicine.id}`;
        if (hasUnsavedChanges) {
            if (window.confirm("You have unsaved changes. Are you sure you want to leave this page? Changes will be lost.")) {
                navigate(targetRoute);
            }
        } else {
            navigate(targetRoute);
        }
    };

    const handleSave = () => {
        // --- Validation Steps: CHECK for whitespace-only strings ---
        const allBatchIds = editedBatches.map(b => b.id).filter(Boolean);
        const uniqueBatchIds = new Set(allBatchIds);
        if (allBatchIds.length !== uniqueBatchIds.size) { alert("Validation Error: Duplicate Batch IDs detected."); return; }

        const requiredFields = ['id', 'exp', 'stock', 'price', 'purchasePrice', 'mrp'];
        
        // Validation checks against the TRIMMED value
        for (const batch of editedBatches) {
            for (const field of requiredFields) {
                const value = batch[field];
                if (value === undefined || value === null || String(value).trim() === '') {
                    alert(`Validation Error: Please fill the required field "${field}" for batch: ${batch.id}`);
                    return;
                }
            }
            const numFields = { stock: 'whole number', price: 'non-negative number', purchasePrice: 'non-negative number', mrp: 'non-negative number' };
            for (const field in numFields) {
                const numValue = parseFloat(batch[field]);
                if (isNaN(numValue) || numValue < 0) { alert(`Validation Error: "${field}" for batch ${batch.id} must be a valid non-negative number.`); return; }
                if (field === 'stock' && parseInt(batch.stock, 10) !== parseFloat(batch.stock)) { alert(`Validation Error: "Stock Quantity" for batch ${batch.id} must be a whole number.`); return; }
            }
        }
        
        // --- Save logic (STAGING) ---
        
        // FIX: Trim all string fields BEFORE staging (e.g., ID, GST)
        const finalBatchesToStage = editedBatches.map(batch => ({
            ...batch,
            id: batch.id.trim(),
            gstRate: batch.gstRate ? batch.gstRate.trim() : '',
        }));

        onStageBatchUpdate(medicine.id, finalBatchesToStage, billSummary, finalBatchHistory);

        const targetRoute = `/inventory/edit/${medicine.id}`;
        navigate(targetRoute); 
    };

    if (!medicine) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex gap-8">
            <div className="flex-1 space-y-6">
                
                {/* Header with Back Button (omitted for brevity) */}
                <div className="flex items-center space-x-4">
                    <button onClick={handleNavigateBack} title="Back to Details" className="text-gray-600 hover:text-blue-600">
                        <FiArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Edit Batches & Price</h1>
                        <h2 className="text-2xl font-semibold text-gray-700">{medicine.brandName} - <span className="font-normal">{medicine.saltComposition}</span></h2>
                    </div>
                </div>

                {editedBatches.map((batch, index) => (
                    <div key={batch.id} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-700">Edit Batch No {index + 1}</h3>
                            <div className="flex items-center gap-2">
                                {editedBatches.length > 1 && (
                                    <button onClick={() => handleRemoveBatch(index)} title="Remove Batch">
                                        <FiTrash2 className="text-red-500 hover:text-red-700"/>
                                    </button>
                                )}
                                <FiMenu className="text-gray-400 cursor-grab" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium">Batch No</label>
                                <input 
                                    type="text" 
                                    name="id" 
                                    value={batch.id} 
                                    onChange={(e) => handleBatchChange(index, e)} 
                                    className={`mt-1 block w-full border p-2 rounded ${batch.isNew ? '' : 'bg-gray-100'}`} 
                                    placeholder="e.g., BT2345" 
                                    readOnly={!batch.isNew} 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Expire Date</label>
                                <input 
                                    type="date" 
                                    name="exp" 
                                    value={batch.exp} 
                                    onChange={(e) => handleBatchChange(index, e)} 
                                    className="mt-1 block w-full border p-2 rounded" 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Stock Quantity</label>
                                <input 
                                    type="number" 
                                    name="stock" 
                                    value={batch.stock} 
                                    onChange={(e) => handleBatchChange(index, e)} 
                                    className="mt-1 block w-full border p-2 rounded" 
                                    placeholder="e.g., 100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Selling Price</label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={batch.price} 
                                    onChange={(e) => handleBatchChange(index, e)} 
                                    className="mt-1 block w-full border p-2 rounded" 
                                    placeholder="e.g., 95.00"
                                    required
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Purchase Price</label>
                                <input 
                                    type="number" 
                                    name="purchasePrice" 
                                    value={batch.purchasePrice} 
                                    onChange={(e) => handleBatchChange(index, e)} 
                                    className="mt-1 block w-full border p-2 rounded" 
                                    placeholder="e.g., 75.00"
                                    required
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">MRP</label>
                                <input 
                                    type="number" 
                                    name="mrp" 
                                    value={batch.mrp}
                                    onChange={(e) => handleBatchChange(index, e)} 
                                    className="mt-1 block w-full border p-2 rounded" 
                                    placeholder="e.g., 100.00"
                                    required
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">GST Rate (%)</label>
                                <input 
                                    type="text" 
                                    name="gstRate" 
                                    value={batch.gstRate || ''} 
                                    onChange={(e) => handleBatchChange(index, e)} 
                                    className="mt-1 block w-full border p-2 rounded" 
                                    placeholder="e.g., 12 or 5%"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                
                <button 
                    type="button" 
                    onClick={handleAddBatch} 
                    className="w-full flex justify-center items-center p-4 bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100"
                >
                    <FiPlus className="mr-2"/> Add Another Batch
                </button>

                {/* --- History Log Display (omitted for brevity) --- */}
                {finalBatchHistory.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Final Changes to Commit ({finalBatchHistory.length})</h3>
                        <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
                            {finalBatchHistory.slice().reverse().map((log, i) => (
                                <li key={i} className={`p-3 bg-gray-50 rounded border-l-4 ${log.type === 'delete' ? 'border-red-400' : log.type === 'add' ? 'border-green-400' : 'border-yellow-400'}`}>
                                    <span className="font-bold text-gray-800">{log.type.toUpperCase()}</span> on Batch: {log.batchId} 
                                    {log.type === 'edit' && (
                                        <>
                                            , Field: <span className="font-semibold">{log.field}</span>.
                                            <br/> 
                                            <span className="text-red-500">Old: {String(log.previousValue) || 'N/A'}</span> 
                                            {' -> '}
                                            <span className="text-green-500">New: {String(log.updatedValue) || 'N/A'}</span>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* --- Bill Summary Side (omitted for brevity) --- */}
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-4">Bill Summary</h2>
                    <p className="text-sm text-gray-500 mb-4">GST is calculated per batch based on its rate. Only changes resulting in a net cost increase are billed.</p>
                    <div className="space-y-2 text-gray-700 mb-6">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-semibold">₹{billSummary.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total GST:</span>
                            <span className="font-semibold">₹{billSummary.gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-black mt-2">
                            <span>Total:</span>
                            <span>₹{billSummary.total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button 
                            onClick={handleSave} 
                            disabled={!hasUnsavedChanges} 
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center disabled:bg-gray-400"
                        >
                            <FiSave className="mr-2" /> Save & Return to Edit
                        </button>
                        <button 
                            onClick={handleNavigateBack} 
                            className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                        >
                            Back to Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}