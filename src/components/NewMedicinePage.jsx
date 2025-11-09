import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  FiUpload,
  FiCheckCircle,
  FiCpu,
  FiChevronDown,
  FiHelpCircle,
  FiTrash2,
  FiPlus,
  FiX
} from "react-icons/fi";
import Notification from './Notification'; // Import the professional alerts

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
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex justify-between items-center p-6 font-semibold text-xl text-gray-700"
    >
      {title}
      <FiChevronDown
        className={`transform transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    {isOpen && <div className="p-6 border-t border-gray-200">{children}</div>}
  </div>
);

// --- Confirmation Modal Component (THE POPUP) ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  generatedFields,
  medicineData,
  batchesData,
}) => {
  if (!isOpen) return null;

  const aiGeneratedFields = [];
  const emptyFields = [];

  // Check medicine data
  for (const key in medicineData) {
    if (key === "isScheduleH1") continue;
    const value = medicineData[key];
    if (generatedFields.medicine[key]) { aiGeneratedFields.push({ name: key, value: value }); } 
    else if (String(value).trim() === '') { emptyFields.push({ name: key }); }
  }

  // Check batches data
  batchesData.forEach((batch, index) => {
    for (const key in batch) {
      const fieldKey = `${key}_${index}`;
      const value = batch[key];
      if (generatedFields.batches[fieldKey]) { aiGeneratedFields.push({ name: `${key} (Batch ${index + 1})`, value: value }); } 
      else if (String(value).trim() === '') { emptyFields.push({ name: `${key} (Batch ${index + 1})` }); }
    }
  });

  const hasAiFields = aiGeneratedFields.length > 0;
  const hasEmptyFields = emptyFields.length > 0;

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
          <span role="img" aria-label="document">🧾</span> Confirm Details
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Review AI-generated and empty fields before saving.
        </p>
      </div>
      <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
         <FiX className="text-xl text-gray-500" />
      </button>
    </header>

    {/* Body */}
    <section className="p-6 max-h-72 overflow-y-auto space-y-6">
      {hasAiFields && (
        <div>
          <h3 className="text-sm font-semibold text-yellow-800 bg-yellow-100 px-3 py-2 rounded-md flex items-center gap-2">
            ⚠️ AI Generated Fields
          </h3>
          <ul className="mt-3 space-y-2">
            {aiGeneratedFields.map(({ name, value }) => (
              <li key={name} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 capitalize">{name.replace(/_/g, " ")}:</span>
                <span className="text-gray-900 font-medium">{value.toString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasEmptyFields && (
        <div>
          <h3 className="text-sm font-semibold text-red-800 bg-red-100 px-3 py-2 rounded-md flex items-center gap-2">
            ❌ Empty Fields
          </h3>
          <ul className="mt-3 space-y-2">
            {emptyFields.map(({ name }) => (
              <li key={name} className="flex justify-between items-center text-sm">
                <span className="text-gray-700 capitalize">{name.replace(/_/g, " ")}</span>
                <span className="text-red-500 font-semibold">EMPTY</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!hasAiFields && !hasEmptyFields && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md text-sm">
          ✅ All fields are complete and manually entered. Ready to save.
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
        className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Confirm & Save
      </button>
    </footer>
  </div>
</div>
  );
};


export default function NewMedicinePage({ onAddNewMedicine }) {
  const navigate = useNavigate();

  const defaultBatch = {
    batchNumber: "", expiryDate: "", initialQuantity: "", purchasePrice: "", sellingPrice: "", mrp: "", gstRate: "",
  };

  const [medicineData, setMedicineData] = useState({
    medicineName: "", brandName: "", saltComposition: "", strength: "", form: "", packSize: "", description: "",
    hsnCode: "", gtinBarcode: "", manufacturer: "", marketingCompany: "", isScheduleH1: false,
    minStockLevel: "", maxStockLevel: "", reorderLevel: "", category: "", abcClassification: "",
  });

  const [batchesData, setBatchesData] = useState([{ ...defaultBatch }]);
  const [otherForm, setOtherForm] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [generatedFields, setGeneratedFields] = useState({ medicine: {}, batches: {} });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [openSections, setOpenSections] = useState({ basic: true, batch: true, regulatory: false, inventory: false });
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'info' });

  const handleAccordionToggle = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleMedicineChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === "checkbox" ? checked : value;
    setMedicineData((prev) => ({ ...prev, [name]: processedValue }));
    if (generatedFields.medicine[name]) { setGeneratedFields((prev) => ({ ...prev, medicine: { ...prev.medicine, [name]: false } })); }
  };

  const handleBatchChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...batchesData];
    list[index][name] = value;
    setBatchesData(list);
    const fieldKey = `${name}_${index}`;
    if (generatedFields.batches[fieldKey]) { setGeneratedFields((prev) => ({ ...prev, batches: { ...prev.batches, [fieldKey]: false } })); }
  };
  
  const handleOtherChange = (type, value) => { if (type === 'form') { setOtherForm(value); } else { setOtherCategory(value); } };
  const handleFrontImageChange = (e) => { if (e.target.files && e.target.files[0]) setFrontImage(e.target.files[0]); };
  const handleBackImageChange = (e) => { if (e.target.files && e.target.files[0]) setBackImage(e.target.files[0]); };
  const handleAddBatch = () => { setBatchesData([...batchesData, { ...defaultBatch }]); };
  const handleRemoveBatch = (index) => { if (batchesData.length === 1) return; const list = [...batchesData]; list.splice(index, 1); setBatchesData(list); };

  const handleSelectChange = (name, selectedOption) => {
    setMedicineData((prev) => ({ ...prev, [name]: selectedOption ? selectedOption.value : "" }));
    if (generatedFields.medicine[name]) { setGeneratedFields((prev) => ({ ...prev, medicine: { ...prev.medicine, [name]: false } })); }
  };

  const handleAnalyzeImage = async () => {
    if (!frontImage) { setNotification({ message: 'Please upload at least the front image.', type: 'warning' }); return; }
    setIsAnalyzing(true); setAnalysisSuccess(false); setGeneratedFields({ medicine: {}, batches: {} }); setNotification({ message: '', type: 'info' }); 

    const data = new FormData();
    data.append("front_image", frontImage);
    if (backImage) data.append("back_image", backImage);

    try {
      setAnalysisStatus("Step 1/2: Uploading and reading text...");
      const response = await fetch("http://localhost:8000/analyze-images/", { method: "POST", body: data });
      setAnalysisStatus("Step 2/2: Analyzing text with AI...");
      const result = await response.json();
      if (result.error) throw new Error(result.trace || result.error);

      const newMedicineData = {}; const newBatchData = {};
      const newGeneratedMed = {}; const newGeneratedBatch = {};

      for (const key in result) {
        if (result[key] && typeof result[key] === "object") {
          const { value, source } = result[key];
          const isGenerated = source === "generated";
          const safeValue = typeof value === 'boolean' ? value : String(value || ''); 

          if (Object.keys(defaultBatch).includes(key)) {
            newBatchData[key] = safeValue;
            if (isGenerated) newGeneratedBatch[`${key}_0`] = true;
          } else if (Object.keys(medicineData).includes(key)) {
            newMedicineData[key] = safeValue;
            if (isGenerated) newGeneratedMed[key] = true;
          }
        }
      }
      
      if (newMedicineData.form && !FORM_OPTIONS.some((opt) => opt.value === newMedicineData.form)) { setOtherForm(newMedicineData.form); newMedicineData.form = "Other"; }
      if (newMedicineData.category && !CATEGORY_OPTIONS.some((opt) => opt.value === newMedicineData.category)) { setOtherCategory(newMedicineData.category); newMedicineData.category = "Other"; }

      setMedicineData((prev) => ({ ...prev, ...newMedicineData }));
      setBatchesData((prev) => [ { ...prev[0], ...newBatchData }, ...prev.slice(1), ]);
      setGeneratedFields({ medicine: newGeneratedMed, batches: newGeneratedBatch, });
      setAnalysisSuccess(true);
      setNotification({ message: 'Image analysis successful!', type: 'success' }); 
    } catch (error) {
      console.error("Error analyzing image:", error);
      setNotification({ message: `Failed to analyze image: ${error.message}`, type: 'error' }); 
    } finally {
      setIsAnalyzing(false); setAnalysisStatus("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setNotification({ message: '', type: 'info' }); // Clear notification
    
    // --- Validation: Check for ONLY essential fields ---
    
    // 1. Check Medicine Name
    if (!medicineData.medicineName || String(medicineData.medicineName).trim() === '') {
        setNotification({ message: "Please fill the required field: Medicine Name", type: 'warning' });
        return;
    }
    
    // 2. Check 'Other' fields if selected
    if (medicineData.form === 'Other' && (!otherForm || otherForm.trim() === '')) { setNotification({ message: "Please specify the custom Form type.", type: 'warning' }); return; }
    
    // 3. Check Batch Fields
    const batchRequiredFields = ['batchNumber', 'expiryDate', 'initialQuantity', 'purchasePrice', 'sellingPrice', 'mrp'];
    for (const batch of batchesData) {
        for (const field of batchRequiredFields) {
            const value = batch[field];
            if (!value || String(value).trim() === '') {
                setNotification({ message: `Please fill the required field "${field.replace(/([A-Z])/g, ' $1').trim()}" for batch: ${batch.batchNumber || 'NEW'}`, type: 'warning' });
                return;
            }
        }
    }
    
    // If validation passes, open the confirmation modal
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    // 1. Prepare Batches with safety trim and parsing
    const finalBatches = batchesData.map((batch) => ({
      batchNumber: batch.batchNumber ? String(batch.batchNumber).trim() : '',
      expiryDate: batch.expiryDate,
      initialQuantity: parseInt(batch.initialQuantity, 10) || 0,
      purchasePrice: parseFloat(batch.purchasePrice) || 0,
      sellingPrice: parseFloat(batch.sellingPrice) || 0,
      mrp: parseFloat(batch.mrp) || 0,
      gstRate: batch.gstRate ? String(batch.gstRate).trim() : '',
    }));

    // 2. Prepare Medicine Metadata with trimming and parsing
    const finalMedicineData = {
      medicineName: medicineData.medicineName ? medicineData.medicineName.trim() : '',
      brandName: medicineData.brandName ? medicineData.brandName.trim() : '',
      saltComposition: medicineData.saltComposition ? medicineData.saltComposition.trim() : '',
      strength: medicineData.strength ? medicineData.strength.trim() : '',
      packSize: medicineData.packSize ? medicineData.packSize.trim() : '',
      description: medicineData.description ? medicineData.description.trim() : '',
      hsnCode: medicineData.hsnCode ? medicineData.hsnCode.trim() : '',
      gtinBarcode: medicineData.gtinBarcode ? medicineData.gtinBarcode.trim() : '',
      manufacturer: medicineData.manufacturer ? medicineData.manufacturer.trim() : '',
      marketingCompany: medicineData.marketingCompany ? medicineData.marketingCompany.trim() : '',
      isScheduleH1: medicineData.isScheduleH1,
      
      minStockLevel: parseInt(medicineData.minStockLevel, 10) || 0,
      maxStockLevel: parseInt(medicineData.maxStockLevel, 10) || 0,
      reorderLevel: parseInt(medicineData.reorderLevel, 10) || 0,

      form: medicineData.form === "Other" ? otherForm.trim() : medicineData.form,
      category:
        medicineData.category === "Other"
          ? otherCategory.trim()
          : medicineData.category,
      abcClassification: medicineData.abcClassification ? medicineData.abcClassification.trim() : '',
    };

    // 3. Call parent save function
    onAddNewMedicine(finalMedicineData, finalBatches);
    
    // 4. Close Modal and Navigate 
    setConfirmModalOpen(false);
    setNotification({ message: 'New medicine added successfully! (Check Transaction History for log)', type: 'success' }); 
    setTimeout(() => { navigate("/inventory"); }, 1500); 
  };

  const getHighlightClass = (type, key) => {
    const baseClass = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2";
    let isGenerated;
    if (type === "medicine") { isGenerated = generatedFields.medicine[key]; } 
    else { isGenerated = generatedFields.batches[key]; }
    return isGenerated ? `${baseClass} border-yellow-400 bg-yellow-50` : baseClass;
  };
  const getGeneratedStatus = (type, key) => { 
    if (type === "medicine") return generatedFields.medicine[key];
    return generatedFields.batches[key];
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <Notification 
        message={notification.message} 
        type={notification.type} 
        onClose={() => setNotification({ message: '', type: 'info' })} 
      />

      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Add New Medicine
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Image Upload Section --- */}
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Image Upload & Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              <span className="font-semibold text-gray-600 mb-2">
                Front Image <span className="text-red-500">*</span>
              </span>
              <FiUpload className="text-blue-600" size={24} />
              <span className="text-blue-600 text-sm mt-2">{frontImage ? frontImage.name : "Choose File"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFrontImageChange} />
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              <span className="font-semibold text-gray-600 mb-2">
                Back Image (Optional)
              </span>
              <FiUpload className="text-gray-500" size={24} />
              <span className="text-gray-500 text-sm mt-2">{backImage ? backImage.name : "Choose File"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBackImageChange} />
            </label>
          </div>
          <div className="mt-6 flex flex-col items-center">
            <button type="button" onClick={handleAnalyzeImage} disabled={!frontImage || isAnalyzing} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center shadow-md disabled:bg-gray-400">
              {isAnalyzing ? "Analyzing..." : "Analyze Images"}
              {analysisSuccess && <FiCheckCircle className="ml-2" />}
            </button>
            {isAnalyzing && <p className="text-sm font-semibold text-gray-600 mt-2">{analysisStatus}</p>}
          </div>
        </div>

        {/* --- Basic Information Section --- */}
        <AccordionSection title="Basic Information" isOpen={openSections.basic} onToggle={() => handleAccordionToggle("basic")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Brand Name</label><InfoIcon tooltip="The commercial or trade name from the manufacturer." /></div>
              <input type="text" name="brandName" value={medicineData.brandName} onChange={handleMedicineChange} className={getHighlightClass("medicine", "brandName")} placeholder="e.g., Dolo-650" />
              {getGeneratedStatus("medicine", "brandName") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Medicine Name <span className="text-red-500">*</span></label><InfoIcon tooltip="The generic or chemical name of the drug." /></div>
              <input type="text" name="medicineName" value={medicineData.medicineName} onChange={handleMedicineChange} className={getHighlightClass("medicine", "medicineName")} placeholder="e.g., Paracetamol" required />
              {getGeneratedStatus("medicine", "medicineName") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Salt Composition</label><InfoIcon tooltip="The active pharmaceutical ingredients (APIs)." /></div>
              <input type="text" name="saltComposition" value={medicineData.saltComposition} onChange={handleMedicineChange} className={getHighlightClass("medicine", "saltComposition")} placeholder="e.g., Paracetamol IP" />
              {getGeneratedStatus("medicine", "saltComposition") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Strength</label><InfoIcon tooltip="Amount of active ingredient per unit." /></div>
              <input type="text" name="strength" value={medicineData.strength} onChange={handleMedicineChange} className={getHighlightClass("medicine", "strength")} placeholder="e.g., 500 mg" />
              {getGeneratedStatus("medicine", "strength") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Form</label><InfoIcon tooltip="The dosage form of the medicine." /></div>
              <div className="flex items-center gap-2">
                <Select name="form" value={FORM_OPTIONS.find(opt => opt.value === medicineData.form)} onChange={(selected) => { handleSelectChange("form", selected); if (generatedFields.medicine.form) setGeneratedFields((prev) => ({ ...prev, medicine: { ...prev.medicine, form: false } })); }} options={FORM_OPTIONS} styles={{ control: (provided, state) => ({ ...provided, borderColor: generatedFields.medicine.form ? "#FBBF24" : state.isFocused ? "#3B82F6" : "#D1D5DB", backgroundColor: generatedFields.medicine.form ? "#FFFBEB" : "white", padding: "0.1rem" }), }} className="w-full mt-1" />
                {medicineData.form === "Other" && <input type="text" placeholder="Specify form" value={otherForm} onChange={(e) => handleOtherChange('form', e.target.value)} className="mt-1 block w-full border p-2 rounded" required />}
              </div>
              {getGeneratedStatus("medicine", "form") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Pack Size</label><InfoIcon tooltip="How the medicine is packaged for sale." /></div>
              <input type="text" name="packSize" value={medicineData.packSize} onChange={handleMedicineChange} className={getHighlightClass("medicine", "packSize")} placeholder="e.g., 10 tablets/strip" />
              {getGeneratedStatus("medicine", "packSize") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center"><label className="block text-sm font-medium">Description</label><InfoIcon tooltip="Additional notes or storage instructions." /></div>
              <textarea name="description" value={medicineData.description} onChange={handleMedicineChange} rows="3" className={getHighlightClass("medicine", "description")} placeholder="e.g., Store in a cool, dry place."></textarea>
              {getGeneratedStatus("medicine", "description") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
          </div>
        </AccordionSection>

        {/* --- Batch Information Section --- */}
        <AccordionSection title="Batch Information" isOpen={openSections.batch} onToggle={() => handleAccordionToggle("batch")}>
          {batchesData.map((batch, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mb-4 border rounded-lg relative">
              {batchesData.length > 1 && <button type="button" onClick={() => handleRemoveBatch(index)} className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full hover:bg-red-700"><FiTrash2 size={12} /></button>}
              <h3 className="md:col-span-2 text-lg font-semibold text-gray-600">Batch {index + 1}</h3>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Batch Number <span className="text-red-500">*</span></label><InfoIcon tooltip="Unique code for this production run." /></div>
                <input type="text" name="batchNumber" value={batch.batchNumber} onChange={(e) => handleBatchChange(index, e)} className={getHighlightClass("batches", `batchNumber_${index}`)} placeholder="e.g., BT240115" required />
                {getGeneratedStatus("batches", `batchNumber_${index}`) && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Expiry Date <span className="text-red-500">*</span></label><InfoIcon tooltip="Date after which the medicine is not effective." /></div>
                <input type="date" name="expiryDate" value={batch.expiryDate} onChange={(e) => handleBatchChange(index, e)} className={getHighlightClass("batches", `expiryDate_${index}`)} required />
                {getGeneratedStatus("batches", `expiryDate_${index}`) && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Initial Quantity <span className="text-red-500">*</span></label><InfoIcon tooltip="Number of units in this batch." /></div>
                <input type="number" name="initialQuantity" value={batch.initialQuantity} onChange={(e) => handleBatchChange(index, e)} className={getHighlightClass("batches", `initialQuantity_${index}`)} placeholder="e.g., 100" required />
                {getGeneratedStatus("batches", `initialQuantity_${index}`) && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Purchase Price <span className="text-red-500">*</span></label><InfoIcon tooltip="The price you paid per unit." /></div>
                <input type="number" name="purchasePrice" value={batch.purchasePrice} onChange={(e) => handleBatchChange(index, e)} step="0.01" className={getHighlightClass("batches", `purchasePrice_${index}`)} placeholder="e.g., 25.50" required />
                {getGeneratedStatus("batches", `purchasePrice_${index}`) && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">Selling Price <span className="text-red-500">*</span></label><InfoIcon tooltip="The price you will sell per unit (before taxes)." /></div>
                <input type="number" name="sellingPrice" value={batch.sellingPrice} onChange={(e) => handleBatchChange(index, e)} step="0.01" className={getHighlightClass("batches", `sellingPrice_${index}`)} placeholder="e.g., 40.00" required />
                {getGeneratedStatus("batches", `sellingPrice_${index}`) && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">MRP <span className="text-red-500">*</span></label><InfoIcon tooltip="Maximum Retail Price per unit." /></div>
                <input type="number" name="mrp" value={batch.mrp} onChange={(e) => handleBatchChange(index, e)} step="0.01" className={getHighlightClass("batches", `mrp_${index}`)} placeholder="e.g., 45.00" required />
                {getGeneratedStatus("batches", `mrp_${index}`) && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
              </div>
              <div>
                <div className="flex items-center"><label className="block text-sm font-medium">GST Rate (%)</label><InfoIcon tooltip="Enter the applicable GST percentage." /></div>
                <input type="text" name="gstRate" value={batch.gstRate} onChange={(e) => handleBatchChange(index, e)} className={getHighlightClass("batches", `gstRate_${index}`)} placeholder="e.g., 12 or 5%" />
                {getGeneratedStatus("batches", `gstRate_${index}`) && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddBatch} className="mt-4 flex items-center text-sm text-blue-600 font-semibold"><FiPlus className="mr-1" /> Add Another Batch</button>
        </AccordionSection>

        {/* --- Regulatory Information Section --- */}
        <AccordionSection title="Regulatory Information" isOpen={openSections.regulatory} onToggle={() => handleAccordionToggle("regulatory")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">HSN Code</label><InfoIcon tooltip="Harmonized System of Nomenclature code for tax purposes." /></div>
              <input type="text" name="hsnCode" value={medicineData.hsnCode} onChange={handleMedicineChange} className={getHighlightClass("medicine", "hsnCode")} placeholder="e.g., 30049099" />
              {getGeneratedStatus("medicine", "hsnCode") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">GTIN/Barcode</label><InfoIcon tooltip="The Global Trade Item Number from the barcode." /></div>
              <input type="text" name="gtinBarcode" value={medicineData.gtinBarcode} onChange={handleMedicineChange} className={getHighlightClass("medicine", "gtinBarcode")} placeholder="e.g., 1234567890123" />
              {getGeneratedStatus("medicine", "gtinBarcode") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Manufacturer</label><InfoIcon tooltip="The company that produced the medicine." /></div>
              <input type="text" name="manufacturer" value={medicineData.manufacturer} onChange={handleMedicineChange} className={getHighlightClass("medicine", "manufacturer")} placeholder="e.g., GSK Pharmaceuticals" />
              {getGeneratedStatus("medicine", "manufacturer") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Marketing Company</label><InfoIcon tooltip="The company that sells and markets the drug." /></div>
              <input type="text" name="marketingCompany" value={medicineData.marketingCompany} onChange={handleMedicineChange} className={getHighlightClass("medicine", "marketingCompany")} placeholder="e.g., GSK Consumer Healthcare" />
              {getGeneratedStatus("medicine", "marketingCompany") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div className="md:col-span-2 flex items-center">
              <input type="checkbox" name="isScheduleH1" checked={medicineData.isScheduleH1} onChange={handleMedicineChange} className="h-4 w-4 rounded" />
              <label className="ml-2 block text-sm">This is a Schedule H1 medicine</label>
              <InfoIcon tooltip="Check if this drug requires prescription tracking under Schedule H1 rules." />
            </div>
          </div>
        </AccordionSection>

        {/* --- Inventory Settings Section --- */}
        <AccordionSection title="Inventory Settings" isOpen={openSections.inventory} onToggle={() => handleAccordionToggle("inventory")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Minimum Stock Level</label><InfoIcon tooltip="Alerts will be triggered if stock falls below this level." /></div>
              <input type="number" name="minStockLevel" value={medicineData.minStockLevel} onChange={handleMedicineChange} className={getHighlightClass("medicine", "minStockLevel")} placeholder="e.g., 10" />
              {getGeneratedStatus("medicine", "minStockLevel") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Maximum Stock Level</label><InfoIcon tooltip="The maximum quantity to keep in inventory to avoid overstocking." /></div>
              <input type="number" name="maxStockLevel" value={medicineData.maxStockLevel} onChange={handleMedicineChange} className={getHighlightClass("medicine", "maxStockLevel")} placeholder="e.g., 500" />
              {getGeneratedStatus("medicine", "maxStockLevel") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Reorder Level</label><InfoIcon tooltip="The stock level at which you should reorder the item." /></div>
              <input type="number" name="reorderLevel" value={medicineData.reorderLevel} onChange={handleMedicineChange} className={getHighlightClass("medicine", "reorderLevel")} placeholder="e.g., 25" />
              {getGeneratedStatus("medicine", "reorderLevel") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">Category</label><InfoIcon tooltip="The therapeutic class of the drug." /></div>
              <div className="flex items-center gap-2">
                <Select name="category" value={CATEGORY_OPTIONS.find(opt => opt.value === medicineData.category)} onChange={(selected) => { handleSelectChange("category", selected); if (generatedFields.medicine.category) setGeneratedFields((prev) => ({ ...prev, medicine: { ...prev.medicine, category: false } })); }} options={CATEGORY_OPTIONS} styles={{ control: (provided, state) => ({ ...provided, borderColor: generatedFields.medicine.category ? "#FBBF24" : state.isFocused ? "#3B82F6" : "#D1D5DB", backgroundColor: generatedFields.medicine.category ? "#FFFBEB" : "white", padding: "0.1rem" }), }} className="w-full mt-1" />
                {medicineData.category === "Other" && <input type="text" placeholder="Specify category" value={otherCategory} onChange={(e) => handleOtherChange('category', e.target.value)} className="mt-1 block w-full border p-2 rounded" required />}
              </div>
              {getGeneratedStatus("medicine", "category") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
            <div>
              <div className="flex items-center"><label className="block text-sm font-medium">ABC Classification</label><InfoIcon tooltip="Classify by value: A (High), B (Medium), C (Low)." /></div>
              <Select name="abcClassification" value={ABC_OPTIONS.find(opt => opt.value === medicineData.abcClassification)} onChange={(selected) => { handleSelectChange("abcClassification", selected); if (generatedFields.medicine.abcClassification) setGeneratedFields((prev) => ({ ...prev, medicine: { ...prev.medicine, abcClassification: false } })); }} options={ABC_OPTIONS} styles={{ control: (provided, state) => ({ ...provided, borderColor: generatedFields.medicine.abcClassification ? "#FBBF24" : state.isFocused ? "#3B82F6" : "#D1D5DB", backgroundColor: generatedFields.medicine.abcClassification ? "#FFFBEB" : "white", padding: "0.1rem" }), }} className="w-full mt-1" />
              {getGeneratedStatus("medicine", "abcClassification") && <p className="text-xs text-yellow-600 mt-1 flex items-center"><FiCpu size={12} className="mr-1" />AI Generated</p>}
            </div>
          </div>
        </AccordionSection>

        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={() => navigate("/inventory")} className="px-6 py-2 border rounded-lg">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">Save Medicine</button>
        </div>
      </form>

      {/* RENDER THE POPUP (ConfirmationModal) */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        generatedFields={generatedFields}
        medicineData={medicineData}
        batchesData={batchesData}
      />
    </div>
  );
}