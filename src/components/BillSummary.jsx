// BillSummary.responsive.withResizableFooter.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  FiPlus, FiMinus, FiTrash2, FiUser, FiPhone, FiMapPin, FiFileText,
  FiCalendar, FiEdit2, FiMessageSquare, FiHash, FiTruck, FiPercent,
  FiChevronUp, FiChevronDown, FiRefreshCw
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

// --- Customer Details Section (keeps your original inputs & handler calls) ---
const CustomerDetailsSection = ({ customerDetails, onCustomerDetailsChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Customer Details (Optional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="e.g., John Smith"
              value={customerDetails.name}
              onChange={onCustomerDetailsChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="phone"
              placeholder="e.g., 9876543210"
              value={customerDetails.phone}
              onChange={onCustomerDetailsChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-3 text-gray-400" />
            <textarea
              name="address"
              placeholder="e.g., 123 Main St, City, State"
              value={customerDetails.address}
              onChange={onCustomerDetailsChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              rows="2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">GSTIN</label>
          <div className="relative">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="gstin"
              placeholder="e.g., 22AAAAA0000A1Z5"
              value={customerDetails.gstin}
              onChange={onCustomerDetailsChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">DL Number</label>
          <div className="relative">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="dlNumber"
              placeholder="e.g., JHK12345"
              value={customerDetails.dlNumber}
              onChange={onCustomerDetailsChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Remark Options and Invoice Details Section (keeps handler signature usage) ---
const REMARK_OPTIONS = [
  { value: 'thank_you', label: 'Thank You! Visit Again.' },
  { value: 'bank_details', label: 'Bank Details' },
  { value: 'terms_return', label: 'Goods Not Returnable' },
  { value: 'terms_jurisdiction', label: 'Subject to Jurisdiction' },
  { value: 'payment_advance', label: 'Advance Payment Required' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'e_and_oe', label: 'E&OE' },
  { value: 'no_remarks', label: 'No Remarks' },
  { value: 'other', label: 'Other...' }
];

const InvoiceDetailsSection = ({ invoiceDetails, onInvoiceDetailsChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Invoice Details (Optional)</h3>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">PO No.</label>
        <div className="relative">
          <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="poNo"
            placeholder="e.g., PO-123"
            value={invoiceDetails.poNo}
            onChange={(e) => onInvoiceDetailsChange(null, e)} // keep your original event signature
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Delivery Challan No.</label>
        <div className="relative">
          <FiTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <p className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 h-10 flex items-center">
            {invoiceDetails.challanNo || "N/A (Add item to generate)"}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <DatePicker
            selected={invoiceDetails.dueDate}
            onChange={(date) => onInvoiceDetailsChange('dueDate', date)}
            placeholderText="Select due date"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Ref. No.</label>
        <div className="relative">
          <FiEdit2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <p className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 h-10 flex items-center">
            {invoiceDetails.refNo || "N/A (Add item to generate)"}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Remarks</label>
        <Select
          options={REMARK_OPTIONS}
          value={REMARK_OPTIONS.find(opt => opt.value === invoiceDetails.noteType)}
          onChange={(selectedOption) => onInvoiceDetailsChange('noteType', selectedOption.value)}
          className="w-full"
          classNamePrefix="react-select"
        />
      </div>

      {invoiceDetails.noteType === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Custom Remark</label>
          <div className="relative">
            <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
            <textarea
              name="noteCustom"
              placeholder="Enter custom note..."
              value={invoiceDetails.noteCustom}
              onChange={(e) => onInvoiceDetailsChange(null, e)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              rows="2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main responsive component with resizable footer ---
export default function BillSummary({
  cart = [],
  onQuantityChange = () => {},
  onRemoveItem = () => {},
  onProcess = () => {},
  onHold = () => {},
  mode = 'sale',
  customerDetails = {},
  onCustomerDetailsChange = () => {},
  invoiceDetails = {},
  onInvoiceDetailsChange = () => {},
  totals = {}
}) {
  const isRestock = mode === 'restock';

  // Resizable footer state
  const DEFAULT_FOOTER_HEIGHT = 436; // <-- Your requested change
  const MIN_FOOTER_HEIGHT = 80;
  const MAX_FOOTER_HEIGHT_PCT = 0.6;
  
  const [footerHeight, setFooterHeight] = useState(DEFAULT_FOOTER_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const resizingRef = useRef({ startY: 0, startHeight: DEFAULT_FOOTER_HEIGHT });

  const clampFooterHeight = (h) => {
    const vh = window.innerHeight || 800;
    const maxH = Math.floor(vh * MAX_FOOTER_HEIGHT_PCT);
    return Math.max(MIN_FOOTER_HEIGHT, Math.min(maxH, Math.round(h)));
  };

  // Mouse & touch handlers
  const onMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    resizingRef.current = { startY: e.clientY, startHeight: footerHeight };
  };
  const onMouseMove = (e) => {
    if (!isResizing) return;
    const delta = resizingRef.current.startY - e.clientY;
    setFooterHeight(clampFooterHeight(resizingRef.current.startHeight + delta));
  };
  const onMouseUp = () => setIsResizing(false);

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    setIsResizing(true);
    resizingRef.current = { startY: touch.clientY, startHeight: footerHeight };
  };
  const onTouchMove = (e) => {
    if (!isResizing) return;
    const touch = e.touches[0];
    const delta = resizingRef.current.startY - touch.clientY;
    setFooterHeight(clampFooterHeight(resizingRef.current.startHeight + delta));
  };
  const onTouchEnd = () => setIsResizing(false);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isResizing]);

  const onHandleDoubleClick = () => setIsCollapsed(!isCollapsed);
  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  // Group cart and totals (safe defaults)
  const groupedCart = cart.reduce((acc, item) => {
    const key = item.brandName || item.medicineName || 'Misc';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);

  const displaySubtotal = isRestock ? cart.reduce((sum, item) => sum + ((item.purchasePrice || 0) * (item.quantity || 0)), 0) : (totals?.subtotal ?? 0);
  const displayDiscount = isRestock ? 0 : (totals?.discountAmount ?? 0);
  const displayTaxable = Math.max(0, displaySubtotal - displayDiscount);
  const displayCGST = isRestock ? (displaySubtotal * 0.06) : (totals?.cgstTotal ?? 0);
  const displaySGST = isRestock ? (displaySubtotal * 0.06) : (totals?.sgstTotal ?? 0);
  const displayRoundOff = isRestock ? 0 : (totals?.roundOff ?? 0);
  const displayTotal = isRestock ? (displaySubtotal + displayCGST + displaySGST) : (totals?.finalTotal ?? 0);

  const formatCurrency = (v) => Number(v || 0).toFixed(2);

  const actualFooterHeight = isCollapsed ? MIN_FOOTER_HEIGHT : footerHeight;
  const footerStyle = { height: actualFooterHeight, minHeight: MIN_FOOTER_HEIGHT };

  return (
    <aside className="w-full md:w-96 bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-4rem)] sticky top-4 min-h-0">
      {/* Header */}
      <header className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Bill Summary</h2>
            <p className="text-sm text-gray-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Net</div>
            <div className="text-lg font-semibold">₹ {formatCurrency(displayTotal)}</div>
          </div>
        </div>
      </header>

      {/* Scrollable content area */}
      <div className="p-4 overflow-auto flex-1 space-y-4 min-h-0">
        {/* Items */}
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Your bill is empty.</div>
          ) : (
            Object.entries(groupedCart).map(([brand, batches]) => (
              <div key={brand}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{brand}</h3>
                <div className="space-y-2">
                  {batches.map(item => (
                    <div key={item.batchId || item.batchNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{item.medicineName || item.productName || 'Unnamed'}</p>
                            <p className="text-xs text-gray-500 truncate">Batch: {item.batchId || item.batchNumber} • @{(isRestock ? (item.purchasePrice || 0) : (item.price || 0)).toFixed(2)}</p>
                          </div>
                          <div className="ml-2 text-right text-sm font-medium">₹ {(((isRestock ? (item.purchasePrice || 0) : (item.price || 0)) * (item.quantity || 0)) || 0).toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex items-center ml-3 space-x-2">
                        <button aria-label="Decrease quantity" onClick={() => onQuantityChange(item.batchId || item.batchNumber, -1)} className="p-1 rounded-full bg-white border border-gray-200 hover:bg-gray-100"><FiMinus size={14} /></button>
                        <div className="w-9 text-center font-semibold">{item.quantity}</div>
                        <button aria-label="Increase quantity" onClick={() => onQuantityChange(item.batchId || item.batchNumber, 1)} className="p-1 rounded-full bg-white border border-gray-200 hover:bg-gray-100"><FiPlus size={14} /></button>
                        <button aria-label="Remove item" onClick={() => onRemoveItem(item.medicineId, item.batchId || item.batchNumber)} className="p-1 rounded-full text-red-500 hover:bg-red-50"><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Optional sections (collapsed by default on small screens) */}
        {!isRestock && (
          <div className="space-y-4">
            <details className="bg-white border border-gray-100 rounded-lg p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">Customer Details</summary>
              <div className="mt-3">
                <CustomerDetailsSection customerDetails={customerDetails} onCustomerDetailsChange={onCustomerDetailsChange} />
              </div>
            </details>

            <details className="bg-white border border-gray-100 rounded-lg p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">Invoice Details</summary>
              <div className="mt-3">
                <InvoiceDetailsSection invoiceDetails={invoiceDetails} onInvoiceDetailsChange={onInvoiceDetailsChange} />
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        role="separator"
        aria-label="Resize totals"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onDoubleClick={onHandleDoubleClick}
        className="flex items-center justify-center cursor-row-resize select-none bg-transparent"
        style={{ height: 10 }}
      >
        <div className="w-full max-w-md h-1 bg-gray-200 rounded-full" />
      </div>

      {/* Footer (resizable) */}
      <footer className="bg-gradient-to-t from-white to-gray-50 border-t border-gray-100 flex-shrink-0 overflow-auto" style={footerStyle}>
        {/* Top small bar with reset + collapse icons (distinct) */}
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="text-sm text-gray-600">Totals</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFooterHeight(DEFAULT_FOOTER_HEIGHT)}
              title="Reset size"
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Reset totals size"
            >
              <FiRefreshCw />
            </button>

            <button
              onClick={toggleCollapsed}
              title={isCollapsed ? 'Expand' : 'Collapse'}
              className="p-1 rounded hover:bg-gray-100"
              aria-label={isCollapsed ? 'Expand totals' : 'Collapse totals'}
            >
              {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {!isRestock && (
            <div className="mb-3">
              <label className="sr-only">Discount %</label>
              <div className="relative">
                <FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="discount"
                  placeholder="Discount %"
                  value={invoiceDetails.discount}
                  onChange={(e) => onInvoiceDetailsChange(null, e)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          )}

          <div className="text-sm text-gray-700 mb-3 space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">₹ {formatCurrency(displaySubtotal)}</span></div>
            {!isRestock && (
              <>
                <div className="flex justify-between text-red-600"><span>Discount</span><span className="font-medium">- ₹ {formatCurrency(displayDiscount)}</span></div>
                <div className="flex justify-between border-t pt-1"><span>Taxable</span><span className="font-medium">₹ {formatCurrency(displayTaxable)}</span></div>
              </>
            )}
            <div className="flex justify-between"><span>CGST</span><span className="font-medium">₹ {formatCurrency(displayCGST)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span className="font-medium">₹ {formatCurrency(displaySGST)}</span></div>
            {!isRestock && (
              <div className="flex justify-between"><span>Round Off</span><span className="font-medium">₹ {formatCurrency(displayRoundOff)}</span></div>
            )}

            <div className="flex justify-between mt-2 text-base sm:text-lg font-bold text-gray-900">
              <span>Net Amount</span>
              <span>₹ {formatCurrency(displayTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onProcess}
              disabled={cart.length === 0}
              className="w-full py-2 sm:py-3 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
            >
              {isRestock ? 'Process Restock' : 'Process Payment'}
            </button>
            <button
              onClick={onHold}
              disabled={cart.length === 0}
              className="w-full py-2 sm:py-3 rounded-lg bg-white text-blue-600 border border-blue-600 font-semibold disabled:opacity-60"
            >
              Hold Transaction
            </button>
          </div>
        </div>
      </footer>
    </aside>
  );
}