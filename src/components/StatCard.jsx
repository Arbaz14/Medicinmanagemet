import React from 'react';

export default function StatCard({ title, value, icon, alert }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md flex flex-col justify-between">
      <div className="text-gray-500 text-sm font-medium">{title}</div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {icon && <div className="text-gray-400 text-2xl">{icon}</div>}
        {alert && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
      </div>
    </div>
  );
}