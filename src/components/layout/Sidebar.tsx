import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  HomeIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Company',
    href: '/company',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: CubeIcon,
    children: [
      { name: 'Items', href: '/inventory/items' },
      { name: 'Categories', href: '/inventory/categories' },
      { name: 'Stock', href: '/inventory/stock' },
    ],
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingCartIcon,
    children: [
      { name: 'Orders', href: '/sales/orders' },
      { name: 'Invoices', href: '/sales/invoices' },
      { name: 'Customers', href: '/sales/customers' },
    ],
  },
  {
    name: 'Purchase',
    href: '/purchase',
    icon: ShoppingBagIcon,
    children: [
      { name: 'Orders', href: '/purchase/orders' },
      { name: 'Receipts', href: '/purchase/receipts' },
      { name: 'Vendors', href: '/purchase/vendors' },
    ],
  },
  {
    name: 'Finance',
    href: '/finance',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Accounts', href: '/finance/accounts' },
      { name: 'Transactions', href: '/finance/transactions' },
      { name: 'Reports', href: '/finance/reports' },
    ],
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
  },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4 shadow-lg">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ERP System
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={cn(
                              'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                              isActive(item.href) && 'bg-gray-50 dark:bg-gray-800 text-primary'
                            )}
                          >
                            <item.icon
                              className="h-6 w-6 shrink-0"
                              aria-hidden="true"
                            />
                            {item.name}
                            <ChevronRightIcon
                              className={cn(
                                'ml-auto h-5 w-5 transition-transform',
                                expandedItems.includes(item.name) && 'rotate-90'
                              )}
                            />
                          </button>
                          {expandedItems.includes(item.name) && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {item.children.map((child) => (
                                <li key={child.name}>
                                  <Link
                                    to={child.href}
                                    className={cn(
                                      'group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                                      isActive(child.href) && 'bg-gray-50 dark:bg-gray-800 text-primary'
                                    )}
                                    onClick={onClose}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                            isActive(item.href) && 'bg-gray-50 dark:bg-gray-800 text-primary'
                          )}
                          onClick={onClose}
                        >
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        isOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl">
          <div className="flex h-16 shrink-0 items-center px-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ERP System
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col px-6 pb-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={cn(
                              'group flex w-full items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                              isActive(item.href) && 'bg-gray-50 dark:bg-gray-800 text-primary'
                            )}
                          >
                            <item.icon
                              className="h-6 w-6 shrink-0"
                              aria-hidden="true"
                            />
                            {item.name}
                            <ChevronRightIcon
                              className={cn(
                                'ml-auto h-5 w-5 transition-transform',
                                expandedItems.includes(item.name) && 'rotate-90'
                              )}
                            />
                          </button>
                          {expandedItems.includes(item.name) && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {item.children.map((child) => (
                                <li key={child.name}>
                                  <Link
                                    to={child.href}
                                    className={cn(
                                      'group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                                      isActive(child.href) && 'bg-gray-50 dark:bg-gray-800 text-primary'
                                    )}
                                    onClick={onClose}
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                            isActive(item.href) && 'bg-gray-50 dark:bg-gray-800 text-primary'
                          )}
                          onClick={onClose}
                        >
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar