import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Card, CardContent } from '../ui/Card'
import { permissionManager } from '../../utils/permissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredRole?: string
  requiredRoles?: string[]
  fallback?: React.ReactNode
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiredRoles,
  fallback,
  redirectTo = '/unauthorized',
}) => {
  const location = useLocation()

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('token')

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check permission
  if (requiredPermission && !permissionManager.hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <Navigate to={redirectTo} replace />
  }

  // Check single role
  if (requiredRole && !permissionManager.hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <Navigate to={redirectTo} replace />
  }

  // Check multiple roles
  if (requiredRoles && !permissionManager.hasAnyRole(requiredRoles)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

// Higher-order component for permission-based rendering
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    if (permissionManager.hasPermission(requiredPermission)) {
      return <Component {...props} />
    }
    
    if (fallback) {
      return <>{fallback}</>
    }
    
    return null
  }
}

// Higher-order component for role-based rendering
export const withRole = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string,
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    if (permissionManager.hasRole(requiredRole)) {
      return <Component {...props} />
    }
    
    if (fallback) {
      return <>{fallback}</>
    }
    
    return null
  }
}

// Higher-order component for multiple roles
export const withAnyRole = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: string[],
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    if (permissionManager.hasAnyRole(requiredRoles)) {
      return <Component {...props} />
    }
    
    if (fallback) {
      return <>{fallback}</>
    }
    
    return null
  }
}

// Permission-based conditional rendering component
export const PermissionGate: React.FC<{
  permission?: string
  role?: string
  roles?: string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}> = ({ permission, role, roles, fallback, children }) => {
  let hasAccess = true

  if (permission && !permissionManager.hasPermission(permission)) {
    hasAccess = false
  }

  if (role && !permissionManager.hasRole(role)) {
    hasAccess = false
  }

  if (roles && !permissionManager.hasAnyRole(roles)) {
    hasAccess = false
  }

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return null
}

// Unauthorized page component
export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
