import React from 'react';
import StatCard from './StatCard';
import TransactionTable from './TransactionTable';
import { FiBox, FiCalendar } from 'react-icons/fi';

export default function Dashboard({ transactions }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Medicine" value="12,450" icon={<FiBox />} />
        <StatCard title="Today's Sales" value="₹1,250.75" />
        <StatCard title="Total Revenue" value="₹350,890.00" />
        <StatCard title="Low Stock" value="15" alert={true} />
        <StatCard title="Expiring Soon" value="42" icon={<FiCalendar />} />
      </div>
      <TransactionTable transactions={transactions} />
    </>
  );
}