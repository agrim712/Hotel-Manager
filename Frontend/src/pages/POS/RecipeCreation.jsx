import React, { useEffect, useMemo, useState } from 'react';
import POSLayout from '../../components/POS/POSLayout';
import { Plus, Trash2, Save, ChefHat, Package } from 'lucide-react';

const RecipeCreation = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [existingRecipe, setExistingRecipe] = useState(null);
  const [steps, setSteps] = useState('');
  const [lines, setLines] = useState([{ inventoryItemId: '', quantity: '', unit: '' }]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    fetchMenuItems();
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (selectedMenuItemId) {
      fetchRecipeForMenuItem(selectedMenuItemId);
    } else {
      setExistingRecipe(null);
      setLines([{ inventoryItemId: '', quantity: '', unit: '' }]);
      setSteps('');
    }
  }, [selectedMenuItemId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/pos/menu/items', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch menu items', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pos/inventory?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setInventoryItems(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch inventory items', e);
    }
  };

  const fetchRecipeForMenuItem = async (menuItemId) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/pos/recipes?menuItemId=${menuItemId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const recipe = (data.data || [])[0] || null;
        setExistingRecipe(recipe);
        if (recipe) {
          setSteps(recipe.steps || '');
          const mapped = (recipe.items || []).map(it => ({
            inventoryItemId: it.inventoryItemId,
            quantity: it.quantity,
            unit: it.unit || it.inventoryItem?.unit || ''
          }));
          setLines(mapped.length > 0 ? mapped : [{ inventoryItemId: '', quantity: '', unit: '' }]);
        } else {
          setSteps('');
          setLines([{ inventoryItemId: '', quantity: '', unit: '' }]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch recipe', e);
    } finally {
      setLoading(false);
    }
  };

  const addLine = () => {
    setLines([...lines, { inventoryItemId: '', quantity: '', unit: '' }]);
  };

  const removeLine = (index) => {
    const updated = [...lines];
    updated.splice(index, 1);
    setLines(updated.length > 0 ? updated : [{ inventoryItemId: '', quantity: '', unit: '' }]);
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const handleSave = async () => {
    setError('');
    if (!selectedMenuItemId) {
      setError('Please select a menu item');
      return;
    }
    const items = lines
      .filter(l => l.inventoryItemId && l.quantity)
      .map(l => ({ inventoryItemId: l.inventoryItemId, quantity: parseFloat(l.quantity), unit: l.unit || undefined }));
    if (items.length === 0) {
      setError('Add at least one inventory item with quantity');
      return;
    }

    try {
      setSaving(true);
      const payload = { menuItemId: selectedMenuItemId, steps, items };
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      let res;
      if (existingRecipe) {
        res = await fetch(`http://localhost:5000/api/pos/recipes/${existingRecipe.id}`, {
          method: 'PUT', headers, body: JSON.stringify({ steps, items })
        });
      } else {
        res = await fetch('http://localhost:5000/api/pos/recipes', {
          method: 'POST', headers, body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        await fetchRecipeForMenuItem(selectedMenuItemId);
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to save recipe');
      }
    } catch (e) {
      console.error('Failed to save recipe', e);
      setError('Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <POSLayout title="Recipe Creation">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Build Recipe for Menu Item</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.location.assign('/pos/recipes/list')}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                View All Recipes
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : existingRecipe ? 'Update Recipe' : 'Create Recipe'}
              </button>
            </div>
          </div>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>

        {/* Selector */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Menu Item</label>
          <select
            value={selectedMenuItemId}
            onChange={(e) => setSelectedMenuItemId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select --</option>
            {menuItems.map(mi => (
              <option key={mi.id} value={mi.id}>{mi.name}</option>
            ))}
          </select>
        </div>

        {/* Lines */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-purple-600" />
              <h3 className="text-md font-semibold text-gray-900">Inventory Items</h3>
            </div>
            <button
              onClick={addLine}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <select
                  value={line.inventoryItemId}
                  onChange={(e) => updateLine(idx, 'inventoryItemId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Inventory Item</option>
                  {inventoryItems.map(ii => (
                    <option key={ii.id} value={ii.id}>{ii.name} ({ii.unit})</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                  placeholder="Quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={line.unit}
                    onChange={(e) => updateLine(idx, 'unit', e.target.value)}
                    placeholder="Unit (optional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => removeLine(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Steps (optional)</label>
          <textarea
            rows="4"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="Describe the cooking/prep steps here"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </POSLayout>
  );
};

export default RecipeCreation;
