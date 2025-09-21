import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ComboList = React.memo(({ combos, setShowComboModal, handleEditCombo, handleDeleteCombo }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Combo Meals</h2>
        <button
          onClick={() => setShowComboModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Combo</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map((combo) => (
          <div key={combo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{combo.name}</h3>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600" onClick={() => handleEditCombo(combo)}>
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-red-600"
                  onClick={() => handleDeleteCombo(combo.id)}
                  title="Delete Combo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{combo.description}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="font-semibold text-green-600">₹{combo.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <span className="text-sm font-medium">{combo.discount}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="text-sm font-medium">{combo.items?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ComboList.displayName = 'ComboList';

export default ComboList;