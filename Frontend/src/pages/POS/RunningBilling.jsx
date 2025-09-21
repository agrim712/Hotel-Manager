import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Receipt, 
  ChefHat, 
  Timer, 
  Bell, 
  RefreshCw, 
  DollarSign, 
  Percent, 
  Calculator, 
  Zap, 
  Coffee, 
  UtensilsCrossed,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Printer,
  Download,
  Save,
  Tag,
  Settings,
  Edit2,
  Banknote,
  Smartphone,
  Wallet,
  RotateCcw,
  Check
} from 'lucide-react';

const RunningBilling = ({ order, onUpdateOrder, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountName, setDiscountName] = useState('');
  const [taxRate, setTaxRate] = useState(18); // Default 18% GST
  const [serviceCharge, setServiceCharge] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState(0);
  const [savedDiscounts, setSavedDiscounts] = useState([]);
  const [splitPayments, setSplitPayments] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // Real-time billing calculations
  const billingCalculations = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discountType === 'percentage' 
      ? (subtotal * discount) / 100 
      : Math.min(discount, subtotal);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableAmount * taxRate) / 100;
    const serviceChargeAmount = (taxableAmount * serviceCharge) / 100;
    const total = taxableAmount + taxAmount + serviceChargeAmount;
    
    const totalPaid = splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = Math.max(0, total - totalPaid);
    
    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      serviceChargeAmount,
      total,
      totalPaid,
      remaining
    };
  }, [orderItems, discount, discountType, taxRate, serviceCharge, splitPayments]);

  // Auto-refresh order data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrderData();
    }, 30000);

    return () => clearInterval(interval);
  }, [order?.id]);

  const fetchOrderData = useCallback(async () => {
    if (!order?.id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrderItems(data.data.orderItems || []);
        setNotes(data.data.notes || '');
      }
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  }, [order?.id]);

  useEffect(() => {
    if (order) {
      setOrderItems(order.orderItems || []);
      setNotes(order.notes || '');
    }
    fetchSavedDiscounts();
  }, [order]);

  useEffect(() => {
    setRemainingAmount(billingCalculations.remaining);
    setAmountPaid(billingCalculations.remaining);
  }, [billingCalculations.remaining]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        await fetchOrderData();
        onUpdateOrder?.();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchOrderData();
        onUpdateOrder?.();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        onUpdateOrder?.();
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOrderData();
        onUpdateOrder?.();
        
        // Show notification for status change
        if (newStatus === 'PREPARING') {
          // Send KOT to kitchen
          sendKOTToKitchen();
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendKOTToKitchen = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/kitchen/kot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order.id,
          items: orderItems.map(item => ({
            itemId: item.itemId,
            name: item.item?.name || 'Unknown Item',
            quantity: item.quantity,
            notes: item.notes || '',
            estimatedTime: item.item?.prepTime || 15
          }))
        })
      });

      if (response.ok) {
        // Show success notification
        console.log('KOT sent to kitchen successfully');
      }
    } catch (error) {
      console.error('Error sending KOT to kitchen:', error);
    }
  };

  const fetchSavedDiscounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/discounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedDiscounts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching saved discounts:', error);
    }
  };

  const saveDiscount = async () => {
    if (!discountName.trim()) {
      alert('Please enter a discount name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/discounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: discountName,
          type: discountType,
          value: discount,
          isActive: true
        })
      });

      if (response.ok) {
        await fetchSavedDiscounts();
        setDiscountName('');
        setShowDiscountModal(false);
        alert('Discount saved successfully!');
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Failed to save discount');
    }
  };

  const applyDiscount = (savedDiscount) => {
    setDiscount(savedDiscount.value);
    setDiscountType(savedDiscount.type);
    setDiscountName(savedDiscount.name);
  };

  const addSplitPayment = () => {
    if (amountPaid <= 0 || amountPaid > billingCalculations.remaining) {
      alert('Invalid amount');
      return;
    }

    const newPayment = {
      id: Date.now(),
      method: paymentMethod,
      amount: parseFloat(amountPaid),
      timestamp: new Date().toLocaleTimeString()
    };

    setSplitPayments([...splitPayments, newPayment]);
    setAmountPaid(0);
  };

  const removeSplitPayment = (paymentId) => {
    setSplitPayments(splitPayments.filter(p => p.id !== paymentId));
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Create bill
      const billResponse = await fetch(`http://localhost:5000/api/pos/bills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order.id,
          tax: billingCalculations.taxAmount,
          serviceCharge: billingCalculations.serviceChargeAmount,
          discount: billingCalculations.discountAmount,
          finalAmount: billingCalculations.total
        })
      });

      if (billResponse.ok) {
        // Process payments (single or split)
        const paymentsToProcess = splitPayments.length > 0 ? splitPayments : [{
          method: paymentMethod,
          amount: billingCalculations.total
        }];

        for (const payment of paymentsToProcess) {
          await fetch(`http://localhost:5000/api/pos/payments`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: order.id,
              mode: payment.method,
              amount: payment.amount
            })
          });
        }

        // Complete order
        await handleStatusChange('COMPLETED');
        setShowPaymentModal(false);
        setShowSplitPaymentModal(false);
        onClose?.();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'PREPARING': return <ChefHat className="h-4 w-4 text-orange-500" />;
      case 'READY': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PREPARING': return 'bg-orange-100 text-orange-800';
      case 'READY': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
              {order.table && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Table {order.table.number}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchOrderData()}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg"
                title="Refresh Order"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Order Items */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStatusChange('CONFIRMED')}
                    disabled={order.status !== 'PENDING' || loading}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                  >
                    Confirm Order
                  </button>
                  <button
                    onClick={() => handleStatusChange('PREPARING')}
                    disabled={order.status !== 'CONFIRMED' || loading}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm hover:bg-orange-200 disabled:opacity-50"
                  >
                    Send to Kitchen
                  </button>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.item?.name || 'Unknown Item'}</h4>
                        <p className="text-sm text-gray-600">₹{item.price} each</p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading}
                            className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="font-semibold text-gray-900 w-20 text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loading}
                          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleUpdateNotes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Add special instructions or notes..."
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Billing */}
          <div className="w-80 bg-gray-50 p-4 border-l overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sticky top-0 bg-gray-50 pb-2">Running Bill</h3>
            
            {/* Billing Details - Compact */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Bill Summary</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{billingCalculations.subtotal.toFixed(2)}</span>
                </div>
                
                {billingCalculations.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">
                      Discount ({discountType === 'percentage' ? `${discount}%` : `₹${discount.toFixed(2)}`}):
                    </span>
                    <span className="font-medium text-green-600">-₹{billingCalculations.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {billingCalculations.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Tax ({taxRate}%):</span>
                    <span className="font-medium">₹{billingCalculations.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {billingCalculations.serviceChargeAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-xs">Service ({serviceCharge}%):</span>
                    <span className="font-medium">₹{billingCalculations.serviceChargeAmount.toFixed(2)}</span>
                  </div>
                )}
                
                {billingCalculations.totalPaid > 0 && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-blue-600">₹{billingCalculations.totalPaid.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span>{billingCalculations.remaining > 0 ? 'Due:' : 'Total:'}:</span>
                    <span className={`${billingCalculations.remaining > 0 ? 'text-red-600' : 'text-green-600'} text-lg`}>
                      ₹{(billingCalculations.remaining > 0 ? billingCalculations.remaining : billingCalculations.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Billing Controls - Collapsible */}
            <div className="mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                {/* Discount Controls */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Discount</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setShowDiscountModal(true)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                        title="Saved Discounts"
                      >
                        <Tag className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setDiscount(0);
                          setDiscountName('');
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                        title="Reset Discount"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₹</option>
                    </select>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max={discountType === 'percentage' ? '100' : billingCalculations.subtotal.toString()}
                      placeholder={discountType === 'percentage' ? '%' : '₹'}
                    />
                  </div>
                  
                  {discountName && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                      {discountName}
                    </div>
                  )}
                </div>
                
                {/* Service Charge & Tax - Compact */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Service %</label>
                    <input
                      type="number"
                      value={serviceCharge}
                      onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tax %</label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Split Payments Display - Compact */}
            {splitPayments.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Split Payments</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {splitPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-1 py-0.5 bg-green-100 text-green-800 rounded">
                          {payment.method}
                        </span>
                        <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => removeSplitPayment(payment.id)}
                        className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quick Payment Amount Buttons */}
            {billingCalculations.remaining > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Pay</h4>
                <div className="grid grid-cols-3 gap-1">
                  {[100, 200, 500].filter(amt => amt <= billingCalculations.remaining + 500).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setAmountPaid(Math.min(amount, billingCalculations.remaining));
                        setShowPaymentModal(true);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border transition-colors"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Payment Action Buttons - Always Visible */}
            <div className="sticky bottom-0 bg-gray-50 pt-3 border-t border-gray-200 space-y-2 -mx-4 px-4 -mb-4 pb-4">
              {/* Primary Payment Button - Large and Prominent */}
              <button
                onClick={() => {
                  setAmountPaid(billingCalculations.remaining);
                  setShowPaymentModal(true);
                }}
                disabled={orderItems.length === 0 || loading || billingCalculations.remaining <= 0}
                className="w-full flex items-center justify-center px-4 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <CreditCard className="h-6 w-6 mr-3" />
                <div className="flex flex-col items-center">
                  <span>{billingCalculations.totalPaid > 0 ? 'COMPLETE PAYMENT' : 'MAKE PAYMENT'}</span>
                  <span className="text-sm font-normal opacity-90">₹{billingCalculations.remaining.toFixed(2)}</span>
                </div>
              </button>
              
              {/* Secondary Payment Options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowSplitPaymentModal(true)}
                  disabled={orderItems.length === 0 || loading || billingCalculations.remaining <= 0}
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Split Pay
                </button>
                
                <button
                  onClick={() => {
                    // Quick cash payment with exact amount
                    setPaymentMethod('CASH');
                    setAmountPaid(billingCalculations.remaining);
                    handlePayment();
                  }}
                  disabled={orderItems.length === 0 || loading || billingCalculations.remaining <= 0}
                  className="flex items-center justify-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Banknote className="h-4 w-4 mr-1" />
                  Cash Pay
                </button>
              </div>
              
              {/* Secondary Actions - Ultra Compact */}
              <div className="grid grid-cols-2 gap-1 mt-2">
                <button
                  onClick={() => handleStatusChange('READY')}
                  disabled={order.status !== 'PREPARING' || loading}
                  className="flex items-center justify-center px-2 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center px-2 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Management Modal */}
        {showDiscountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Discount Management</h3>
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              {/* Saved Discounts */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Saved Discounts</h4>
                {savedDiscounts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No saved discounts available</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {savedDiscounts.map((savedDiscount) => (
                      <div key={savedDiscount.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                        <div>
                          <div className="font-medium text-sm">{savedDiscount.name}</div>
                          <div className="text-xs text-gray-500">
                            {savedDiscount.type === 'percentage' ? `${savedDiscount.value}%` : `₹${savedDiscount.value}`}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            applyDiscount(savedDiscount);
                            setShowDiscountModal(false);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Save New Discount */}
              {discount > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Save Current Discount</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={discountName}
                      onChange={(e) => setDiscountName(e.target.value)}
                      placeholder="Discount name (e.g., Happy Hour, Senior Citizen)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium">
                        Current discount: {discountType === 'percentage' ? `${discount}%` : `₹${discount}`}
                      </span>
                      <button
                        onClick={saveDiscount}
                        disabled={!discountName.trim()}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Split Payment Modal */}
        {showSplitPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Split Payment</h3>
                <button
                  onClick={() => setShowSplitPaymentModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Total Amount:</span>
                    <span className="font-medium">₹{billingCalculations.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Paid So Far:</span>
                    <span className="font-medium text-green-600">₹{billingCalculations.totalPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span>Remaining:</span>
                    <span className="text-red-600">₹{billingCalculations.remaining.toFixed(2)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['CASH', 'CARD', 'UPI', 'OTHER'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex items-center justify-center p-2 border rounded-lg transition-colors ${
                          paymentMethod === method
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {method === 'CASH' && <Banknote className="h-4 w-4 mr-1" />}
                        {method === 'CARD' && <CreditCard className="h-4 w-4 mr-1" />}
                        {method === 'UPI' && <Smartphone className="h-4 w-4 mr-1" />}
                        {method === 'OTHER' && <Wallet className="h-4 w-4 mr-1" />}
                        <span className="text-xs">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    max={billingCalculations.remaining}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={`Max: ₹${billingCalculations.remaining.toFixed(2)}`}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={addSplitPayment}
                    disabled={amountPaid <= 0 || amountPaid > billingCalculations.remaining}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </button>
                  {billingCalculations.remaining <= 0 && (
                    <button
                      onClick={() => {
                        handlePayment();
                        setShowSplitPaymentModal(false);
                      }}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Payment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['CASH', 'CARD', 'UPI', 'OTHER'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                          paymentMethod === method
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {method === 'CASH' && <Banknote className="h-5 w-5 mr-2" />}
                        {method === 'CARD' && <CreditCard className="h-5 w-5 mr-2" />}
                        {method === 'UPI' && <Smartphone className="h-5 w-5 mr-2" />}
                        {method === 'OTHER' && <Wallet className="h-5 w-5 mr-2" />}
                        <span className="text-sm font-medium">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium text-center"
                    placeholder={`₹${billingCalculations.remaining.toFixed(2)}`}
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Amount Due:</span>
                    <span className="font-medium">₹{billingCalculations.remaining.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Amount Paying:</span>
                    <span className="font-medium">₹{amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span>Change:</span>
                    <span className={amountPaid >= billingCalculations.remaining ? 'text-green-600' : 'text-red-600'}>
                      ₹{Math.max(0, amountPaid - billingCalculations.remaining).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading || amountPaid < billingCalculations.remaining}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunningBilling;
