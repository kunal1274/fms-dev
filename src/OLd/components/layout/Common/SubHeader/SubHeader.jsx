import React from 'react'

const SubHeader = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
    {/* Left side: Search bar */}
    <div className="flex items-center space-x-2">
      <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a4 4 0 100-8 4 4 0 000 8zM8 14v7m8 0v-7m-8-3a4 4 0 00-3.995 3.8L4 14v7m8 0v-7m0 7h8" />
        </svg>
      </button>
      <div className="relative">
        <input
          type="text"
          placeholder="Search in Customers ( / )"
          className="py-2 px-4 pl-10 pr-4 border rounded-full bg-gray-100 focus:bg-white focus:border-gray-300 focus:outline-none"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11a4 4 0 100-8 4 4 0 000 8zM8 14v7m8 0v-7m-8-3a4 4 0 00-3.995 3.8L4 14v7m8 0v-7m0 7h8" />
        </svg>
      </div>
    </div>

    {/* Right side: Status, icons, and profile */}
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-500">You are currently in the...</span>
      <button className="text-blue-600">Upgrade</button>
      <div className="relative">
        <button className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a4 4 0 100-8 4 4 0 000 8zM8 14v7m8 0v-7m-8-3a4 4 0 00-3.995 3.8L4 14v7m8 0v-7m0 7h8" />
          </svg>
        </button>
      </div>
      <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a4 4 0 100-8 4 4 0 000 8zM8 14v7m8 0v-7m-8-3a4 4 0 00-3.995 3.8L4 14v7m8 0v-7m0 7h8" />
        </svg>
      </button>
      <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a4 4 0 100-8 4 4 0 000 8zM8 14v7m8 0v-7m-8-3a4 4 0 00-3.995 3.8L4 14v7m8 0v-7m0 7h8" />
        </svg>
      </button>
      <div className="relative">
        <button className="flex items-center p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a4 4 0 100-8 4 4 0 000 8zM8 14v7m8 0v-7m-8-3a4 4 0 00-3.995 3.8L4 14v7m8 0v-7m0 7h8" />
          </svg>
        </button>
      </div>
    </div>
  </header>
  )
}

export default SubHeader
