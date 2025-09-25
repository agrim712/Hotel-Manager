import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import POSLayout from '../../components/POS/POSLayout';
import { Search, Plus, Eye, Edit, Trash2, ChefHat, Package, AlertTriangle } from 'lucide-react';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/pos/recipes', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch recipes', e);
    } finally {
      setLoading(false);
    }
  };

  const onView = (recipe) => {
    setSelected(recipe);
    setShowViewModal(true);
  };

  const onEdit = (recipe) => {
    // Navigate to recipe creation page with menu item pre-selected
    navigate('/pos/recipes');
    // The creation page fetches by selectedMenuItemId; if we want to auto-select, we could add query param support later
  };

  const onDelete = (recipe) => {
    setConfirmDelete(recipe);
  };

  const confirmDeleteRecipe = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/pos/recipes/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setConfirmDelete(null);
        fetchRecipes();
      }
    } catch (e) {
      console.error('Failed to delete recipe', e);
    }
  };

  const filtered = recipes.filter(r =>
    r.menuItem?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <POSLayout title="Recipes">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </POSLayout>
    );
  }

  return (
    <POSLayout title="Recipes">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">All Recipes</h2>
            </div>
            <button
              onClick={() => navigate('/pos/recipes')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Recipe
            </button>
          </div>
          <div className="mt-4 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by menu item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-gray-600">No recipes found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ChefHat className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-md font-semibold text-gray-900">{r.menuItem?.name}</h3>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Updated {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onView(r)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(r)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(r)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-700 font-medium">Ingredients</div>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {(r.items || []).slice(0, 4).map((it) => (
                      <li key={it.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="w-3 h-3 text-purple-600 mr-2" />
                          <span>{it.inventoryItem?.name}</span>
                        </div>
                        <span className="text-gray-500">{it.quantity} {it.unit || it.inventoryItem?.unit || ''}</span>
                      </li>
                    ))}
                  </ul>
                  {r.items?.length > 4 && (
                    <div className="text-xs text-gray-500">+{r.items.length - 4} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">{selected.menuItem?.name}</h3>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-2">Ingredients</div>
              <ul className="divide-y">
                {(selected.items || []).map((it) => (
                  <li key={it.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-purple-600 mr-2" />
                      <div>
                        <div className="text-gray-900">{it.inventoryItem?.name}</div>
                        <div className="text-xs text-gray-500">{it.inventoryItem?.unit}</div>
                      </div>
                    </div>
                    <div className="text-gray-700 text-sm">{it.quantity} {it.unit || it.inventoryItem?.unit || ''}</div>
                  </li>
                ))}
              </ul>
              {selected.steps && (
                <div className="mt-4">
                  <div className="font-medium text-gray-800 mb-1">Steps</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap border rounded-lg p-3 bg-gray-50">{selected.steps}</div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
              <button onClick={() => { setShowViewModal(false); onEdit(selected); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-2 text-red-600 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <div className="text-lg font-semibold">Delete Recipe</div>
            </div>
            <div className="text-gray-700">Are you sure you want to delete the recipe for <strong>{confirmDelete.menuItem?.name}</strong>? This action cannot be undone.</div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDeleteRecipe} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </POSLayout>
  );
};

export default RecipeList;
