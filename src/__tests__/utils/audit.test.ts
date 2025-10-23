import { auditLogger, auditHelpers } from '../../utils/audit'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Audit Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@user.com',
    }))
  })

  describe('logCreate', () => {
    it('should log create action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditLogger.logCreate('Company', '1', { name: 'Test Company' }, 'Created company')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'Company',
          entityId: '1',
          action: 'CREATE',
          description: 'Created company',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('logUpdate', () => {
    it('should log update action with changes', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      const oldData = { name: 'Old Company', email: 'old@company.com' }
      const newData = { name: 'New Company', email: 'new@company.com' }
      
      auditLogger.logUpdate('Company', '1', oldData, newData, 'Updated company')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'Company',
          entityId: '1',
          action: 'UPDATE',
          changes: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              oldValue: 'Old Company',
              newValue: 'New Company',
            }),
            expect.objectContaining({
              field: 'email',
              oldValue: 'old@company.com',
              newValue: 'new@company.com',
            }),
          ]),
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('logDelete', () => {
    it('should log delete action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditLogger.logDelete('Company', '1', { name: 'Test Company' }, 'Deleted company')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'Company',
          entityId: '1',
          action: 'DELETE',
          description: 'Deleted company',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('logView', () => {
    it('should log view action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditLogger.logView('Company', '1', 'Viewed company')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'Company',
          entityId: '1',
          action: 'VIEW',
          description: 'Viewed company',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('logExport', () => {
    it('should log export action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditLogger.logExport('Company', 'pdf', { status: 'active' }, 'Exported companies')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'Company',
          entityId: 'bulk',
          action: 'EXPORT',
          description: 'Exported companies',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('logLogin', () => {
    it('should log login action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditLogger.logLogin('1', 'Test User', 'test@user.com')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'User',
          entityId: '1',
          action: 'LOGIN',
          description: 'User Test User logged in',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('logLogout', () => {
    it('should log logout action', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditLogger.logLogout('1', 'Test User', 'test@user.com')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'User',
          entityId: '1',
          action: 'LOGOUT',
          description: 'User Test User logged out',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('calculateChanges', () => {
    it('should calculate changes between old and new data', () => {
      const oldData = { name: 'Old', email: 'old@test.com', id: '1' }
      const newData = { name: 'New', email: 'new@test.com', id: '1' }
      
      const changes = auditLogger['calculateChanges'](oldData, newData)
      
      expect(changes).toHaveLength(2)
      expect(changes[0]).toEqual({
        field: 'name',
        oldValue: 'Old',
        newValue: 'New',
        type: 'string',
      })
      expect(changes[1]).toEqual({
        field: 'email',
        oldValue: 'old@test.com',
        newValue: 'new@test.com',
        type: 'string',
      })
    })

    it('should exclude updatedAt and updatedBy fields', () => {
      const oldData = { name: 'Old', updatedAt: '2024-01-01', updatedBy: 'user1' }
      const newData = { name: 'New', updatedAt: '2024-01-02', updatedBy: 'user2' }
      
      const changes = auditLogger['calculateChanges'](oldData, newData)
      
      expect(changes).toHaveLength(1)
      expect(changes[0].field).toBe('name')
    })
  })

  describe('getFieldType', () => {
    it('should return correct field types', () => {
      expect(auditLogger['getFieldType']('string')).toBe('string')
      expect(auditLogger['getFieldType'](123)).toBe('number')
      expect(auditLogger['getFieldType'](true)).toBe('boolean')
      expect(auditLogger['getFieldType']({})).toBe('object')
      expect(auditLogger['getFieldType']([])).toBe('array')
      expect(auditLogger['getFieldType'](null)).toBe('object')
    })
  })

  describe('getLogs', () => {
    it('should return logged entries', () => {
      auditLogger.logCreate('Company', '1', { name: 'Test' })
      
      const logs = auditLogger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].action).toBe('CREATE')
    })
  })

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      auditLogger.logCreate('Company', '1', { name: 'Test' })
      expect(auditLogger.getLogs()).toHaveLength(1)
      
      auditLogger.clearLogs()
      expect(auditLogger.getLogs()).toHaveLength(0)
    })
  })
})

describe('Audit Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@user.com',
    }))
  })

  describe('Company helpers', () => {
    it('should log company create', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditHelpers.logCompanyCreate('1', { name: 'Test Company' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Created company: Test Company',
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should log company update', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditHelpers.logCompanyUpdate('1', { name: 'Old' }, { name: 'New' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Updated company: New',
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('should log company delete', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditHelpers.logCompanyDelete('1', { name: 'Test Company' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Deleted company: Test Company',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Customer helpers', () => {
    it('should log customer operations', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditHelpers.logCustomerCreate('1', { name: 'Test Customer' })
      auditHelpers.logCustomerUpdate('1', { name: 'Old' }, { name: 'New' })
      auditHelpers.logCustomerDelete('1', { name: 'Test Customer' })
      
      expect(consoleSpy).toHaveBeenCalledTimes(3)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Data export helper', () => {
    it('should log data export', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      auditHelpers.logDataExport('Company', 'pdf', 10)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Exported 10 Company records in pdf format',
        })
      )
      
      consoleSpy.mockRestore()
    })
  })
})
