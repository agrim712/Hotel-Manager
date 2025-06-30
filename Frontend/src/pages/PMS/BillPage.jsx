// src/pages/pmss/reservation/BillPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useReservationContext } from '../../../context/ReservationContext';
const BillPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReservationBill, addBillItems, finalizeBill } = useReservationContext();
  
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: '',
    price: 0,
    quantity: 1
  });
  const [payment, setPayment] = useState({
    method: 'CASH',
    amount: 0,
    reference: ''
  });

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        setLoading(true);
        const data = await getReservationBill(id);
        setBill(data);
        setPayment(prev => ({ ...prev, amount: data.totalAmount }));
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load bill details');
        console.error('Error fetching bill:', error);
        setLoading(false);
      }
    };

    fetchBillDetails();
  }, [id, getReservationBill]);

  const handleAddItem = () => {
    if (!newItem.description || newItem.price <= 0) {
      toast.warning('Please enter item description and price');
      return;
    }

    const updatedItems = [...items, {
      id: Date.now(),
      description: newItem.description,
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity),
      total: parseFloat(newItem.price) * parseInt(newItem.quantity)
    }];

    setItems(updatedItems);
    setNewItem({ description: '', price: 0, quantity: 1 });
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, bill?.subtotal || 0);
    const taxAmount = subtotal * 0.1; // Assuming 10% tax
    const totalAmount = subtotal + taxAmount;
    
    setPayment(prev => ({ ...prev, amount: totalAmount }));
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, bill?.subtotal || 0);
    const taxAmount = subtotal * 0.1; // Assuming 10% tax
    const totalAmount = subtotal + taxAmount;
    
    setPayment(prev => ({ ...prev, amount: totalAmount }));
  };


  const handleFinalizeBill = async () => {
    try {
      if (payment.amount <= 0) {
        toast.warning('Total amount must be greater than zero');
        return;
      }

      const billData = {
        items,
        paymentMethod: payment.method,
        paymentAmount: payment.amount,
        paymentReference: payment.reference
      };

      const result = await finalizeBill(id, billData);
      
      toast.success('Bill finalized successfully!');
      navigate(`/pmss/reservation/view/${id}`);
    } catch (error) {
      toast.error('Failed to finalize bill');
      console.error('Error finalizing bill:', error);
    }
  };

  const handlePrintBill = async () => {
  try {
    await generateBill(id); // already implemented in context
  } catch (err) {
    toast.error('Failed to print bill');
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p>No bill information found for this reservation.</p>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, bill.subtotal || 0);
  const taxAmount = subtotal * 0.1; // Assuming 10% tax
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Bill for Reservation #{bill.reservationId}</h1>
        <button
          onClick={handlePrintBill}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <FaPrint className="mr-2" />
          Print Bill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Guest Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {bill.guestName}</p>
            <p><span className="font-medium">Room:</span> {bill.roomNumber} ({bill.roomType})</p>
            <p><span className="font-medium">Stay:</span> {new Date(bill.checkIn).toLocaleDateString()} to {new Date(bill.checkOut).toLocaleDateString()}</p>
            <p><span className="font-medium">Nights:</span> {bill.nights}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Rate Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Rate Type:</span> {bill.rateType}</p>
            <p><span className="font-medium">Base Rate:</span> {bill.baseRate.toFixed(2)} per night</p>
            <p><span className="font-medium">Tax Rate:</span> {bill.taxRate.toFixed(2)} per night</p>
            <p><span className="font-medium">Tax Inclusive:</span> {bill.taxInclusive ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add Items</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            <button
              onClick={handleAddItem}
              className="w-full flex justify-center items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <FaPlus className="mr-2" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Bill Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Room charges */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Room Charges ({bill.nights} nights)</td>
                <td className="px-6 py-4 whitespace-nowrap">{bill.baseRate.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{bill.nights}</td>
                <td className="px-6 py-4 whitespace-nowrap">{(bill.baseRate * bill.nights).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
              
              {/* Additional items */}
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaMinus />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                value={payment.method}
                onChange={(e) => setPayment({...payment, method: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="CASH">Cash</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                value={payment.amount}
                onChange={(e) => setPayment({...payment, amount: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference/Notes</label>
              <input
                type="text"
                value={payment.reference}
                onChange={(e) => setPayment({...payment, reference: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Bill Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tax (10%):</span>
              <span>{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold">{totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={handleFinalizeBill}
              className="w-full mt-4 flex justify-center items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FaSave className="mr-2" />
              Finalize Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPage;