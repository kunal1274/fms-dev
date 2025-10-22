import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input, Select, FormGroup, FormRow } from '../ui/Form'
import { PlusIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface WorkflowManagerProps {
  onSaveWorkflow: (workflow: WorkflowConfig) => void
  onDeleteWorkflow: (workflowId: string) => void
}

interface WorkflowConfig {
  id: string
  name: string
  description: string
  type: string
  status: 'active' | 'inactive'
  steps: WorkflowStep[]
  conditions: WorkflowCondition[]
}

interface WorkflowStep {
  id: string
  name: string
  type: 'approval' | 'notification' | 'action'
  assignee: string
  order: number
  conditions?: string[]
}

interface WorkflowCondition {
  id: string
  field: string
  operator: string
  value: string
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  onSaveWorkflow,
  onDeleteWorkflow,
}) => {
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([
    {
      id: '1',
      name: 'Purchase Order Approval',
      description: 'Standard approval workflow for purchase orders',
      type: 'purchase',
      status: 'active',
      steps: [
        {
          id: '1',
          name: 'Manager Approval',
          type: 'approval',
          assignee: 'manager@company.com',
          order: 1,
        },
        {
          id: '2',
          name: 'Finance Approval',
          type: 'approval',
          assignee: 'finance@company.com',
          order: 2,
        },
      ],
      conditions: [
        {
          id: '1',
          field: 'amount',
          operator: 'greater_than',
          value: '1000',
        },
      ],
    },
  ])

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const workflowTypes = [
    { value: 'purchase', label: 'Purchase Orders' },
    { value: 'sales', label: 'Sales Orders' },
    { value: 'expense', label: 'Expense Claims' },
    { value: 'leave', label: 'Leave Requests' },
    { value: 'invoice', label: 'Invoice Approval' },
  ]

  const stepTypes = [
    { value: 'approval', label: 'Approval' },
    { value: 'notification', label: 'Notification' },
    { value: 'action', label: 'Action' },
  ]

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
  ]

  const handleCreateWorkflow = () => {
    const newWorkflow: WorkflowConfig = {
      id: Date.now().toString(),
      name: '',
      description: '',
      type: 'purchase',
      status: 'active',
      steps: [],
      conditions: [],
    }
    setSelectedWorkflow(newWorkflow)
    setIsEditing(true)
  }

  const handleEditWorkflow = (workflow: WorkflowConfig) => {
    setSelectedWorkflow(workflow)
    setIsEditing(true)
  }

  const handleSaveWorkflow = () => {
    if (selectedWorkflow) {
      onSaveWorkflow(selectedWorkflow)
      setIsEditing(false)
      setSelectedWorkflow(null)
    }
  }

  const handleDeleteWorkflow = (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      onDeleteWorkflow(workflowId)
      setWorkflows(prev => prev.filter(w => w.id !== workflowId))
    }
  }

  const addStep = () => {
    if (selectedWorkflow) {
      const newStep: WorkflowStep = {
        id: Date.now().toString(),
        name: '',
        type: 'approval',
        assignee: '',
        order: selectedWorkflow.steps.length + 1,
      }
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        steps: [...prev.steps, newStep]
      } : null)
    }
  }

  const removeStep = (stepId: string) => {
    if (selectedWorkflow) {
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        steps: prev.steps.filter(s => s.id !== stepId)
      } : null)
    }
  }

  const updateStep = (stepId: string, field: string, value: string) => {
    if (selectedWorkflow) {
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        steps: prev.steps.map(step =>
          step.id === stepId ? { ...step, [field]: value } : step
        )
      } : null)
    }
  }

  const addCondition = () => {
    if (selectedWorkflow) {
      const newCondition: WorkflowCondition = {
        id: Date.now().toString(),
        field: '',
        operator: 'equals',
        value: '',
      }
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        conditions: [...prev.conditions, newCondition]
      } : null)
    }
  }

  const removeCondition = (conditionId: string) => {
    if (selectedWorkflow) {
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        conditions: prev.conditions.filter(c => c.id !== conditionId)
      } : null)
    }
  }

  const updateCondition = (conditionId: string, field: string, value: string) => {
    if (selectedWorkflow) {
      setSelectedWorkflow(prev => prev ? {
        ...prev,
        conditions: prev.conditions.map(condition =>
          condition.id === conditionId ? { ...condition, [field]: value } : condition
        )
      } : null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Workflow List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {workflow.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWorkflow(workflow)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="capitalize">{workflow.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Steps:</span>
                  <span>{workflow.steps.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      workflow.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {workflow.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Workflow Button */}
      <div className="flex justify-center">
        <Button onClick={handleCreateWorkflow}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Workflow
        </Button>
      </div>

      {/* Workflow Editor Modal */}
      {isEditing && selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedWorkflow.id ? 'Edit Workflow' : 'Create Workflow'}
                </h2>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <FormGroup>
                  <FormRow>
                    <FormField label="Workflow Name" required>
                      <Input
                        value={selectedWorkflow.name}
                        onChange={(e) => setSelectedWorkflow(prev => prev ? {
                          ...prev,
                          name: e.target.value
                        } : null)}
                        placeholder="Enter workflow name"
                      />
                    </FormField>
                    <FormField label="Workflow Type" required>
                      <Select
                        value={selectedWorkflow.type}
                        onChange={(e) => setSelectedWorkflow(prev => prev ? {
                          ...prev,
                          type: e.target.value
                        } : null)}
                        options={workflowTypes}
                        placeholder="Select workflow type"
                      />
                    </FormField>
                  </FormRow>
                  <FormField label="Description">
                    <Input
                      value={selectedWorkflow.description}
                      onChange={(e) => setSelectedWorkflow(prev => prev ? {
                        ...prev,
                        description: e.target.value
                      } : null)}
                      placeholder="Enter workflow description"
                    />
                  </FormField>
                </FormGroup>

                {/* Workflow Steps */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workflow Steps</h3>
                    <Button variant="outline" size="sm" onClick={addStep}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Step {step.order}
                          </h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormGroup>
                          <FormRow>
                            <FormField label="Step Name" required>
                              <Input
                                value={step.name}
                                onChange={(e) => updateStep(step.id, 'name', e.target.value)}
                                placeholder="Enter step name"
                              />
                            </FormField>
                            <FormField label="Step Type" required>
                              <Select
                                value={step.type}
                                onChange={(e) => updateStep(step.id, 'type', e.target.value)}
                                options={stepTypes}
                                placeholder="Select step type"
                              />
                            </FormField>
                          </FormRow>
                          <FormField label="Assignee" required>
                            <Input
                              value={step.assignee}
                              onChange={(e) => updateStep(step.id, 'assignee', e.target.value)}
                              placeholder="Enter assignee email"
                            />
                          </FormField>
                        </FormGroup>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Conditions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Conditions</h3>
                    <Button variant="outline" size="sm" onClick={addCondition}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {selectedWorkflow.conditions.map((condition, index) => (
                      <div key={condition.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Input
                          value={condition.field}
                          onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                          placeholder="Field name"
                        />
                        <Select
                          value={condition.operator}
                          onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                          options={operators}
                          placeholder="Operator"
                        />
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                          placeholder="Value"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCondition(condition.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveWorkflow}>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Workflow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowManager
