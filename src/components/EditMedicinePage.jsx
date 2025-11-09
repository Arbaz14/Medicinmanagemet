import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { FiHelpCircle, FiChevronDown, FiEdit3, FiArrowLeft, FiX, FiClock } from 'react-icons/fi';
import Notification from './Notification'; // Import the new component

// Utility function to deep clone an object
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// --- (Constants and Helper Components - Omitted for brevity) ---
const FORM_OPTIONS = [
    { value: "Tablet", label: "Tablet" }, { value: "Capsule", label: "Capsule" }, { value: "Syrup", label: "Syrup" },
    { value: "Injection", label: "Injection" }, { value: "Ointment", label: "Ointment" }, { value: "Cream", label: "Cream" },
    { value: "Gel", label: "Gel" }, { value: "Drops", label: "Drops" }, { value: "Powder", label: "Powder" },
    { value: "Inhaler", label: "Inhaler" }, { value: "Suspension", label: "Suspension" }, { value: "Lotion", label: "Lotion" },
    { value: "Suppository", label: "Suppository" }, { value: "Other", label: "Other..." }
];
const CATEGORY_OPTIONS = [
    { value: "Analgesic", label: "Analgesic (Painkiller)" }, { value: "Antibiotic", label: "Antibiotic" },
    { value: "Antipyretic", label: "Antipyretic (Fever Reducer)" }, { value: "Antiseptic", label: "Antiseptic" },
    { value: "Antacid", label: "Antacid" }, { value: "Antihistamine", label: "Antihistamine (Anti-allergy)" },
    { value: "Cardiovascular", label: "Cardiovascular" }, { value: "Dermatological", label: "Dermatological (Skin)" },
    { value: "Gastrointestinal", label: "Gastrointestinal" }, { value: "Respiratory", label: "Respiratory" },
    { value: "Vitamin & Mineral", label: "Vitamin & Mineral" }, { value: "Other", label: "Other..." }
];
const ABC_OPTIONS = [
    { value: "A", label: "A (High Value)" }, { value: "B", label: "B (Medium Value)" }, { value: "C", label: "C (Low Value)" }
];

const InfoIcon = ({ tooltip }) => (
  <div className="relative group flex items-center ml-2">
    <FiHelpCircle size={14} className="text-gray-400 cursor-help" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {tooltip}
    </div>
  </div>
);

const AccordionSection = ({ title, children, isOpen, onToggle }) => (
  <div className="bg-white rounded-lg shadow-sm border">
    <button type="button" onClick={onToggle} className="w-full flex justify-between items-center p-6 font-semibold text-xl text-gray-700">
      {title}
      <FiChevronDown className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && <div className="p-6 border-t border-gray-200">{children}</div>}
  </div>
);

const ConfirmationModal = ({ isOpen, onClose, onConfirm, changes, batchHistory }) => {
    if (!isOpen) return null;
    
    const combinedChanges = [...changes];

    // Format batch history into the same structure for the modal
    if (batchHistory && batchHistory.length > 0) {
        batchHistory.forEach(log => {
            let fieldName = `Batch ${log.batchId} - ${log.field.replace(/([A-Z])/g, ' $1').trim()}`;
            if (log.type === 'add') fieldName = `New Batch: ${log.batchId}`;
            if (log.type === 'delete') fieldName = `Batch Deleted: ${log.batchId}`;
            
            combinedChanges.push({
                fieldName: fieldName,
                oldValue: log.previousValue !== 'N/A' ? log.previousValue : '—',
                newValue: log.updatedValue !== 'N/A' ? log.updatedValue : 'Deleted',
                type: log.type,
                timestamp: log.timestamp,
            });
        });
    }

    return (
     <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transition-all duration-300 ease-out">
        {/* Header */}
        <header className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span role="img" aria-label="document">📝</span> Confirm Update
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review the {combinedChanges.length} total changes before saving.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
             <FiX className="text-xl text-gray-500" />
          </button>
        </header>
    
        {/* Body */}
        <section className="p-6 max-h-72 overflow-y-auto space-y-4">
          {combinedChanges.length > 0 ? (
            <ul className="space-y-3">
              {combinedChanges.map((log, index) => (
                <li key={log.fieldName + log.timestamp + index} className={`p-3 rounded-lg border-l-4 ${log.type === 'delete' ? 'bg-red-50 border-red-400' : log.type === 'add' ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
                    <p className="text-sm font-semibold text-gray-700">
                        {log.fieldName} 
                        <span className="text-xs font-normal ml-2">({log.type.toUpperCase()})</span>
                    </p>
                    {log.type === 'edit' && (
                        <p className="text-xs mt-1">
                            <span className="text-red-500 line-through mr-3">
                            Old: {log.oldValue.toString() || '—'}
                            </span>
                            <span className="text-green-600 font-medium">
                            New: {log.newValue.toString()}
                            </span>
                        </p>
                    )}
                    {log.type === 'delete' && (<p className="text-xs mt-1 text-red-600 font-medium">Permanently Removed.</p>)}
                    {log.type === 'add' && (<p className="text-xs mt-1 text-green-600 font-medium">Batch Added.</p>)}
                </li>
              ))}
            </ul>
          ) : (
             <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
                ✅ No changes detected.
             </div>
          )}
        </section>
    
        {/* Footer */}
        <footer className="p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={combinedChanges.length === 0}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            Confirm & Save Master Record
          </button>
        </footer>
      </div>
    </div>
    );
};


// --- Main Edit Page Component ---
export default function EditMedicinePage({ allMedicines, onUpdateMedicine, stagedBatchChanges, onCancelStaging }) {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Default structure for new medicine data (excluding batches)
    const defaultData = {
      medicineName: '', brandName: '', saltComposition: '', strength: '', form: '', packSize: '', description: '',
      hsnCode: '', gtinBarcode: '', manufacturer: '', marketingCompany: '', isScheduleH1: false,
      minStockLevel: '', maxStockLevel: '', reorderLevel: '', category: '', abcClassification: '',
      batches: []
    };

    const [originalFormData, setOriginalFormData] = useState(null);
    const [formData, setFormData] = useState(defaultData);
    const [otherForm, setOtherForm] = useState('');
    const [otherCategory, setOtherCategory] = useState('');
    const [openSections, setOpenSections] = useState({ basic: true, regulatory: false, inventory: false, batches: true });
    
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    
    // NEW STATE for notifications
    const [notification, setNotification] = useState({ message: '', type: 'info' });

    const stagedChanges = stagedBatchChanges[id];

    // --- Load Data and Initialize State ---
    useEffect(() => {
        const medicineToEdit = allMedicines.find(med => med.id.toString() === id);
        if (medicineToEdit) {
            const dataToSet = { ...defaultData, ...medicineToEdit, form: medicineToEdit.form || medicineToEdit.type };
            
            let finalFormData = deepClone(dataToSet);
            let initialOtherForm = '';
            let initialOtherCategory = '';

            if (finalFormData.form && !FORM_OPTIONS.some(opt => opt.value === finalFormData.form)) {
                initialOtherForm = finalFormData.form;
                finalFormData.form = 'Other';
            }
            if (finalFormData.category && !CATEGORY_OPTIONS.some(opt => opt.value === finalFormData.category)) {
                initialOtherCategory = finalFormData.category;
                finalFormData.category = 'Other';
            }
            
            setOtherForm(initialOtherForm);
            setOtherCategory(initialOtherCategory);
            setFormData(finalFormData);
            setOriginalFormData(deepClone(finalFormData));
            setHasUnsavedChanges(false);
        }
    }, [allMedicines, id]);
    
    // --- Navigation Protection ---
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges || stagedChanges) {
                event.preventDefault();
                event.returnValue = ''; 
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges, stagedChanges]);

    // --- Calculate Changes (FIXED for null/undefined values) ---
    const medicineChanges = useMemo(() => {
        if (!originalFormData) return []; // Guard clause
        
        const currentFinalData = {
            ...formData,
            form: formData.form === 'Other' ? otherForm : formData.form,
            category: formData.category === 'Other' ? otherCategory : formData.category,
        };

        const originalFinalData = {
            ...originalFormData,
            form: originalFormData.form === 'Other' ? otherForm : originalFormData.form,
            category: originalFormData.category === 'Other' ? otherCategory : originalFormData.category,
        };
        
        const allKeys = Object.keys(defaultData).filter(key => key !== 'batches'); 

        return allKeys.reduce((changes, key) => {
            const normalize = (val) => {
                if (val === undefined || val === null) return '';
                if (typeof val === 'boolean') return val ? 'Yes' : 'No';
                return String(val);
            };

            const oldValRaw = originalFinalData[key];
            const newValRaw = currentFinalData[key];

            const oldValue = normalize(oldValRaw);
            const newValue = normalize(newValRaw);

            if (oldValue.trim() !== newValue.trim()) {
                changes.push({
                    fieldName: key,
                    oldValue: oldValue, 
                    newValue: newValue, 
                    type: 'edit',
                    timestamp: new Date().toISOString(),
                });
            }
            return changes;
        }, []);
    }, [formData, otherForm, otherCategory, originalFormData]);

    useEffect(() => {
        setHasUnsavedChanges(medicineChanges.length > 0 || !!stagedChanges);
    }, [medicineChanges.length, stagedChanges]);


    // --- Handlers ---
    
    const handleAccordionToggle = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    
    // Store raw value from input (allows spaces)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const processedValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };
    
    const handleSelectChange = (name, selectedOption) => {
        const value = selectedOption ? selectedOption.value : '';
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Store raw value from input (allows spaces)
    const handleOtherChange = (type, value) => {
        if (type === 'form') { setOtherForm(value); } else { setOtherCategory(value); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setNotification({ message: '', type: 'info' }); // Clear notification
        
        // --- Validation (All fields required) ---
        const fieldsToCheck = [
            'brandName', 'medicineName', 'saltComposition', 'strength', 'packSize', 'description', 
            'hsnCode', 'gtinBarcode', 'manufacturer', 'marketingCompany', 
            'minStockLevel', 'maxStockLevel', 'reorderLevel'
        ];

        for (const field of fieldsToCheck) {
            const value = formData[field];
            if (!value || String(value).trim() === '') {
                setNotification({ message: `Please fill the required field: ${field.replace(/([A-Z])/g, ' $1').trim()}`, type: 'warning' });
                return;
            }
        }

        if (!formData.form || String(formData.form).trim() === '') { setNotification({ message: "Please select a value for Form.", type: 'warning' }); return; }
        if (formData.form === 'Other' && (!otherForm || otherForm.trim() === '')) { setNotification({ message: "Please specify the custom Form type.", type: 'warning' }); return; }
        
        if (!formData.category || String(formData.category).trim() === '') { setNotification({ message: "Please select a value for Category.", type: 'warning' }); return; }
        if (formData.category === 'Other' && (!otherCategory || otherCategory.trim() === '')) { setNotification({ message: "Please specify the custom Category.", type: 'warning' }); return; }

        if (!formData.abcClassification || String(formData.abcClassification).trim() === '') { setNotification({ message: "Please select a value for ABC Classification.", type: 'warning' }); return; }
        
        // Check for changes
        if (medicineChanges.length === 0 && !stagedChanges) { 
             setNotification({ message: "No changes detected to save.", type: 'info' }); 
             return; 
        }

        setConfirmModalOpen(true);
    };

    const handleConfirmSave = () => {
        // Trim all string values and parse numbers before final saving
        const finalData = {
          ...formData,
          brandName: formData.brandName ? formData.brandName.trim() : '',
          medicineName: formData.medicineName ? formData.medicineName.trim() : '',
          saltComposition: formData.saltComposition ? formData.saltComposition.trim() : '',
          strength: formData.strength ? formData.strength.trim() : '',
          packSize: formData.packSize ? formData.packSize.trim() : '',
          description: formData.description ? formData.description.trim() : '',
          hsnCode: formData.hsnCode ? formData.hsnCode.trim() : '',
          gtinBarcode: formData.gtinBarcode ? formData.gtinBarcode.trim() : '',
          manufacturer: formData.manufacturer ? formData.manufacturer.trim() : '',
          marketingCompany: formData.marketingCompany ? formData.marketingCompany.trim() : '',
          
          minStockLevel: parseInt(formData.minStockLevel, 10) || 0,
          maxStockLevel: parseInt(formData.maxStockLevel, 10) || 0,
          reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
          
          form: formData.form === 'Other' ? otherForm.trim() : formData.form,
          category: formData.category === 'Other' ? otherCategory.trim() : formData.category,
          abcClassification: formData.abcClassification ? formData.abcClassification.trim() : '',
        };
        
        onUpdateMedicine(finalData, medicineChanges); 
        
        setConfirmModalOpen(false);
        setHasUnsavedChanges(false);
        setNotification({ message: 'Medicine details updated successfully!', type: 'success' }); // Use notification
        
        setTimeout(() => { navigate('/inventory'); }, 1500); // Delay navigation
    };

    const handleNavigateBack = () => {
        if (hasUnsavedChanges) {
            const confirmMessage = stagedChanges 
                ? "You have unsaved changes (including batch updates). Are you sure you want to leave and lose ALL changes?"
                : "You have unsaved changes. Are you sure you want to leave this page? Changes will be lost.";
            if (window.confirm(confirmMessage)) { if (stagedChanges) { onCancelStaging(formData.id); } navigate('/inventory'); }
        } else { navigate('/inventory'); }
    };
    
    const changesForModal = useMemo(() => ({ medicine: medicineChanges, batchHistory: stagedChanges ? stagedChanges.history : [] }), [medicineChanges, stagedChanges]);


    const customSelectStyles = () => ({
        control: (provided, state) => ({ ...provided, borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB', boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none', '&:hover': { borderColor: '#3B82F6' }, padding: '0.1rem', }),
        option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#3B82F6' : (state.isFocused ? '#EFF6FF' : 'white'), color: state.isSelected ? 'white' : '#1F2937', }),
    });

    if (!originalFormData) return <div className="p-8">Loading medicine data...</div>;

    return (
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        {/* RENDER NOTIFICATION COMPONENT */}
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: 'info' })} 
        />
        
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
                <button onClick={handleNavigateBack} title="Back to Inventory" className="text-gray-600 hover:text-blue-600">
                    <FiArrowLeft size={24} />
                </button>
                <h1 className="text-4xl font-bold text-gray-800">Edit Medicine: {formData.brandName || formData.medicineName}</h1>
            </div>
            <div className="flex space-x-4">
                <button type="button" onClick={handleNavigateBack} className="px-6 py-2 border rounded-lg"> Cancel </button>
                <button type="submit" form="edit-form" className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold ${hasUnsavedChanges ? '' : 'bg-gray-400 cursor-not-allowed'}`} disabled={!hasUnsavedChanges}> Save Changes </button>
            </div>
        </div>
        
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info Section */}
          <AccordionSection title="Basic Information" isOpen={openSections.basic} onToggle={() => handleAccordionToggle('basic')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Brand Name <span className="text-red-500">*</span></label><InfoIcon tooltip="The commercial or trade name from the manufacturer." /></div>
                <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., Dolo-650" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Medicine Name <span className="text-red-500">*</span></label><InfoIcon tooltip="The generic or chemical name of the drug." /></div>
                <input type="text" name="medicineName" value={formData.medicineName} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., Paracetamol" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Salt Composition <span className="text-red-500">*</span></label><InfoIcon tooltip="The active pharmaceutical ingredients (APIs)." /></div>
                <input type="text" name="saltComposition" value={formData.saltComposition} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., Paracetamol IP" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Strength <span className="text-red-500">*</span></label><InfoIcon tooltip="Amount of active ingredient per unit." /></div>
                <input type="text" name="strength" value={formData.strength} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 500 mg" required />
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Form <span className="text-red-500">*</span></label><InfoIcon tooltip="The dosage form of the medicine." /></div>
                <div className="flex items-center gap-2">
                  <Select
                    name="form"
                    value={FORM_OPTIONS.find(opt => opt.value === formData.form)}
                    onChange={(selected) => handleSelectChange('form', selected)}
                    options={FORM_OPTIONS}
                    styles={customSelectStyles()}
                    className="w-full mt-1"
                    placeholder="Select form..."
                  />
                  {formData.form === 'Other' && <input type="text" placeholder="Specify form" value={otherForm} onChange={(e) => handleOtherChange('form', e.target.value)} className="mt-1 block w-full border p-2 rounded" required />}
                </div>
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Pack Size <span className="text-red-500">*</span></label><InfoIcon tooltip="How the medicine is packaged for sale." /></div>
                <input type="text" name="packSize" value={formData.packSize} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 10 tablets/strip" required />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center"><label className="block text-sm font-medium">Description <span className="text-red-500">*</span></label><InfoIcon tooltip="Additional notes or storage instructions." /></div>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border p-2 rounded" placeholder="e.g., Store in a cool, dry place." required></textarea>
              </div>
            </div>
          </AccordionSection>

          {/* Regulatory Info Section */}
          <AccordionSection title="Regulatory Information" isOpen={openSections.regulatory} onToggle={() => handleAccordionToggle('regulatory')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><div className="flex items-center"><label className="block text-sm font-medium">HSN Code <span className="text-red-500">*</span></label><InfoIcon tooltip="Harmonized System of Nomenclature code for tax purposes." /></div><input type="text" name="hsnCode" value={formData.hsnCode} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 30049099" required /></div>
              <div><div className="flex items-center"><label className="block text-sm font-medium">GTIN/Barcode <span className="text-red-500">*</span></label><InfoIcon tooltip="The Global Trade Item Number from the barcode." /></div><input type="text" name="gtinBarcode" value={formData.gtinBarcode} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 1234567890123" required /></div>
              <div><div className="flex items-center"><label className="block text-sm font-medium">Manufacturer <span className="text-red-500">*</span></label><InfoIcon tooltip="The company that produced the medicine." /></div><input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., GSK Pharmaceuticals" required /></div>
              <div><div className="flex items-center"><label className="block text-sm font-medium">Marketing Company <span className="text-red-500">*</span></label><InfoIcon tooltip="The company that sells and markets the drug." /></div><input type="text" name="marketingCompany" value={formData.marketingCompany} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., GSK Consumer Healthcare" required /></div>
              <div className="md:col-span-2 flex items-center">
                <input type="checkbox" name="isScheduleH1" checked={formData.isScheduleH1} onChange={handleChange} className="h-4 w-4 rounded" />
                <label className="ml-2 block text-sm">This is a Schedule H1 medicine</label>
                <InfoIcon tooltip="Check if this drug requires prescription tracking under Schedule H1 rules." />
              </div>
            </div>
          </AccordionSection>

          {/* Inventory Settings Section */}
          <AccordionSection title="Inventory Settings" isOpen={openSections.inventory} onToggle={() => handleAccordionToggle('inventory')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><div className="flex items-center"><label className="block text-sm font-medium">Minimum Stock Level <span className="text-red-500">*</span></label><InfoIcon tooltip="Alerts will be triggered if stock falls below this level." /></div><input type="number" name="minStockLevel" value={formData.minStockLevel} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 10" required /></div>
              <div><div className="flex items-center"><label className="block text-sm font-medium">Maximum Stock Level <span className="text-red-500">*</span></label><InfoIcon tooltip="The maximum quantity to keep in inventory to avoid overstocking." /></div><input type="number" name="maxStockLevel" value={formData.maxStockLevel} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 500" required /></div>
              <div><div className="flex items-center"><label className="block text-sm font-medium">Reorder Level <span className="text-red-500">*</span></label><InfoIcon tooltip="The stock level at which you should reorder the item." /></div><input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} className="mt-1 block w-full border p-2 rounded" placeholder="e.g., 25" required /></div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Category <span className="text-red-500">*</span></label><InfoIcon tooltip="The therapeutic class of the drug." /></div>
                <div className="flex items-center gap-2">
                  <Select
                    name="category"
                    value={CATEGORY_OPTIONS.find(opt => opt.value === formData.category)}
                    onChange={(selected) => handleSelectChange('category', selected)}
                    options={CATEGORY_OPTIONS}
                    styles={customSelectStyles()}
                    className="w-full mt-1"
                    placeholder="Select category..."
                  />
                  {formData.category === 'Other' && <input type="text" placeholder="Specify category" value={otherCategory} onChange={(e) => handleOtherChange('category', e.target.value)} className="mt-1 block w-full border p-2 rounded" required />}
                </div>
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">ABC Classification <span className="text-red-500">*</span></label><InfoIcon tooltip="Classify by value: A (High), B (Medium), C (Low)." /></div>
                <Select
                  name="abcClassification"
                  value={ABC_OPTIONS.find(opt => opt.value === formData.abcClassification)}
                  onChange={(selected) => handleSelectChange('abcClassification', selected)}
                  options={ABC_OPTIONS}
                  styles={customSelectStyles()}
                  className="w-full mt-1"
                  placeholder="Select classification..."
                />
              </div>
            </div>
          </AccordionSection>

          {/* Batches Section */}
          <AccordionSection title="Active Batches" isOpen={openSections.batches} onToggle={() => handleAccordionToggle('batches')}>
            <div className="flex justify-between items-center mb-4">
                <p className={`text-sm font-semibold flex items-center ${stagedChanges ? 'text-yellow-600' : 'text-gray-500'}`}>
                    <FiClock className="mr-1" size={14} /> 
                    {stagedChanges 
                        ? `Batch changes for ₹${stagedChanges.billSummary.total.toFixed(2)} are staged. Save this medicine record to commit.` 
                        : 'No staged batch changes.'}
                </p>
               <button 
                  type="button" 
                  onClick={() => navigate(`/inventory/edit/${formData.id}/batches`)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
                >
                  <FiEdit3 className="mr-2" size={14} /> Edit Batches & Pricing
               </button>
            </div>
            {formData.batches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.batches.map(batch => (
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
              <p className="text-gray-500">No active batches for this medicine. You can add one from the Inventory or Restock page.</p>
            )}
          </AccordionSection>
          
          {/* Change History Section */}
          {medicineChanges.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Pending Metadata Changes ({medicineChanges.length})</h3>
                <ul className="space-y-2 text-sm max-h-60 overflow-y-auto">
                    {medicineChanges.map((log, i) => (
                        <li key={log.fieldName + i} className="p-3 bg-gray-50 rounded border-l-4 border-yellow-400">
                            <p className="font-semibold text-gray-800 capitalize">
                                <span className="font-bold mr-1">EDIT</span>: {log.fieldName.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <span className="text-red-500 line-through mr-3 text-xs">
                                Old: {log.oldValue.toString() || '—'}
                            </span>
                            <span className="text-green-500 font-medium text-xs">
                                New: {log.newValue.toString()}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </form>
        
        {/* The New Confirmation Modal */}
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onConfirm={handleConfirmSave}
            changes={changesForModal.medicine}
            batchHistory={changesForModal.batchHistory}
        />
      </div>
    );
}