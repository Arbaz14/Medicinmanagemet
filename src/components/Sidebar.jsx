import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { RxDashboard } from 'react-icons/rx';
import { FiBox, FiRepeat, FiShoppingCart, FiFileText } from 'react-icons/fi';

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const linkClasses = "flex items-center py-2 px-3 rounded-md transition-colors";
  const activeClasses = "bg-blue-700 font-semibold";
  const inactiveClasses = "hover:bg-blue-700";

  return (
    <div className="bg-blue-600 text-white w-64 p-4 flex flex-col">
      <div className="text-white text-2xl font-extrabold px-2 mb-10">PharmaCo</div>
      <nav>
        <ul>
          <li className="mb-2">
            <Link to="/" className={`${linkClasses} ${currentPath === '/' ? activeClasses : inactiveClasses}`}>
              <RxDashboard className="mr-3" /> Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/inventory" className={`${linkClasses} ${currentPath === '/inventory' ? activeClasses : inactiveClasses}`}>
              <FiBox className="mr-3" /> Inventory
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/restock" className={`${linkClasses} ${currentPath === '/restock' ? activeClasses : inactiveClasses}`}>
              <FiRepeat className="mr-3" /> Restock
            </Link>
          </li>
           <li className="mb-2">
            <Link to="/checkout" className={`${linkClasses} ${currentPath === '/checkout' ? activeClasses : inactiveClasses}`}>
              <FiShoppingCart className="mr-3" /> Cart
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/transactions" className={`${linkClasses} ${currentPath === '/transactions' ? activeClasses : inactiveClasses}`}>
              <FiFileText className="mr-3" /> Transactions
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}