import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ModifierList = React.memo(({ modifiers, setShowModifierModal, handleEditModifier, handleDeleteModifier }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Modifiers</h2>
        <button
          onClick={() => setShowModifierModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Modifier</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modifiers.map((modifier) => (
          <div key={modifier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{modifier.name}</h3>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600" onClick={() => handleEditModifier(modifier)}>
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-red-600"
                  onClick={() => handleDeleteModifier(modifier.id)}
                  title="Delete Modifier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium capitalize">{modifier.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Required:</span>
                <span className="text-sm font-medium">{modifier.required ? 'Yes' : 'No'}</span>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Options:</p>
                <div className="space-y-1">
                  {modifier.options?.map((option, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{option.name}</span>
                      <span className="text-green-600">+₹{option.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ModifierList.displayName = 'ModifierList';

export default ModifierList;