import React from 'react';
import { FiFilter, FiDownload, FiMoreVertical } from 'react-icons/fi';

const StatusPill = ({ status }) => {
  const styles = { Paid: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700', Failed: 'bg-red-100 text-red-700' };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
};

export default function TransactionTable({ transactions }) {
  // Show only the last 5 transactions on the dashboard
  const recentTransactions = transactions.slice(0, 5);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Transaction History</h2>
        <div>
          <button className="mr-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">Filter</button>
          <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md">Export</button>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            <th className="py-3 font-medium">INVOICE</th>
            <th className="py-3 font-medium">CUSTOMER</th>
            <th className="py-3 font-medium">DATE</th>
            <th className="py-3 font-medium">AMOUNT</th>
            <th className="py-3 font-medium">STATUS</th>
            <th className="py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {recentTransactions.map((tx) => (
            <tr key={tx.invoice} className="border-t border-gray-200">
              <td className="py-4 font-semibold text-gray-700">{tx.invoice}</td>
              <td className="py-4 text-gray-600">{tx.customer}</td>
              <td className="py-4 text-gray-500">{tx.date}</td>
              <td className="py-4 font-semibold text-gray-700">{tx.amount}</td>
              <td className="py-4"><StatusPill status={tx.status} /></td>
              <td className="py-4 text-gray-400 hover:text-gray-600"><FiMoreVertical /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}