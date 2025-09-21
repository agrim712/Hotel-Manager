import React from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

const CategoryList = React.memo(({ categories, setShowCategoryModal, handleEditCategory, handleDeleteCategory }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Menu Categories</h2>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-1 text-gray-400 hover:text-gray-600" 
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-red-600" 
                  onClick={() => handleDeleteCategory(category.id)}
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{category.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {category.menuItems?.length || 0} items
              </span>
              <div
                className={`flex items-center space-x-1 ${
                  category.isActive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-xs">{category.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

CategoryList.displayName = 'CategoryList';

export default CategoryList;