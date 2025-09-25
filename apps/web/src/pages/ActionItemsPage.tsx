import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { actionItemsAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  CheckSquare,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Filter,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  FileText,
  ChevronDown,
} from 'lucide-react';
import type { ActionItem } from '@/types';

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusColors = {
  OPEN: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DISMISSED: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  OPEN: AlertCircle,
  IN_PROGRESS: PlayCircle,
  COMPLETED: CheckCircle,
  DISMISSED: XCircle,
};

interface ActionItemCardProps {
  actionItem: ActionItem;
  onStatusUpdate: (id: number, status: ActionItem['status']) => void;
  isUpdating: boolean;
}

function ActionItemCard({ actionItem, onStatusUpdate, isUpdating }: ActionItemCardProps) {
  const isOverdue = actionItem.due_date && new Date(actionItem.due_date) < new Date() && actionItem.status !== 'COMPLETED';
  const StatusIcon = statusIcons[actionItem.status as keyof typeof statusIcons];

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{actionItem.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{actionItem.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[actionItem.priority as keyof typeof priorityColors]}`}>
              {actionItem.priority}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[actionItem.status as keyof typeof statusColors]}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {actionItem.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {actionItem.assigned_to && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {actionItem.assigned_to}
              </div>
            )}
            {actionItem.due_date && (
              <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar className="w-4 h-4 mr-1" />
                Due {format(new Date(actionItem.due_date), 'MMM d, yyyy')}
                {isOverdue && <span className="ml-1 text-red-600 font-medium">(Overdue)</span>}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Created {format(new Date(actionItem.created_at), 'MMM d, yyyy')}
            </div>
          </div>

          {actionItem.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{actionItem.notes}</p>
            </div>
          )}
        </div>
      </div>

      {actionItem.status !== 'COMPLETED' && actionItem.status !== 'DISMISSED' && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {actionItem.status === 'OPEN' && (
            <button
              onClick={() => onStatusUpdate(actionItem.id, 'IN_PROGRESS')}
              disabled={isUpdating}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              Start
            </button>
          )}
          {(actionItem.status === 'OPEN' || actionItem.status === 'IN_PROGRESS') && (
            <button
              onClick={() => onStatusUpdate(actionItem.id, 'COMPLETED')}
              disabled={isUpdating}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </button>
          )}
          <button
            onClick={() => onStatusUpdate(actionItem.id, 'DISMISSED')}
            disabled={isUpdating}
            className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default function ActionItemsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    search: '',
  });
  
  const [ordering, setOrdering] = useState('-priority');

  const { data: actionItems, isLoading, error } = useQuery(
    ['action-items', filters, ordering],
    () => actionItemsAPI.getActionItems({ 
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      ordering 
    }),
    {
      keepPreviousData: true,
    }
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ActionItem['status'] }) =>
      actionItemsAPI.updateActionItem(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['action-items']);
    },
    onError: (error) => {
      console.error('Failed to update action item:', error);
      alert('Failed to update action item. Please try again.');
    },
  });

  const handleStatusUpdate = (id: number, status: ActionItem['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assigned_to: '',
      search: '',
    });
  };

  const filteredItems = actionItems?.filter(item => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.notes && item.notes.toLowerCase().includes(searchLower))
      );
    }
    return true;
  }) || [];

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load action items. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
          <p className="text-gray-600">Manage and track action items from inspections</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search action items..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Ordering */}
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="-priority">Priority (High to Low)</option>
            <option value="priority">Priority (Low to High)</option>
            <option value="due_date">Due Date (Earliest First)</option>
            <option value="-due_date">Due Date (Latest First)</option>
            <option value="-created_at">Created (Newest First)</option>
            <option value="created_at">Created (Oldest First)</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {isLoading ? 'Loading...' : `${filteredItems.length} action item${filteredItems.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Action Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((actionItem) => (
            <ActionItemCard
              key={actionItem.id}
              actionItem={actionItem}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={updateStatusMutation.isLoading}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No action items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeFiltersCount > 0 
              ? 'Try adjusting your filters to see more results.'
              : 'Action items will appear here when inspections are completed.'
            }
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
