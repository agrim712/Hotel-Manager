import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronLeft, ShoppingCart, Trash2, CheckSquare, Package, Utensils, ShoppingBag, Truck } from 'lucide-react';
import './NewOrderForm.css'; // We'll add some CSS for specific styles

const NewOrderForm = ({ onOrderCreated, onCancel }) => {
  const [orderType, setOrderType] = useState('dine-in');
  const [customer, setCustomer] = useState(null);
  const [table, setTable] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [comboItems, setComboItems] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [showSummary, setShowSummary] = useState(false); // State to toggle summary on mobile

  // Modifier configuration modal state
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configItem, setConfigItem] = useState(null);
  const [configSelectedModifiers, setConfigSelectedModifiers] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchTables();
    fetchMenuCategories();
    fetchMenuItems();
    fetchComboItems();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Tables:', data.data);
        setTables(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/menu/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchMenuCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/menu/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMenuCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching menu categories:', error);
    }
  };

  const fetchComboItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/menu/combos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComboItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching combo items:', error);
    }
  };

  const handleAddItem = (menuItem) => {
    if (menuItem?.modifiers && menuItem.modifiers.length > 0) {
      // Open configuration modal for customizable items
      setConfigItem(menuItem);
      setConfigSelectedModifiers([]);
      setConfigModalOpen(true);
    } else {
      addConfiguredItem(menuItem, []);
    }
  };

  const addConfiguredItem = (menuItem, modifierIds = []) => {
    const key = `${menuItem.id}|${modifierIds.sort().join(',')}`;
    const existingIndex = selectedItems.findIndex(item => item._key === key);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + 1 };
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          _key: key,
          id: menuItem.id,
          name: menuItem.name,
          basePrice: menuItem.basePrice,
          vegetarian: !!menuItem.vegetarian,
          selectedModifierIds: modifierIds,
          quantity: 1
        }
      ]);
    }
  };

  const toggleConfigModifier = (modifierId) => {
    setConfigSelectedModifiers((prev) =>
      prev.includes(modifierId) ? prev.filter((id) => id !== modifierId) : [...prev, modifierId]
    );
  };

  const confirmConfigAdd = () => {
    if (!configItem) return;
    // Enforce required rule (simple): if any modifier isRequired, ensure at least one required selected
    const requiredIds = (configItem.modifiers || []).filter(m => m.isRequired).map(m => m.id);
    if (requiredIds.length > 0 && !configSelectedModifiers.some(id => requiredIds.includes(id))) {
      return; // keep modal open until user selects at least one required
    }
    addConfiguredItem(configItem, configSelectedModifiers);
    setConfigModalOpen(false);
    setConfigItem(null);
    setConfigSelectedModifiers([]);
  };

  const handleAddCombo = (combo) => {
    const key = `combo-${combo.id}`;
    const existingIndex = selectedItems.findIndex(item => item._key === key);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          _key: key,
          id: combo.id,
          name: combo.name,
          basePrice: combo.price,
          vegetarian: false,
          isCombo: true,
          comboItems: combo.items || [],
          quantity: 1
        }
      ]);
    }
  };

  const handleRemoveItem = (keyOrId) => {
    setSelectedItems(selectedItems.filter(item => (item._key || item.id) !== keyOrId));
  };

  const handleQuantityChange = (keyOrId, newQuantity) => {
    if (newQuantity < 1) return;
    setSelectedItems(selectedItems.map(item =>
      (item._key || item.id) === keyOrId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const getItemModifierExtra = (item) => {
    // Find the full menu item to resolve modifier prices
    const mi = menuItems.find(m => m.id === item.id);
    if (!mi || !mi.modifiers || !(item.selectedModifierIds?.length)) return 0;
    return item.selectedModifierIds.reduce((sum, mid) => {
      const mod = mi.modifiers.find(mm => mm.id === mid);
      return sum + (mod?.price || 0);
    }, 0) * item.quantity;
  };

  const totalAmount = useMemo(
    () => selectedItems.reduce((acc, item) => {
      const base = (item.basePrice || 0) * item.quantity;
      const mods = getItemModifierExtra(item);
      return acc + base + mods;
    }, 0),
    [selectedItems, menuItems]
  );

  const filteredItems = useMemo(() => {
    if (activeCategoryId === 'all') return menuItems;
    return menuItems.filter(mi => mi.categoryId === activeCategoryId);
  }, [menuItems, activeCategoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let customerId = customer?.id || null;
    if (!customerId && newCustomer.name.trim()) {
      try {
        setCreatingCustomer(true);
        const token = localStorage.getItem('token');
        const resp = await fetch('http://localhost:5000/api/pos/customers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCustomer)
        });
        if (resp.ok) {
          const data = await resp.json();
          customerId = data.data.id;
        } else {
          const err = await resp.json();
          setError(err.message || 'Failed to create customer');
          return;
        }
      } finally {
        setCreatingCustomer(false);
      }
    }

    const newOrderData = {
      type: orderType,
      customerId,
      tableId: orderType === 'dine-in' ? table?.id : null,
      items: selectedItems.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        modifiers: item.selectedModifierIds || []
      }))
    };

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOrderData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Order created successfully!', data);
        onOrderCreated();
      } else {
        const errorData = await response.json();
        alert(`Failed to create order: ${errorData.message}`);
      }
    } catch (error) {
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const orderTypeIcons = {
    'dine-in': <Utensils className="h-4 w-4 mr-2" />,
    'takeaway': <ShoppingBag className="h-4 w-4 mr-2" />,
    'delivery': <Truck className="h-4 w-4 mr-2" />,
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onCancel} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Back to Orders</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">New Order</h1>
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="md:hidden flex items-center p-2 rounded-lg bg-blue-600 text-white"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="ml-2">View Cart ({selectedItems.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Categories Tabs */}
              <div className="flex space-x-4 border-b pb-4 mb-6 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveCategoryId('all')}
                  className={`px-4 py-2 whitespace-nowrap text-sm font-semibold rounded-lg transition-colors ${
                    activeCategoryId === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                {menuCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-4 py-2 whitespace-nowrap text-sm font-semibold rounded-lg transition-colors ${
                      activeCategoryId === cat.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Menu Grid */}
              <div className="mb-6">
                {menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
                    <p className="mt-4 text-gray-500">Loading menu items...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className={`p-4 border rounded-xl shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          item.vegetarian ? 'border-green-400 focus:ring-green-500' : 'border-red-400 focus:ring-red-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            ₹{(item.basePrice || 0).toFixed(2)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold ${
                              item.vegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.vegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                        <div className="font-bold text-gray-900 truncate">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</div>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="mt-2 text-[10px] inline-flex items-center px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            <CheckSquare className="h-3 w-3 mr-1" /> Customisable
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Combos */}
              {comboItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Combos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comboItems.map(combo => (
                      <button
                        key={combo.id}
                        type="button"
                        onClick={() => handleAddCombo(combo)}
                        className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-gray-900 flex items-center">
                            <Package className="h-4 w-4 mr-2 text-purple-600" />
                            {combo.name}
                          </div>
                          <div className="text-sm font-medium text-purple-600">₹{(combo.price || 0).toFixed(2)}</div>
                        </div>
                        {combo.description && (
                          <div className="text-xs text-gray-500 mt-1">{combo.description}</div>
                        )}
                        <div className="mt-2 text-xs text-gray-600">
                          {combo.items?.map((ci, idx) => {
                            const mi = menuItems.find(m => m.id === ci.itemId);
                            return <span key={idx} className="mr-2">{ci.quantity}x {mi?.name || ci.itemId}</span>;
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Config Modal for Modifiers */}
          {configModalOpen && configItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure {configItem.name}</h3>
                <div className="text-sm text-gray-600 mb-4">Base Price: ₹{(configItem.basePrice || 0).toFixed(2)}</div>
                {configItem.modifiers && configItem.modifiers.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-auto">
                    {configItem.modifiers.map((mod) => (
                      <label key={mod.id} className="flex items-center justify-between border rounded-md p-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={configSelectedModifiers.includes(mod.id)}
                            onChange={() => toggleConfigModifier(mod.id)}
                            className="mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{mod.name}</div>
                            <div className="text-xs text-gray-500">{mod.isRequired ? 'Required · ' : ''}₹{(mod.price || 0).toFixed(2)}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No modifiers available</div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Total: ₹{(() => {
                      const mods = (configItem.modifiers || []).filter(m => configSelectedModifiers.includes(m.id));
                      const extra = mods.reduce((s, m) => s + (m.price || 0), 0);
                      return ((configItem.basePrice || 0) + extra).toFixed(2);
                    })()}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => { setConfigModalOpen(false); setConfigItem(null); setConfigSelectedModifiers([]); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmConfigAdd}
                      disabled={(configItem.modifiers || []).some(m => m.isRequired) && !(configSelectedModifiers.some(id => (configItem.modifiers || []).some(m => m.isRequired && m.id === id)))}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Section */}
          <div className={`md:col-span-1 fixed inset-0 bg-white z-50 transform transition-transform ${showSummary ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:h-auto`}>
            <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
                <button onClick={() => setShowSummary(false)} className="text-gray-500 hover:text-gray-800">
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>
              <h2 className="hidden md:block text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="flex-grow overflow-y-auto mb-6 custom-scrollbar">
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">Your cart is empty. Add some delicious items!</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {selectedItems.map(item => (
                      <li key={item._key || item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-grow">
                          <div className="font-semibold text-sm text-gray-800">{item.name}</div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">₹{item.basePrice.toFixed(2)}</span>
                            <span className="mx-2 text-gray-400">×</span>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._key || item.id, parseInt(e.target.value))}
                              min="1"
                              className="w-12 text-center text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          {item.selectedModifierIds?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {(() => {
                                const mi = menuItems.find(m => m.id === item.id);
                                const names = item.selectedModifierIds.map(mid => mi?.modifiers?.find(mm => mm.id === mid)?.name).filter(Boolean);
                                return names.length > 0 ? `+ ${names.join(', ')}` : null;
                              })()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">₹{(item.basePrice * item.quantity + getItemModifierExtra(item)).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item._key || item.id)}
                            className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-auto">
                {/* Order Type Selection */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Order Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {['dine-in', 'takeaway', 'delivery'].map(type => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${orderType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {orderTypeIcons[type]} {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Selection (only if dine-in) */}
                {orderType === 'dine-in' && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Select Table</h3>
                    <select
                      value={table?.id || ''}
                      onChange={(e) => setTable(tables.find(t => t.id === e.target.value) || null)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" className="text-gray-500">-- Select Table --</option>
                      {tables.map(t => <option key={t.id} value={t.id} className="text-gray-900">{t.number}  (capacity: {t.capacity})</option>)}
                    </select>
                  </div>
                )}

                {/* Customer Selection */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Customer</h3>
                  <select
                    value={customer?.id || ''}
                    onChange={(e) => setCustomer(customers.find(c => c.id === e.target.value) || null)}
                    className="w-full border border-gray-300 rounded-lg p-2 mb-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Walk-in / New Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>

                  {/* If new customer */}
                  {!customer && (
                    <div className="grid grid-cols-1 gap-2">
                      {['name', 'email', 'phone'].map(field => (
                        <input
                          key={field}
                          type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                          value={newCustomer[field]}
                          onChange={(e) => setNewCustomer({ ...newCustomer, [field]: e.target.value })}
                          placeholder={`New Customer ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                          className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm"
                        />
                      ))}
                    </div>
                  )}
                  {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
                </div>

                {/* Footer and Submit */}
                <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 mb-2 sm:mb-0">Total: ₹{totalAmount.toFixed(2)}</span>
                  <button
                    type="submit"
                    disabled={selectedItems.length === 0 || loading || (orderType === 'dine-in' && !table) || creatingCustomer}
                    onClick={handleSubmit}
                    className="flex items-center w-full sm:w-auto justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Order'}
                    <Plus className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderForm;