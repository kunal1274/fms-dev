import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { HomeIcon } from '@heroicons/react/24/outline'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-600">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild>
            <Link to="/dashboard">
              <HomeIcon className="h-4 w-4 mr-2" />
              Go back home
            </Link>
          </Button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            If you think this is an error, please contact support.
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound