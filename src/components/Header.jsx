import React from 'react';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';

export default function Header() {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search..." className="bg-gray-100 rounded-lg pl-10 pr-4 py-2 w-80 text-sm focus:outline-none" />
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <FiShoppingCart className="text-gray-600 w-6 h-6 cursor-pointer" />
          <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs rounded-full">3</span>
        </div>
        <div className="flex items-center">
          <div className="w-9 h-9 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-600 mr-3">JD</div>
          <div><div className="text-sm text-gray-500">Pharmacist</div></div>
        </div>
      </div>
    </header>
  );
}