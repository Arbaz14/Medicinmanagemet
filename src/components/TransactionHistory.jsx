import React, { useState, useMemo } from 'react';
import { FiSearch, FiDownload, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 

const formatDate = (dateString) => { return new Date(dateString.replace(/(\w{3}) (\d{2}), (\d{4})/, '$1 $2 $4')); };

const StatusPill = ({ status }) => {
  const styles = { 
    Paid: 'bg-green-100 text-green-700', 
    Pending: 'bg-yellow-100 text-yellow-700', 
    Failed: 'bg-red-100 text-red-700',
    Updated: 'bg-blue-100 text-blue-700', 
    Deleted: 'bg-gray-200 text-gray-700'
  };
  // Use 'Updated' for 'Pending' and 'Deleted' for 'Failed'
  const displayStatus = status === 'Failed' ? 'Deleted' : (status === 'Pending' ? 'Updated' : status);
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.Updated}`}>{displayStatus}</span>;
};

// Helper function to process the display values for administrative/metadata transactions
const getDisplayDetails = (tx) => {
    // New: Batch Admin Update
    if (tx.invoice.startsWith('#BAT-')) {
        return {
            amount: 'Batch Admin Change',
            status: 'Pending', // Corresponds to Updated StatusPill style
        };
    }
    // Metadata Update
    if (tx.invoice.startsWith('#MED-')) {
        return {
            amount: 'Metadata Change',
            status: 'Pending', // Corresponds to Updated StatusPill style
        };
    }
    // Medicine Delete
    if (tx.invoice.startsWith('#DEL-')) {
        return {
            amount: 'Record Removed',
            status: 'Deleted', 
        };
    }
    // Batch Remove
    if (tx.invoice.startsWith('#REM-')) {
        return {
            amount: 'Batch Removed',
            status: 'Pending', // Corresponds to Updated StatusPill style
        };
    }
    // Medicine Add
    if (tx.invoice.startsWith('#ADD-')) {
        return {
            amount: tx.amount, // Show initial cost
            status: 'Paid', // Treat as a 'purchase'
        };
    }
    // Standard transactions (INV/SUP)
    return {
        amount: tx.amount,
        status: tx.status,
    };
};

export default function TransactionHistory({ transactions }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    if (searchQuery) { 
        filtered = filtered.filter(tx => 
            tx.invoice.toLowerCase().includes(searchQuery.toLowerCase()) || 
            tx.customer.toLowerCase().includes(searchQuery.toLowerCase())
        ); 
    }
    if (startDate && endDate) { filtered = filtered.filter(tx => { const txDate = formatDate(tx.date); return txDate >= startDate && txDate <= endDate; }); }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]; let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'date') { 
            aValue = formatDate(aValue); bValue = formatDate(bValue); 
        } else if (sortConfig.key === 'amount') { 
            aValue = parseFloat(String(aValue).replace(/[^0-9.-]+/g, "")) || 0; 
            bValue = parseFloat(String(bValue).replace(/[^0-9.-]+/g, "")) || 0; 
        }
        
        if (aValue < bValue) { return sortConfig.direction === 'ascending' ? -1 : 1; }
        if (aValue > bValue) { return sortConfig.direction === 'ascending' ? 1 : -1; }
        return 0;
      });
    }
    return filtered;
  }, [transactions, searchQuery, startDate, endDate, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
    setSortConfig({ key, direction });
  };
  
  const handleExport = () => {
    const headers = ["Invoice", "Customer", "Date", "Amount", "Status"];
    const rows = sortedAndFilteredTransactions.map(tx => {
        const details = getDisplayDetails(tx);
        return [tx.invoice, tx.customer, tx.date, details.amount, details.status].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getSortIcon = (key) => {
      if (sortConfig.key !== key) return null;
      if (sortConfig.direction === 'ascending') return <FiArrowUp className="inline ml-1" />;
      return <FiArrowDown className="inline ml-1" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Transaction History</h1>
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between gap-4">
        <div className="relative w-1/3">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by invoice or customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} placeholderText="Start Date" className="w-full px-4 py-2 border rounded-lg" />
            <span className="text-gray-500">to</span>
             <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} placeholderText="End Date" className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center font-semibold"><FiDownload className="mr-2" /> Export</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-200 text-gray-600">
              <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('invoice')}>Invoice {getSortIcon('invoice')}</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('customer')}>Customer {getSortIcon('customer')}</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('date')}>Date {getSortIcon('date')}</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('amount')}>Amount {getSortIcon('amount')}</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredTransactions.map(tx => {
                const details = getDisplayDetails(tx);
                return (
                    <tr key={tx.invoice} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4 font-semibold text-gray-800">{tx.invoice}</td>
                      <td className="py-4 px-4">{tx.customer}</td>
                      <td classNameI="py-4 px-4 text-gray-600">{tx.date}</td>
                      <td className="py-4 px-4 font-semibold">{details.amount}</td>
                      <td className="py-4 px-4"><StatusPill status={details.status} /></td>
                    </tr>
                );
            })}
          </tbody>
        </table>
        {sortedAndFilteredTransactions.length === 0 && (<p className="text-center text-gray-500 py-16">No transactions found.</p>)}
      </div>
    </div>
  );
}