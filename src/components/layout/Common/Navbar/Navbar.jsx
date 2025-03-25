  import React from 'react';
  import PropTypes from 'prop-types';

  const NavBar = ({ currentTab, onTabClick }) => {
    return (
      <nav className="flex justify-center space-x-4 p-4 bg-gray-100">
        <ul className="flex space-x-2">
        <li>
          <button
            className={`px-4 py-2 rounded ${currentTab === 'Vehicle' ? 'bg-blue-500 text-white' : 'bg-white text-black'} hover:bg-gray-300`}
            onClick={() => onTabClick('Vehicle')}
          >
            Vehicle
          </button>
        </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${currentTab === 'Other Details' ? 'bg-blue-500 text-white' : 'bg-white text-black'} hover:bg-gray-300`}
              onClick={() => onTabClick('Other Details')}
            >
              Other Details
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${currentTab === 'Address' ? 'bg-blue-500 text-white' : 'bg-white text-black'} hover:bg-gray-300`}
              onClick={() => onTabClick('Address')}
            >
              Address
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${currentTab === 'Contact Persons' ? 'bg-blue-500 text-white' : 'bg-white text-black'} hover:bg-gray-300`}
              onClick={() => onTabClick('Contact Persons')}
            >
              Contact Persons
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${currentTab === 'Custom Fields' ? 'bg-blue-500 text-white' : 'bg-white text-black'} hover:bg-gray-300`}
              onClick={() => onTabClick('Custom Fields')}
            >
              Custom Fields
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${currentTab === 'Reporting Tags' ? 'bg-blue-500 text-white' : 'bg-white text-black'} hover:bg-gray-300`}
              onClick={() => onTabClick('Reporting Tags')}
            >
              Reporting Tags
            </button>
          </li>
          <li>
            <button
              className={`px-4 py-2 rounded ${currentTab === 'Remarks' ? 'bg-blue-500 text-white' : 'bg-white text-black'} hover:bg-gray-300`}
              onClick={() => onTabClick('Remarks')}
            >
              Remarks
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  NavBar.propTypes = {
    currentTab: PropTypes.string.isRequired,
    onTabClick: PropTypes.func.isRequired,
  };

  export default NavBar;
