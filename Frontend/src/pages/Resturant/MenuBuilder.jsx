import React, { useState, useEffect } from 'react';

const MenuBuilder = () => {
  const [categories, setCategories] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    description: '',
    spiceLevel: 'Mild',
    allergens: [],
    vegetarian: false,
    available: true,
    prepTime: 15
  });

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/menu/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Category CRUD operations
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/menu/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      const data = await response.json();
      setCategories([...categories, {...data, items: []}]);
      setNewCategory({ name: '', description: '' });
      setShowAddCategoryModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!newCategory.name.trim() || !selectedCategory) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/menu/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      const data = await response.json();
      
      setCategories(categories.map(cat => 
        cat.id === selectedCategory.id ? {...data, items: cat.items} : cat
      ));
      setShowEditCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const startEditCategory = (category) => {
    setSelectedCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || ''
    });
    setShowEditCategoryModal(true);
  };

  // Item CRUD operations
  const handleAddItem = async () => {
    if (!newItem.name.trim() || newItem.price <= 0 || !selectedCategory) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/menu/categories/${selectedCategory.id}/items`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        }
      );
      const data = await response.json();
      
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            items: [...category.items, data]
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      resetItemForm();
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async () => {
    if (!newItem.name.trim() || newItem.price <= 0 || !selectedItem) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/menu/items/${selectedItem.id}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        }
      );
      const data = await response.json();
      
      const updatedCategories = categories.map(category => {
        if (category.id === selectedItem.categoryId) {
          return {
            ...category,
            items: category.items.map(item => 
              item.id === selectedItem.id ? data : item
            )
          };
        }
        return category;
      });
      
      setCategories(updatedCategories);
      resetItemForm();
      setShowEditItemModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const startEditItem = (item) => {
    setSelectedItem(item);
    setSelectedCategory(categories.find(cat => cat.id === item.categoryId));
    setNewItem({
      name: item.name,
      price: item.price,
      description: item.description,
      spiceLevel: item.spiceLevel,
      allergens: item.allergens,
      vegetarian: item.vegetarian,
      available: item.available,
      prepTime: item.prepTime
    });
    setShowEditItemModal(true);
  };

  const resetItemForm = () => {
    setNewItem({
      name: '',
      price: 0,
      description: '',
      spiceLevel: 'Mild',
      allergens: [],
      vegetarian: false,
      available: true,
      prepTime: 15
    });
  };

  const toggleAllergen = (allergen) => {
    setNewItem(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  // Delete operations
  const handleDeleteCategory = async (categoryId) => {
    try {
      await fetch(`http://localhost:5000/api/menu/categories/${categoryId}`, {
        method: 'DELETE'
      });
      setCategories(categories.filter(category => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await fetch(`http://localhost:5000/api/menu/items/${itemId}`, {
        method: 'DELETE'
      });
      
      const updatedCategories = categories.map(category => {
        return {
          ...category,
          items: category.items.filter(item => item.id !== itemId)
        };
      });
      
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Menu Builder</h1>
          <p className="text-gray-600">Build and organize your restaurant menu</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No categories yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first menu category.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Category
              </button>
            </div>
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <div key={category.id} className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{category.name}</h2>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => startEditCategory(category)}
                      className="text-blue-600 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {category.items.length === 0 ? (
                  <div className="p-8 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding your first menu item to this category.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {category.items.map((item) => (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${item.vegetarian ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {item.vegetarian ? 'Veg' : 'Non-Veg'}
                              </span>
                              {!item.available && (
                                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                  Unavailable
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                              <span className="text-sm text-gray-500">{item.prepTime}m</span>
                              <span className="text-sm text-gray-500">{item.spiceLevel}</span>
                              {item.allergens.map((allergen, i) => (
                                <span key={i} className="text-sm text-gray-500">{allergen}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => startEditItem(item)}
                              className="text-blue-600 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4">
                  <button 
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowAddItemModal(true);
                    }}
                    className="text-blue-600 text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Item
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Add Category
              </button>
            </div>
          </>
        )}

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-2">Add New Category</h2>
              <p className="text-gray-600 text-sm mb-4">Create a new menu category to organize your items</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Appetizers, Main Course"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Brief description of this category"
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim()}
                  className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!newCategory.name.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditCategoryModal && selectedCategory && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-2">Edit Category</h2>
              <p className="text-gray-600 text-sm mb-4">Update the category details</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditCategoryModal(false);
                    setNewCategory({ name: '', description: '' });
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={!newCategory.name.trim()}
                  className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!newCategory.name.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddItemModal && selectedCategory && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-2">Add Menu Item to {selectedCategory.name}</h2>
              <p className="text-gray-600 text-sm mb-4">Add a new item to this category with all required details</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Describe the item ingredients and preparation"
                    rows="3"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newItem.spiceLevel}
                    onChange={(e) => setNewItem({...newItem, spiceLevel: e.target.value})}
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                    <option value="Extra Hot">Extra Hot</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Fish', 'Shellfish', 'Soy'].map((allergen) => (
                      <label key={allergen} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={newItem.allergens.includes(allergen)}
                            onChange={() => toggleAllergen(allergen)}
                          />
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${newItem.allergens.includes(allergen) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} border-2 transition-colors`}>
                            {newItem.allergens.includes(allergen) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-3">Vegetarian:</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${newItem.vegetarian ? 'bg-green-500' : 'bg-red-500'}`}
                        onClick={() => setNewItem({...newItem, vegetarian: !newItem.vegetarian})}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newItem.vegetarian ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="ml-2 text-sm text-gray-700">
                        {newItem.vegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-3">Available:</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${newItem.available ? 'bg-green-500' : 'bg-gray-400'}`}
                        onClick={() => setNewItem({...newItem, available: !newItem.available})}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newItem.available ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newItem.prepTime}
                    onChange={(e) => setNewItem({...newItem, prepTime: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.name.trim() || newItem.price <= 0}
                  className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!newItem.name.trim() || newItem.price <= 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditItemModal && selectedItem && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-2">Edit Menu Item</h2>
              <p className="text-gray-600 text-sm mb-4">Update the item details</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newItem.spiceLevel}
                    onChange={(e) => setNewItem({...newItem, spiceLevel: e.target.value})}
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                    <option value="Extra Hot">Extra Hot</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Fish', 'Shellfish', 'Soy'].map((allergen) => (
                      <label key={allergen} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={newItem.allergens.includes(allergen)}
                            onChange={() => toggleAllergen(allergen)}
                          />
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${newItem.allergens.includes(allergen) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} border-2 transition-colors`}>
                            {newItem.allergens.includes(allergen) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-3">Vegetarian:</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${newItem.vegetarian ? 'bg-green-500' : 'bg-red-500'}`}
                        onClick={() => setNewItem({...newItem, vegetarian: !newItem.vegetarian})}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newItem.vegetarian ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className="ml-2 text-sm text-gray-700">
                        {newItem.vegetarian ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-3">Available:</span>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${newItem.available ? 'bg-green-500' : 'bg-gray-400'}`}
                        onClick={() => setNewItem({...newItem, available: !newItem.available})}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${newItem.available ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={newItem.prepTime}
                    onChange={(e) => setNewItem({...newItem, prepTime: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditItemModal(false);
                    resetItemForm();
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateItem}
                  disabled={!newItem.name.trim() || newItem.price <= 0}
                  className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!newItem.name.trim() || newItem.price <= 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Update Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBuilder;