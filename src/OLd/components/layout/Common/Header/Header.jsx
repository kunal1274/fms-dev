import React from 'react';
import "./Header.css";
import SubHeader from '../SubHeader/SubHeader';
const Header =  ({ selectoption,selectedOption, breadcrumb })   => {
  return (
    <>
    <header className=" ml-60 fixed top-0 left-0 header_width
     flex justify-between items-center p-4 bg-white shadow z-10">
      <h1 className="text-lg font-semibold">{selectedOption}
    { breadcrumb && <p className="text-sm text-gray-600 ">{selectoption}{">"}{breadcrumb}</p>}
      </h1>
      
      {/* <div className='mt-5 text-left items-left'>{</div> */}
      
      <div className="flex items-center">
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">+ New</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Edit </button> <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Remove</button> <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Export to pdf</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Import to excel</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Export to excel</button>
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded">...</button>
        <button className="bg-orange-400 text-white px-4 py-2 rounded ml-2">?</button>
      </div>
    </header>
        
         </>
  );
};

export default Header;
