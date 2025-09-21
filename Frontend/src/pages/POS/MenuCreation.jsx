import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import POSLayout from '../../components/POS/POSLayout';
import CategoryList from './MenuCreation/CategoryList';
import MenuItemList from './MenuCreation/MenuItemList';
import ModifierList from './MenuCreation/ModifierList';
import ComboList from './MenuCreation/ComboList';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  ImageIcon,
  DollarSign,
  Clock,
  Tag,
  ChefHat,
  Package,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';

const MenuCreation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [items, setItems] = useState([]);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    prepTime: 15,
    allergens: '',
    spiceLevel: 'Mild',
    vegetarian: false,
    isAvailable: true,
    code: '',
    numCode: 0,
    images: [],
    modifiers: [],
    calories: null,
    sortOrder: 0,
  });

  const [modifierForm, setModifierForm] = useState({
    name: '',
    type: 'single',
    isRequired: false,
    basePrice: '',
    itemId: ''
  });

  const [comboForm, setComboForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    items: [],
    discount: 0,
    isActive: true,
  });


  const [comboItemSelections, setComboItemSelections] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [showComboModal, setShowComboModal] = useState(false);
  
  // State for edited entities
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingModifier, setEditingModifier] = useState(null);
  const [editingCombo, setEditingCombo] = useState(null);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const API_URL = 'http://localhost:5000/api/pos/menu';

  useEffect(() => {
    fetchMenuData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchMenuData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const [categoriesResponse, itemsResponse, modifiersResponse, combosResponse] = await Promise.all([
        axios.get(`${API_URL}/categories`, { headers }),
        axios.get(`${API_URL}/items`, { headers }),
        axios.get(`${API_URL}/modifiers`, { headers }),
        axios.get(`${API_URL}/combos`, { headers }),
      ]);

      const categoriesData = categoriesResponse.data.data || [];
      const itemsData = itemsResponse.data.data || [];
      const modifiersData = modifiersResponse.data.data || [];
      const combosData = combosResponse.data.data || [];

      setItems(itemsData);
      setModifiers(modifiersData);
      setCombos(combosData);

      const updatedCategories = categoriesData.map(cat => ({
        ...cat,
        menuItems: itemsData.filter(item => item.categoryId === cat.id),
      }));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setError('Failed to load menu data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // --- CATEGORY FUNCTIONS ---
  const handleCreateOrUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const url = editingCategory
        ? `${API_URL}/categories/${editingCategory.id}`
        : `${API_URL}/categories`;
      const method = editingCategory ? 'put' : 'post';

      const response = await axios[method](url, categoryForm, { headers });
      
      if (response.status === 200 || response.status === 201) {
        // Update local state instead of refetching all data
        if (editingCategory) {
          setCategories(prev => prev.map(cat => 
            cat.id === editingCategory.id ? { ...cat, ...categoryForm } : cat
          ));
        } else {
          setCategories(prev => [...prev, response.data.data]);
        }
        setShowCategoryModal(false);
        setEditingCategory(null);
        resetCategoryForm();
      }
    } catch (error) {
      console.error(`Error ${editingCategory ? 'updating' : 'creating'} category:`, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setShowCategoryModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    });
  };

  const handleDeleteCategory = (categoryId) => {
    setConfirmAction({
      type: 'category',
      id: categoryId,
      name: categories.find(cat => cat.id === categoryId)?.name || 'this category',
      action: async () => {
        try {
          setLoading(true);
          const headers = getAuthHeaders();
          await axios.delete(`${API_URL}/categories/${categoryId}`, { headers });
          
          // Update local state
          setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        } catch (error) {
          console.error('Error deleting category:', error.response?.data?.message || error.message);
          alert('Failed to delete category. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // --- MENU ITEM FUNCTIONS ---
  const handleCreateOrUpdateItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    const headers = getAuthHeaders();
    const url = editingItem
      ? `${API_URL}/items/${editingItem.id}`
      : `${API_URL}/items`;
    const method = editingItem ? 'put' : 'post';

    const formData = new FormData();
    formData.append('name', itemForm.name);
    formData.append('description', itemForm.description);
    formData.append('basePrice', itemForm.basePrice);
    formData.append('categoryId', itemForm.categoryId);
    formData.append('prepTime', String(itemForm.prepTime));
    formData.append('spiceLevel', itemForm.spiceLevel);
    formData.append('vegetarian', String(itemForm.vegetarian));
    formData.append('isAvailable', String(itemForm.isAvailable));
    formData.append('code', itemForm.code);
    formData.append('numCode', String(itemForm.numCode));
    if (itemForm.calories !== null) {
      formData.append('calories', String(itemForm.calories));
    }
    formData.append('sortOrder', String(itemForm.sortOrder));

    const allergensArray = itemForm.allergens.split(',').map(s => s.trim()).filter(s => s.length > 0);
    formData.append('allergens', JSON.stringify(allergensArray));

    itemForm.images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
      
        const newItem = response.data.data;
        if (editingItem) {
          setItems(prev => prev.map(item => 
            item.id === editingItem.id ? newItem : item
          ));
          // Update categories with new item data
          setCategories(prev => prev.map(cat => ({
            ...cat,
            menuItems: cat.menuItems.map(item => 
              item.id === editingItem.id ? newItem : item
            )
          })));
        } else {
          setItems(prev => [...prev, newItem]);
          
          setCategories(prev => prev.map(cat => 
            cat.id === newItem.categoryId 
              ? { ...cat, menuItems: [...cat.menuItems, newItem] }
              : cat
          ));
        }
        resetItemForm();
        setShowItemModal(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error(`Failed to ${editingItem ? 'update' : 'create'} item:`, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      ...item,
      allergens: item.allergens.join(', '),
      isAvailable: item.isAvailable,
      prepTime: item.prepTime,
      vegetarian: item.vegetarian,
      spiceLevel: item.spiceLevel,
      basePrice: item.basePrice,
    });
    setShowItemModal(true);
  };

  const resetItemForm = () => {
    setItemForm({
      name: '',
      description: '',
      basePrice: '',
      categoryId: '',
      prepTime: 15,
      allergens: '',
      spiceLevel: 'Mild',
      vegetarian: false,
      isAvailable: true,
      code: '',
      numCode: 0,
      images: [],
      modifiers: [],
      calories: null,
      sortOrder: 0,
    });
  };

  const handleDeleteItem = (itemId) => {
    setConfirmAction({
      type: 'item',
      id: itemId,
      name: items.find(item => item.id === itemId)?.name || 'this menu item',
      action: async () => {
        try {
          setLoading(true);
          const headers = getAuthHeaders();
          await axios.delete(`${API_URL}/items/${itemId}`, { headers });
          
          // Update local state
          setItems(prev => prev.filter(item => item.id !== itemId));
          setCategories(prev => prev.map(cat => ({
            ...cat,
            menuItems: cat.menuItems.filter(item => item.id !== itemId)
          })));
        } catch (error) {
          console.error('Error deleting menu item:', error.response?.data?.message || error.message);
          alert('Failed to delete menu item. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // --- MODIFIER FUNCTIONS ---
  const handleCreateOrUpdateModifier = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const url = editingModifier
        ? `${API_URL}/modifiers/${editingModifier.id}`
        : `${API_URL}/modifiers`;
      const method = editingModifier ? 'put' : 'post';
      const payload = {
        name: modifierForm.name,
        basePrice: modifierForm.basePrice,
        type: modifierForm.type,
        isRequired: modifierForm.isRequired,
        itemId: modifierForm.itemId
      };
      await axios[method](url, payload, { headers });
      await fetchMenuData();
      setShowModifierModal(false);
      setEditingModifier(null);
      resetModifierForm();
    } catch (error) {
      console.error(`Error ${editingModifier ? 'updating' : 'creating'} modifier:`, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditModifier = (modifier) => {
    setEditingModifier(modifier);
    setModifierForm({
      name: modifier.name,
      type: modifier.type,
      isRequired: modifier.isRequired,
      basePrice: modifier.basePrice,
      itemId: modifier.itemId,
    });
    setShowModifierModal(true);
  };

  const resetModifierForm = () => {
    setModifierForm({
      name: '',
      type: 'single',
      isRequired: false,
      basePrice: '',
      itemId: ''
    });
  };

  const handleDeleteModifier = (modifierId) => {
    setConfirmAction({
      type: 'modifier',
      id: modifierId,
      name: modifiers.find(modifier => modifier.id === modifierId)?.name || 'this modifier',
      action: async () => {
        try {
          setLoading(true);
          const headers = getAuthHeaders();
          await axios.delete(`${API_URL}/modifiers/${modifierId}`, { headers });
          
          // Update local state
          setModifiers(prev => prev.filter(modifier => modifier.id !== modifierId));
        } catch (error) {
          console.error('Error deleting modifier:', error.response?.data?.message || error.message);
          alert('Failed to delete modifier. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // --- COMBO FUNCTIONS ---
  const handleCreateOrUpdateCombo = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const url = editingCombo
        ? `${API_URL}/combos/${editingCombo.id}`
        : `${API_URL}/combos`;
      const method = editingCombo ? 'put' : 'post';

      const itemsPayload = Object.entries(comboItemSelections)
        .filter(([_, qty]) => qty && qty > 0)
        .map(([itemId, qty]) => ({ itemId, quantity: parseInt(qty) }));
      const payload = {
        name: comboForm.name,
        description: comboForm.description,
        basePrice: comboForm.basePrice,
        items: JSON.stringify(itemsPayload),
        discount: comboForm.discount,
        isActive: comboForm.isActive,
      };

      await axios[method](url, payload, { headers });
      await fetchMenuData();
      setShowComboModal(false);
      setEditingCombo(null);
      resetComboForm();
    } catch (error) {
      console.error(`Error ${editingCombo ? 'updating' : 'creating'} combo:`, error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCombo = (combo) => {
    setEditingCombo(combo);
    setComboForm({
      name: combo.name,
      description: combo.description,
      basePrice: combo.basePrice,
      discount: combo.discount,
      isActive: combo.isActive,
    });
    
    const selections = combo.items.reduce((acc, curr) => {
      acc[curr.itemId] = curr.quantity;
      return acc;
    }, {});
    setComboItemSelections(selections);

    setShowComboModal(true);
  };

  const resetComboForm = () => {
    setComboForm({
      name: '',
      description: '',
      basePrice: '',
      items: [],
      discount: 0,
      isActive: true,
    });
    setComboItemSelections({});
  };

  const handleDeleteCombo = (comboId) => {
    setConfirmAction({
      type: 'combo',
      id: comboId,
      name: combos.find(combo => combo.id === comboId)?.name || 'this combo',
      action: async () => {
        try {
          setLoading(true);
          const headers = getAuthHeaders();
          await axios.delete(`${API_URL}/combos/${comboId}`, { headers });
          
          // Update local state
          setCombos(prev => prev.filter(combo => combo.id !== comboId));
        } catch (error) {
          console.error('Error deleting combo:', error.response?.data?.message || error.message);
          alert('Failed to delete combo. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirmDialog(true);
  };

  // Other helper functions
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setItemForm({ ...itemForm, images: [...itemForm.images, ...files] });
  };

  const removeImage = (index) => {
    const newImages = itemForm.images.filter((_, i) => i !== index);
    setItemForm({ ...itemForm, images: newImages });
  };

  const addModifierOption = () => {
    setModifierForm({
      ...modifierForm,
      options: [...modifierForm.options, { name: '', price: 0 }],
    });
  };

  const removeModifierOption = (index) => {
    const newOptions = modifierForm.options.filter((_, i) => i !== index);
    setModifierForm({ ...modifierForm, options: newOptions });
  };

  const updateModifierOption = (index, field, value) => {
    const newOptions = modifierForm.options.map((option, i) =>
      i === index ? { ...option, [field]: value } : option
    );
    setModifierForm({ ...modifierForm, options: newOptions });
  };

  const tabs = useMemo(() => [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'items', label: 'Menu Items', icon: ChefHat },
    { id: 'modifiers', label: 'Modifiers', icon: Settings },
    { id: 'combos', label: 'Combos', icon: Package },
  ], []);

  if (loading && categories.length === 0) {
    return (
      <POSLayout title="Menu Creation">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading menu data...</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  if (error) {
    return (
      <POSLayout title="Menu Creation">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchMenuData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout title="Menu Creation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600">Create and manage your restaurant menu</p>
          </div>
          <button
            onClick={() => navigate('/pos/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'categories' && <CategoryList categories={categories} setShowCategoryModal={setShowCategoryModal} handleEditCategory={handleEditCategory} handleDeleteCategory={handleDeleteCategory} />}
        {activeTab === 'items' && <MenuItemList categories={categories} setShowItemModal={setShowItemModal} handleEditItem={handleEditItem} handleDeleteItem={handleDeleteItem} />}
        {activeTab === 'modifiers' && <ModifierList modifiers={modifiers} setShowModifierModal={setShowModifierModal} handleEditModifier={handleEditModifier} handleDeleteModifier={handleDeleteModifier} />}
        {activeTab === 'combos' && <ComboList combos={combos} setShowComboModal={setShowComboModal} handleEditCombo={handleEditCombo} handleDeleteCombo={handleDeleteCombo} />}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    resetCategoryForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="categoryActive"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="categoryActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                      resetCategoryForm();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <button
                  onClick={() => {
                    setShowItemModal(false);
                    setEditingItem(null);
                    resetItemForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdateItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.basePrice}
                      onChange={(e) => setItemForm({ ...itemForm, basePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={itemForm.categoryId}
                      onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preparation Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={itemForm.prepTime}
                      onChange={(e) => setItemForm({ ...itemForm, prepTime: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                    <input
                      type="text"
                      value={itemForm.allergens}
                      onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value })}
                      placeholder="e.g., Nuts, Dairy, Gluten"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level</label>
                    <select
                      value={itemForm.spiceLevel}
                      onChange={(e) => setItemForm({ ...itemForm, spiceLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Hot">Hot</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      value={itemForm.code}
                      onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numeric Code</label>
                    <input
                      type="number"
                      value={itemForm.numCode}
                      onChange={(e) => setItemForm({ ...itemForm, numCode: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                    <input
                      type="number"
                      value={itemForm.calories}
                      onChange={(e) => setItemForm({ ...itemForm, calories: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={itemForm.sortOrder}
                      onChange={(e) => setItemForm({ ...itemForm, sortOrder: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload images</span>
                    </label>
                    {itemForm.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {itemForm.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={itemForm.isAvailable}
                      onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isAvailable" className="text-sm text-gray-700">
                      Available
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="vegetarian"
                      checked={itemForm.vegetarian}
                      onChange={(e) => setItemForm({ ...itemForm, vegetarian: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="vegetarian" className="text-sm text-gray-700">
                      Vegetarian
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemModal(false);
                      setEditingItem(null);
                      resetItemForm();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : editingItem ? (
                      'Save Changes'
                    ) : (
                      'Create Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modifier Modal */}
        {showModifierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingModifier ? 'Edit Modifier' : 'Add Modifier'}
                </h3>
                <button
                  onClick={() => {
                    setShowModifierModal(false);
                    setEditingModifier(null);
                    resetModifierForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdateModifier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modifier Name *</label>
                  <input
                    type="text"
                    value={modifierForm.name}
                    onChange={(e) => setModifierForm({ ...modifierForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={modifierForm.basePrice}
                      onChange={(e) => setModifierForm({ ...modifierForm, basePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={modifierForm.type}
                      onChange={(e) => setModifierForm({ ...modifierForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="single">Single Choice</option>
                      <option value="multiple">Multiple Choice</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link to Item *</label>
                    <select
                      value={modifierForm.itemId}
                      onChange={(e) => setModifierForm({ ...modifierForm, itemId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>{it.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="modifierRequired"
                      checked={modifierForm.isRequired}
                      onChange={(e) => setModifierForm({ ...modifierForm, isRequired: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="modifierRequired" className="text-sm text-gray-700">
                      Required
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModifierModal(false);
                      setEditingModifier(null);
                      resetModifierForm();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editingModifier ? 'Save Changes' : 'Create Modifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Combo Modal */}
        {showComboModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCombo ? 'Edit Combo' : 'Add Combo'}
                </h3>
                <button
                  onClick={() => {
                    setShowComboModal(false);
                    setEditingCombo(null);
                    resetComboForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdateCombo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Combo Name *</label>
                  <input
                    type="text"
                    value={comboForm.name}
                    onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={comboForm.description}
                    onChange={(e) => setComboForm({ ...comboForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={comboForm.basePrice}
                      onChange={(e) => setComboForm({ ...comboForm, basePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={comboForm.discount}
                      onChange={(e) => setComboForm({ ...comboForm, discount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Items</label>
                  <div className="max-h-48 overflow-auto border rounded-md divide-y">
                    {items.length === 0 && (
                      <div className="p-3 text-sm text-gray-500">No items available. Create items first.</div>
                    )}
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between p-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{it.name}</div>
                          <div className="text-xs text-gray-500">₹{it.basePrice}</div>
                        </div>
                        <input
                          type="number"
                          min="0"
                          className="w-20 px-2 py-1 border rounded"
                          value={comboItemSelections[it.id] || ''}
                          onChange={(e) => setComboItemSelections({ ...comboItemSelections, [it.id]: e.target.value ? parseInt(e.target.value) : 0 })}
                          placeholder="Qty"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="comboActive"
                    checked={comboForm.isActive}
                    onChange={(e) => setComboForm({ ...comboForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="comboActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowComboModal(false);
                      setEditingCombo(null);
                      resetComboForm();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : editingCombo ? 'Save Changes' : 'Create Combo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-gray-900 font-medium">Are you sure you want to delete this {confirmAction.type}?</p>
                    <p className="text-gray-600 text-sm mt-1">
                      <strong>{confirmAction.name}</strong> will be permanently removed.
                    </p>
                  </div>
                </div>
                <p className="text-red-600 text-sm">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmDialog(false);
                    await confirmAction.action();
                    setConfirmAction(null);
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </POSLayout>
  );
};

export default MenuCreation;