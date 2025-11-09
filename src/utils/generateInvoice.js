import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToWords } from 'to-words'; // --- *** NEW: Import to-words *** ---

// --- *** NEW: ToWords setup *** ---
const toWords = new ToWords({
  localeCode: 'en-IN',
  currency: true,
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: true,
  }
});

// Helper to format the date, or return 'N/A'
const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (E) {
    return 'N/A';
  }
};

// --- Function to get remark text ---
const getRemarkText = (invoiceDetails) => {
  const { noteType, noteCustom } = invoiceDetails;
  switch (noteType) {
    case 'thank_you':
      return "Thank You! Visit Again!";
    case 'bank_details':
      return "Bank Details: State Bank of India, Ac. No.: 30860782555, IFSC Code: SBIN222ED1";
    // "terms_return" is now a permanent footer, so it's removed from here
    case 'terms_jurisdiction':
      return "Subject To Ramgarh Jurisdiction";
    case 'payment_advance':
      return "Advance Payment before Delivery.";
    case 'payment_received':
      return "Payment Received. Thank you.";
    case 'e_and_oe':
      return "E&OE (Errors and Omissions Excepted)";
    case 'no_remarks':
      return ""; // No remark
    case 'other':
      return noteCustom || ""; // Use custom text
    default:
      return "Thank You! Visit Again!";
  }
};

// --- *** NEW: Helper to build HSN Summary Data *** ---
const buildHsnSummary = (cartItems, discount) => {
  const summary = new Map(); // Use a Map to group by HSN code

  cartItems.forEach(item => {
    const hsn = item.hsnCode || 'N/A';
    const gstRate = parseFloat(item.gstRate) || 0;
    const key = `${hsn}@${gstRate}`;
    
    const itemSubtotal = (item.price || 0) * (item.quantity || 0);
    const itemDiscount = itemSubtotal * (discount / 100);
    const taxableAmount = itemSubtotal - itemDiscount;
    const cgst = (taxableAmount * (gstRate / 100)) / 2;
    const sgst = (taxableAmount * (gstRate / 100)) / 2;

    if (!summary.has(key)) {
      summary.set(key, {
        hsn,
        gstRate,
        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
      });
    }

    const entry = summary.get(key);
    entry.taxableAmount += taxableAmount;
    entry.cgst += cgst;
    entry.sgst += sgst;
  });

  // Convert map to array for autoTable
  return Array.from(summary.values());
};


export const generateInvoicePDF = (customerDetails, cartItems, newTransaction, totals, invoiceDetails) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let vPos = 0; 

  // --- 1. SET FONT ---
  doc.setFont('helvetica', 'normal');

  // --- *** MODIFIED: 2. SELLER INFO (Aarogya Medical) *** ---
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("Aarogya Medical", 14, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Main Road Ranchi, Near Sujata Cinema", 14, 29);
  doc.text("GSTIN: 20AUIJPU456SL1ZN, State: Jharkhand, Code: 20", 14, 36);
  doc.text("Contact: 0651-0000225 25588877", 14, 43);
  doc.text("PAN No.: JHM145CD", 14, 50); 
  doc.text("DL No.: JHM458FD", 14, 57); 

  // --- 3. INVOICE & BUYER INFO ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const rightAlignX = pageWidth - 14;
  // --- *** NEW: "ORIGINAL FOR RECIPIENT" *** ---
  doc.text("GST INVOICE", rightAlignX, 22, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("ORIGINAL FOR RECIPIENT", rightAlignX, 15, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const invoiceDataBody = [
    ['Invoice No:', newTransaction.invoice],
    ['Date:', newTransaction.date],
  ];
  if (invoiceDetails.poNo) {
    invoiceDataBody.push(['PO No.:', invoiceDetails.poNo]);
  }
  if (invoiceDetails.challanNo) {
    invoiceDataBody.push(['Challan No.:', invoiceDetails.challanNo]);
  }
  if (invoiceDetails.dueDate) {
    invoiceDataBody.push(['Due Date:', formatDate(invoiceDetails.dueDate)]);
  }
  if (invoiceDetails.refNo) {
    invoiceDataBody.push(['Ref. No.:', invoiceDetails.refNo]);
  }
  
  const remarkText = getRemarkText(invoiceDetails);
  if (remarkText && invoiceDetails.noteType !== 'no_remarks') { 
     invoiceDataBody.push(['Remark:', remarkText]);
  }

  autoTable(doc, {
    body: invoiceDataBody,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 0.5 },
    columnStyles: { 
      0: { fontStyle: 'bold' },
      1: { cellWidth: 48, overflow: 'linebreak' } 
    },
    tableWidth: 60,
    margin: { left: pageWidth - 74 },
    startY: 28,
  });


  // --- Buyer Details (Left Side) ---
  vPos = 64; 
  doc.setFont('helvetica', 'bold');
  doc.text("Details for Buyer (Billed & Shipped to):", 14, vPos);
  
  vPos += 7; 
  doc.setFont('helvetica', 'normal');
  doc.text(customerDetails.name || "Walk-in Customer", 14, vPos);

  if (customerDetails.address && customerDetails.address.trim() !== '') {
    vPos += 5;
    const addressLines = doc.splitTextToSize(customerDetails.address, 80);
    doc.text(addressLines, 14, vPos);
    vPos += (addressLines.length * 4); 
  }
  
  if (customerDetails.phone && customerDetails.phone.trim() !== '') {
    vPos += 5;
    doc.text(`Phone: ${customerDetails.phone}`, 14, vPos);
  }
  
  if (customerDetails.gstin && customerDetails.gstin.trim() !== '') {
    vPos += 5;
    doc.text(`GSTIN: ${customerDetails.gstin}`, 14, vPos);
  }
  
  if (customerDetails.dlNumber && customerDetails.dlNumber.trim() !== '') {
    vPos += 5;
    doc.text(`DL No: ${customerDetails.dlNumber}`, 14, vPos);
  }


  // --- 4. ITEMS TABLE ---
  const tableHead = [['S.No', 'Item Description', 'Batch', 'Expiry', 'HSN', 'Qty', 'MRP', 'GST %', 'CGST', 'SGST', 'Amount']];
  
  const tableBody = cartItems.map((item, index) => {
    const itemSubtotal = (item.price || 0) * (item.quantity || 0);
    const gstRate = parseFloat(item.gstRate) || 0;
    const gstAmount = itemSubtotal * (gstRate / 100);
    const cgst = (gstAmount / 2).toFixed(2);
    const sgst = (gstAmount / 2).toFixed(2);
    
    return [
      index + 1,
      item.brandName,
      item.batchId,
      item.expiryDate ? formatDate(item.expiryDate) : 'N/A', 
      item.hsnCode || 'N/A',
      item.quantity,
      item.price.toFixed(2),
      item.gstRate ? `${item.gstRate}%` : '0%',
      cgst,
      sgst,
      (itemSubtotal).toFixed(2)
    ];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: vPos + 5, 
    theme: 'grid',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontSize: 8.5, cellPadding: 1.5 },
    bodyStyles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
        0: { halign: 'center', cellWidth: 10 }, // S.No
        1: { cellWidth: 35 }, // Description
        2: { cellWidth: 18 }, // Batch
        3: { cellWidth: 18 }, // Expiry
        4: { cellWidth: 15 }, // HSN
        5: { halign: 'right', cellWidth: 10 }, // Qty
        6: { halign: 'right', cellWidth: 15 }, // MRP (Rate)
        7: { halign: 'right', cellWidth: 12 }, // GST %
        8: { halign: 'right', cellWidth: 15 }, // CGST
        9: { halign: 'right', cellWidth: 15 }, // SGST
        10: { halign: 'right', cellWidth: 20 }, // Amount
    }
  });

  // --- 5. TOTALS, HSN SUMMARY, AND AMOUNT IN WORDS ---
  let finalY = doc.lastAutoTable.finalY + 5;
  
  if (finalY > pageHeight - 80) { // Need more space for all footer content
    doc.addPage();
    finalY = 20; 
  }
  
  // --- *** NEW: HSN/SAC Summary Table *** ---
  const hsnSummaryData = buildHsnSummary(cartItems, parseFloat(invoiceDetails.discount) || 0);
  const hsnHead = [['HSN/SAC', 'Taxable Value', 'CGST Rate', 'CGST Amt', 'SGST Rate', 'SGST Amt', 'Total Tax']];
  const hsnBody = hsnSummaryData.map(item => [
    item.hsn,
    item.taxableAmount.toFixed(2),
    `${(item.gstRate / 2).toFixed(1)}%`,
    item.cgst.toFixed(2),
    `${(item.gstRate / 2).toFixed(1)}%`,
    item.sgst.toFixed(2),
    (item.cgst + item.sgst).toFixed(2)
  ]);
  
  autoTable(doc, {
    head: hsnHead,
    body: hsnBody,
    startY: finalY,
    theme: 'grid',
    headStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0], fontSize: 8, cellPadding: 1.5, halign: 'center' },
    bodyStyles: { fontSize: 8, cellPadding: 1.5, halign: 'right' },
    columnStyles: { 0: { halign: 'left' } },
    tableWidth: 110, // Wider table
    margin: { left: 14 },
  });
  
  // --- *** NEW: Amount in Words *** ---
  const amountInWords = toWords.convert(totals.finalTotal);
  finalY = doc.lastAutoTable.finalY + 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text("Amount in Words:", 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(`INR ${amountInWords}`, 40, finalY);
  
  // --- Totals Table (Right Side) ---
  autoTable(doc, {
    body: [
      ['Subtotal:', totals.subtotal.toFixed(2)],
      ['Discount:', `- ${totals.discountAmount.toFixed(2)}`],
      ['Taxable Amount:', totals.taxableAmount.toFixed(2)],
      ['CGST:', totals.cgstTotal.toFixed(2)], 
      ['SGST:', totals.sgstTotal.toFixed(2)], 
      ['Round Off:', totals.roundOff.toFixed(2)],
      ['Net Amount:', totals.finalTotal.toFixed(2)],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: { 
      0: { fontStyle: 'bold', halign: 'right' },
      1: { halign: 'right' }
    },
    didParseCell: (data) => {
        if (data.cell.raw === 'Net Amount:') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 12;
        }
         if (data.cell.raw.toString().includes(totals.finalTotal.toFixed(2)) && data.row.index === 6) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 12;
        }
    },
    tableWidth: 80,
    margin: { left: pageWidth - 94 }, 
    startY: doc.lastAutoTable.finalY - 45, // Move totals up to align with HSN
  });

  // --- 6. FOOTER ---
  vPos = pageHeight - 20; 
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // --- *** NEW: Permanent Footer Text *** ---
  doc.text("Once Goods Sold Can not be taken back.", 14, vPos - 5);
  doc.text(`For ${customerDetails.name || 'Customer'}`, 14, vPos);
  
  if (invoiceDetails.noteType === 'thank_you') {
     doc.text("Thank You! Visit Again!", pageWidth / 2, vPos, { align: 'center' });
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text("For Aarogya Medical", rightAlignX, vPos, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text("Authorized Signatory", rightAlignX, vPos + 5, { align: 'right' });

  // --- 7. SAVE ---
  doc.save(`${newTransaction.invoice}.pdf`);
};