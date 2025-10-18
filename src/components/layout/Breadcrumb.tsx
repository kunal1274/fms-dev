import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

const Breadcrumb: React.FC = () => {
  const location = useLocation()
  
  const pathSegments = location.pathname
    .split('/')
    .filter(segment => segment !== '')
    .map(segment => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + location.pathname.split('/').slice(0, location.pathname.split('/').indexOf(segment) + 1).join('/')
    }))

  if (pathSegments.length === 0) return null

  return (
    <nav className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 px-4 sm:px-6 lg:px-8 py-3">
        <li>
          <Link
            to="/dashboard"
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {pathSegments.map((segment, index) => (
          <li key={segment.href}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400 mx-2"
                aria-hidden="true"
              />
              {index === pathSegments.length - 1 ? (
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {segment.name}
                </span>
              ) : (
                <Link
                  to={segment.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {segment.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb