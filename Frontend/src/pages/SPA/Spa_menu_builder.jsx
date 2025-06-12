import React, { useState, useEffect } from 'react';
import { FiClock, FiStar, FiZap, FiDroplet, FiFeather, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';
import './SpaMenuManager.css';
const SpaMenuManager = () => {
  // State for categories and treatments
  const [categories, setCategories] = useState([]);
  const [treatments, setTreatments] = useState([]);
  
  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  
  // Form data
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  
  const [treatmentForm, setTreatmentForm] = useState({
    name: '',
    categoryId: '',
    duration: '',
    price: '',
    description: '',
    isSignature: false
  });

  // Fetch data (in a real app, this would be API calls)
  useEffect(() => {
    // Mock data - in real app you'd fetch from backend
    const mockCategories = [
      { id: 1, name: 'Body Rejuvenation' },
      { id: 2, name: 'Body Polishes' },
      { id: 3, name: 'Body Scrubs' },
      { id: 4, name: 'Wraps & Facials' }
    ];
    
    const mockTreatments = [
      // Sample data would be here
    ];
    
    setCategories(mockCategories);
    setTreatments(mockTreatments);
  }, []);

  // Category handlers
  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) return;
    
    const newCategory = {
      id: Date.now(), // Temporary ID
      ...categoryForm
    };
    
    setCategories([...categories, newCategory]);
    setCategoryForm({ name: '', description: '' });
    setShowCategoryForm(false);
  };

  // Treatment handlers
  const handleAddTreatment = () => {
    if (!treatmentForm.name.trim() || !treatmentForm.categoryId || !treatmentForm.duration || !treatmentForm.price) return;
    
    const newTreatment = {
      id: Date.now(), // Temporary ID
      ...treatmentForm,
      price: parseFloat(treatmentForm.price),
      duration: parseInt(treatmentForm.duration)
    };
    
    if (editingTreatment) {
      setTreatments(treatments.map(t => 
        t.id === editingTreatment.id ? newTreatment : t
      ));
      setEditingTreatment(null);
    } else {
      setTreatments([...treatments, newTreatment]);
    }
    
    resetTreatmentForm();
    setShowTreatmentForm(false);
  };

  const resetTreatmentForm = () => {
    setTreatmentForm({
      name: '',
      categoryId: '',
      duration: '',
      price: '',
      description: '',
      isSignature: false
    });
  };

  const handleEditTreatment = (treatment) => {
    setEditingTreatment(treatment);
    setTreatmentForm({
      name: treatment.name,
      categoryId: treatment.categoryId,
      duration: treatment.duration.toString(),
      price: treatment.price.toString(),
      description: treatment.description,
      isSignature: treatment.isSignature
    });
    setShowTreatmentForm(true);
  };

  const handleDeleteTreatment = (id) => {
    if (window.confirm('Are you sure you want to delete this treatment?')) {
      setTreatments(treatments.filter(t => t.id !== id));
    }
  };

  // Group treatments by category
  const treatmentsByCategory = categories.map(category => ({
    ...category,
    treatments: treatments.filter(t => t.categoryId === category.id)
  }));

  return (
    <div className="spa-management-container">
      {/* Header */}
      <header className="spa-header">
        <div className="spa-logo">
          <h1>INFINITY SPA MANAGEMENT</h1>
          <p className="spa-subtitle">Manage your spa treatments and categories</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="spa-management-content">
        {/* Categories Section */}
        <section className="management-section">
          <div className="section-header">
            <h2>Categories</h2>
            <button 
              className="add-button"
              onClick={() => setShowCategoryForm(true)}
            >
              <FiPlus /> Add Category
            </button>
          </div>
          
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category.id} className="category-card">
                <h3>{category.name}</h3>
                {category.description && <p>{category.description}</p>}
                <div className="category-stats">
                  <span>{treatments.filter(t => t.categoryId === category.id).length} treatments</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Treatments Section */}
        <section className="management-section">
          <div className="section-header">
            <h2>Treatments</h2>
            <button 
              className="add-button"
              onClick={() => {
                setEditingTreatment(null);
                resetTreatmentForm();
                setShowTreatmentForm(true);
              }}
            >
              <FiPlus /> Add Treatment
            </button>
          </div>
          
          {treatmentsByCategory.map(category => (
            category.treatments.length > 0 && (
              <div key={category.id} className="category-section">
                <h3 className="category-title">{category.name}</h3>
                <div className="treatments-list">
                  {category.treatments.map(treatment => (
                    <div key={treatment.id} className={`treatment-card ${treatment.isSignature ? 'signature' : ''}`}>
                      <div className="treatment-header">
                        <h4>{treatment.name}</h4>
                        <div className="treatment-actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditTreatment(treatment)}
                          >
                            <FiEdit />
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteTreatment(treatment.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <div className="treatment-details">
                        <span><FiClock /> {treatment.duration} mins</span>
                        <span>¥{treatment.price.toFixed(2)}</span>
                      </div>
                      {treatment.description && (
                        <p className="treatment-description">{treatment.description}</p>
                      )}
                      {treatment.isSignature && (
                        <div className="signature-badge">Signature Treatment</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </section>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTreatment ? 'Edit Category' : 'Add New Category'}</h3>
              <button 
                className="close-button"
                onClick={() => {
                  setShowCategoryForm(false);
                  setCategoryForm({ name: '', description: '' });
                }}
              >
                &times;
              </button>
            </div>
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="e.g., Body Rejuvenation"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                placeholder="Brief description of this category"
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowCategoryForm(false);
                  setCategoryForm({ name: '', description: '' });
                }}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleAddCategory}
                disabled={!categoryForm.name.trim()}
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Form Modal */}
      {showTreatmentForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}</h3>
              <button 
                className="close-button"
                onClick={() => {
                  setShowTreatmentForm(false);
                  resetTreatmentForm();
                }}
              >
                &times;
              </button>
            </div>
            <div className="form-group">
              <label>Treatment Name *</label>
              <input
                type="text"
                value={treatmentForm.name}
                onChange={(e) => setTreatmentForm({...treatmentForm, name: e.target.value})}
                placeholder="e.g., Abhyangam Massage"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={treatmentForm.categoryId}
                  onChange={(e) => setTreatmentForm({...treatmentForm, categoryId: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  min="1"
                  value={treatmentForm.duration}
                  onChange={(e) => setTreatmentForm({...treatmentForm, duration: e.target.value})}
                  placeholder="e.g., 60"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (¥) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={treatmentForm.price}
                  onChange={(e) => setTreatmentForm({...treatmentForm, price: e.target.value})}
                  placeholder="e.g., 2500"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={treatmentForm.isSignature}
                    onChange={(e) => setTreatmentForm({...treatmentForm, isSignature: e.target.checked})}
                  />
                  Signature Treatment
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={treatmentForm.description}
                onChange={(e) => setTreatmentForm({...treatmentForm, description: e.target.value})}
                placeholder="Describe the treatment benefits and process"
                rows="4"
              />
            </div>
            <div className="form-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowTreatmentForm(false);
                  resetTreatmentForm();
                }}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleAddTreatment}
                disabled={!treatmentForm.name.trim() || !treatmentForm.categoryId || !treatmentForm.duration || !treatmentForm.price}
              >
                {editingTreatment ? 'Update Treatment' : 'Add Treatment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// CSS Styles


export default SpaMenuManager;