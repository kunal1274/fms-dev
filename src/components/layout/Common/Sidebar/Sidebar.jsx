
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ setSelectedOption }) => {
  const [showSales, setShowSales] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSales = () => setShowSales(!showSales);
  const togglePurchases = () => setShowPurchases(!showPurchases);

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setShowSales(false);
      setShowPurchases(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option, parentOption = '') => {
    setSelectedOption(option, parentOption);
  };

  return (
    <div ref={sidebarRef} className="fixed top-0 left-0 h-screen w-60 bg-gray-800 text-white flex flex-col pt-16">
      <div className="p-4 font-bold">Menu</div>
      <nav className="flex-1">
        <Link to="/" onClick={() => handleOptionClick('Home')} className="block py-2.5 px-4 hover:bg-gray-700">Home</Link>
        <Link to="/items" onClick={() => handleOptionClick('Items')} className="block py-2.5 px-4 hover:bg-gray-700">Items</Link>
        <Link to="/banking" onClick={() => handleOptionClick('Banking')} className="block py-2.5 px-4 hover:bg-gray-700">Banking</Link>
        <Link to="/purchases/vendors" onClick={() => handleOptionClick('Vendors', 'Purchases')} className="block py-2.5 px-4 hover:bg-gray-600">Vender</Link>
        <div>
          <div
            className="block py-2.5 px-4 hover:bg-gray-700 flex items-center justify-between cursor-pointer"
            onClick={toggleSales}
          >
            Sales
            <FontAwesomeIcon icon={showSales ? faChevronDown : faChevronRight} />
          </div>
          {showSales && (
            <div className="ml-4 bg-gray-700">
              <Link to="/sales/customers" onClick={() => handleOptionClick('Customers', 'Sales')} className="block py-2.5 px-4 hover:bg-gray-600">Customers</Link>
              <Link to="/sales/quotes" onClick={() => handleOptionClick('Quotes', 'Sales')} className="block py-2.5 px-4 hover:bg-gray-600">Quotes</Link>
              <Link to="/sales/sales-orders" onClick={() => handleOptionClick('Sales Orders', 'Sales')} className="block py-2.5 px-4 hover:bg-gray-600">Sales Orders</Link>
              <Link to="/sales/delivery-challans" onClick={() => handleOptionClick('Delivery Challans', 'Sales')} className="block py-2.5 px-4 hover:bg-gray-600">Delivery Challans</Link>
            </div>
          )}
          <div>
  <div
    className="block py-2.5 px-4 hover:bg-gray-700 flex items-center justify-between cursor-pointer"
    onClick={togglePurchases}
  >
    Purchases
    <FontAwesomeIcon icon={showPurchases ? faChevronDown : faChevronRight} />
  </div>
  {showPurchases && (
    <div className="ml-4 bg-gray-700">
      <Link to="/purchases/vendors" onClick={() => handleOptionClick('Vendors', 'Purchases')} className="block py-2.5 px-4 hover:bg-gray-600">Vender</Link>
      <Link to="/purchases/expenses" onClick={() => handleOptionClick('Expenses', 'Purchases')} className="block py-2.5 px-4 hover:bg-gray-600">Expenses</Link>
    </div>
  )}
</div>
        </div>
        <div>
          <div
            className="block py-2.5 px-4 hover:bg-gray-700 flex items-center justify-between cursor-pointer"
            onClick={togglePurchases}
          >
            Purchases
            <FontAwesomeIcon icon={showPurchases ? faChevronDown : faChevronRight} />
          </div>
          {showPurchases && (
            <div className="ml-4 bg-gray-700">
              <Link to="/purchases/vendors" onClick={() => handleOptionClick('Vendors', 'Purchases')} className="block py-2.5 px-4 hover:bg-gray-600">Vendors</Link>
              <Link to="/purchases/expenses" onClick={() => handleOptionClick('Expenses', 'Purchases')} className="block py-2.5 px-4 hover:bg-gray-600">Expenses</Link>
            </div>
          )}
        </div>
        <Link to="/time-tracking" onClick={() => handleOptionClick('Time Tracking')} className="block py-2.5 px-4 hover:bg-gray-700">Time Tracking</Link>
        <Link to="/accountant" onClick={() => handleOptionClick('Accountant')} className="block py-2.5 px-4 hover:bg-gray-700">Accountant</Link>
        <Link to="/reports" onClick={() => handleOptionClick('Reports')} className="block py-2.5 px-4 hover:bg-gray-700">Reports</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
