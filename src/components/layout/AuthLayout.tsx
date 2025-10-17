import React from 'react'
import { cn } from '@/utils/cn'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen">
        {/* Left side - Branding and info */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-12 xl:px-16">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">E</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ERP System
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to the future of business management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Streamline your operations with our comprehensive ERP solution. 
              Manage inventory, sales, purchases, and finances all in one place.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  Complete inventory management
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  Advanced reporting and analytics
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">
                  Real-time collaboration
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">E</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ERP System
                </h1>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout