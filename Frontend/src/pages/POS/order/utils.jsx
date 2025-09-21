import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import React  from 'react';

export const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'CONFIRMED':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'PREPARING':
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case 'READY':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'LOW': return 'bg-gray-100 text-gray-800';
    case 'NORMAL': return 'bg-blue-100 text-blue-800';
    case 'HIGH': return 'bg-yellow-100 text-yellow-800';
    case 'URGENT': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800';
    case 'PREPARING':
      return 'bg-orange-100 text-orange-800';
    case 'READY':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getTypeColor = (type) => {
  switch (type) {
    case 'dine-in':
      return 'bg-blue-100 text-blue-800';
    case 'takeaway':
      return 'bg-green-100 text-green-800';
    case 'delivery':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};