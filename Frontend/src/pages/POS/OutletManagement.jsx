import React, { useState } from 'react';
import POSLayout from '../../Components/POS/POSLayout';
import OutletList from '../../Components/POS/OutletList';
import OutletForm from '../../Components/POS/OutletForm';


const OutletManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);

  const handleCreateOutlet = () => {
    setEditingOutlet(null);
    setShowForm(true);
  };

  const handleEditOutlet = (outlet) => {
    setEditingOutlet(outlet);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOutlet(null);
  };

  const handleFormSuccess = () => {
    // The OutletForm and OutletContext handle refreshing the list
    setShowForm(false);
  };

  return (
    <POSLayout title="Outlet Management">
      <OutletList onCreateOutlet={handleCreateOutlet} onEditOutlet={handleEditOutlet} />
      {showForm && (
        <OutletForm
          outlet={editingOutlet}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </POSLayout>
  );
};

export default OutletManagement;
