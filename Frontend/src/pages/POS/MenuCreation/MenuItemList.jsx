import React from 'react';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, ChefHat } from 'lucide-react';

const MenuItemList = ({ categories, setShowItemModal, handleEditItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
        <button
          onClick={() => {
            setShowItemModal(true);
            handleEditItem(null); // Clear editing state for new item
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            <div className="p-4">
              {category.menuItems?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.menuItems.map((item) => (
                    // Changed: Apply a conditional background color and border to the card
                    <div 
                      key={item.id} 
                      className={`rounded-lg p-4 border-2 ${
                        item.vegetarian 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-green-600">₹{item.basePrice}</span>
                        <div
                          className={`flex items-center space-x-1 ${
                            item.isAvailable ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {item.isAvailable ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          <span className="text-xs">{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p>Prep Time: {item.prepTime} mins</p>
                        {item.allergens && item.allergens.length > 0 && (
                          <p>Allergens: {item.allergens.join(', ')}</p>
                        )}
                        <p>Spice Level: {item.spiceLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No items in this category</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItemList;