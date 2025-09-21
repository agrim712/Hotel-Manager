import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Printer, 
  Download, 
  Copy, 
  Settings,
  Eye,
  FileText,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Upload,
  AlertCircle,
  Search
} from 'lucide-react';

const Billing = ({ orderId: propOrderId, onBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [bill, setBill] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(propOrderId || params.orderId || '');
  const [showOrderSelector, setShowOrderSelector] = useState(!propOrderId && !params.orderId);
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    header: {
      showLogo: true,
      companyName: '',
      address: '',
      phone: '',
      email: '',
      gst: ''
    },
    items: {
      showItemCode: true,
      showDescription: true,
      showTax: true
    },
    footer: {
      showThankYou: true,
      customMessage: '',
      showTerms: false,
      terms: ''
    },
    styling: {
      primaryColor: '#000000',
      fontSize: 'medium',
      fontFamily: 'Arial'
    }
  });
  const [loading, setLoading] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    fetchTemplates();
    if (!propOrderId && !params.orderId) {
      fetchOrders();
    }
  }, []);

  useEffect(() => {
    if (selectedOrderId && selectedOrderId !== 'undefined') {
      fetchOrder();
      fetchBill();
    }
  }, [selectedOrderId]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrder = async () => {
    if (!selectedOrderId || selectedOrderId === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/orders/${selectedOrderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
      } else {
        console.error('Failed to fetch order:', response.status);
        setOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrder(null);
    }
  };

  const fetchBill = async () => {
    if (!selectedOrderId || selectedOrderId === 'undefined') return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/pos/bills?orderId=${selectedOrderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setBill(data.data[0]);
        } else {
          setBill(null);
        }
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      setBill(null);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/pos/receipt-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data || []);
        
        // Set default template if available
        const defaultTemplate = data.data?.find(t => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate);
          setCustomTemplate(defaultTemplate.template);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const saveTemplate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const templateData = {
        name: customTemplate.name,
        template: JSON.stringify(customTemplate),
        isDefault: templates.length === 0 // Set as default if first template
      };

      const response = await fetch('http://localhost:5000/api/pos/receipt-templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates([...templates, data.data]);
        setShowTemplateEditor(false);
        alert('Template saved successfully!');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/pos/receipt-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
        }
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    // Verify payment status before printing
    const hasPayment = order?.payments?.some(p => p.status === 'SUCCESS');
    if (!hasPayment) {
      alert('Payment must be completed before printing receipt.');
      return;
    }

    if (!bill) {
      alert('No bill found for this order.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const receiptContent = printRef.current?.innerHTML;
    
    if (printWindow && receiptContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${order.orderNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
              }
              @media print {
                body { margin: 0; padding: 0; }
                @page { margin: 0; }
              }
              .print-container {
                max-width: 400px;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${receiptContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const downloadReceipt = () => {
    // Verify payment status before downloading
    const hasPayment = order?.payments?.some(p => p.status === 'SUCCESS');
    if (!hasPayment) {
      alert('Payment must be completed before downloading receipt.');
      return;
    }

    if (!bill) {
      alert('No bill found for this order.');
      return;
    }

    // Generate PDF-like content for download
    const receiptContent = printRef.current?.innerHTML;
    if (!receiptContent) {
      alert('Receipt content not available.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .receipt-container {
              max-width: 400px;
              margin: 0 auto;
              border: 1px solid #ccc;
              padding: 20px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .receipt-container { border: none; margin: 0; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${receiptContent}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${order.orderNumber}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateReceiptContent = () => {
    if (!order || !bill) return null;

    const template = selectedTemplate?.template || customTemplate;
    
    return (
      <div 
        ref={printRef}
        className="max-w-md mx-auto bg-white border border-gray-200 p-6 print:shadow-none print:border-none"
        style={{
          fontFamily: template.styling?.fontFamily || 'Arial',
          fontSize: template.styling?.fontSize === 'small' ? '12px' : 
                   template.styling?.fontSize === 'large' ? '16px' : '14px',
          color: template.styling?.primaryColor || '#000000'
        }}
      >
        {/* Header */}
        {template.header && (
          <div className="text-center mb-6 border-b border-gray-300 pb-4">
            {template.header.showLogo && (
              <div className="mb-2">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            )}
            <h1 className="text-xl font-bold">{template.header.companyName || 'Restaurant Name'}</h1>
            {template.header.address && <p className="text-sm text-gray-600">{template.header.address}</p>}
            {template.header.phone && <p className="text-sm text-gray-600">Tel: {template.header.phone}</p>}
            {template.header.email && <p className="text-sm text-gray-600">Email: {template.header.email}</p>}
            {template.header.gst && <p className="text-sm text-gray-600">GST: {template.header.gst}</p>}
          </div>
        )}

        {/* Order Details */}
        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>Receipt #:</span>
            <span>{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Time:</span>
            <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
          </div>
          {order.table && (
            <div className="flex justify-between text-sm">
              <span>Table:</span>
              <span>{order.table.number}</span>
            </div>
          )}
          {order.customer && (
            <div className="flex justify-between text-sm">
              <span>Customer:</span>
              <span>{order.customer.name}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-4 border-t border-gray-300 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left">Item</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-1">
                    <div>
                      {item.item?.name || 'Unknown Item'}
                      {template.items?.showDescription && item.item?.description && (
                        <div className="text-xs text-gray-500">{item.item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-4 border-t border-gray-300 pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{bill.total?.toFixed(2)}</span>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>-₹{bill.discount?.toFixed(2)}</span>
            </div>
          )}
          {template.items?.showTax && bill.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>₹{bill.tax?.toFixed(2)}</span>
            </div>
          )}
          {bill.serviceCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span>Service Charge:</span>
              <span>₹{bill.serviceCharge?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
            <span>Total:</span>
            <span>₹{bill.finalAmount?.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        {order.payments?.length > 0 && (
          <div className="mb-4 border-t border-gray-300 pt-4">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            {order.payments.map((payment, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{payment.mode}:</span>
                <span>₹{payment.amount?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {template.footer && (
          <div className="text-center text-sm border-t border-gray-300 pt-4">
            {template.footer.showThankYou && (
              <p className="font-medium mb-2">Thank you for visiting us!</p>
            )}
            {template.footer.customMessage && (
              <p className="text-gray-600 mb-2">{template.footer.customMessage}</p>
            )}
            {template.footer.showTerms && template.footer.terms && (
              <div className="text-xs text-gray-500 mt-4">
                <p className="font-medium">Terms & Conditions:</p>
                <p>{template.footer.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleOrderSelect = (orderId) => {
    setSelectedOrderId(orderId);
    setShowOrderSelector(false);
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/pos/orders');
    }
  };

  // Show order selector if no order ID is provided
  if (showOrderSelector) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back to Orders
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Select Order for Billing</h1>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Select an Order</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-500">No orders available for billing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.filter(order => order.payments?.some(p => p.status === 'SUCCESS')).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => handleOrderSelect(order.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                        <div className="text-sm text-green-600 font-medium">Paid</div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Customer: {order.customer?.name || 'Walk-in'}</div>
                        {order.table && <div>Table: {order.table.number}</div>}
                        <div>Items: {order.orderItems?.length || 0}</div>
                        <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {orders.filter(order => order.payments?.some(p => p.status === 'SUCCESS')).length === 0 && orders.length > 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Paid Orders</h3>
                  <p className="text-gray-500">Only orders with completed payments can generate receipts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOrderId || selectedOrderId === 'undefined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Selected</h3>
          <p className="text-gray-500 mb-4">Please select an order to view billing information.</p>
          <button
            onClick={() => setShowOrderSelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Order
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Billing & Receipt - Order #{order.orderNumber}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowTemplateEditor(!showTemplateEditor)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Templates and Settings */}
        {showTemplateEditor && !previewMode && (
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Receipt Templates</h2>
              
              {/* Existing Templates */}
              <div className="space-y-2 mb-6">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{template.name}</div>
                      {template.isDefault && (
                        <div className="text-xs text-green-600">Default</div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setCustomTemplate(template.template);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Use Template"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create New Template */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Create New Template</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={customTemplate.name}
                      onChange={(e) => setCustomTemplate({
                        ...customTemplate,
                        name: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter template name"
                    />
                  </div>

                  {/* Header Settings */}
                  <div>
                    <h4 className="font-medium mb-2">Header</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customTemplate.header.companyName}
                        onChange={(e) => setCustomTemplate({
                          ...customTemplate,
                          header: { ...customTemplate.header, companyName: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Company Name"
                      />
                      <input
                        type="text"
                        value={customTemplate.header.address}
                        onChange={(e) => setCustomTemplate({
                          ...customTemplate,
                          header: { ...customTemplate.header, address: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Address"
                      />
                      <input
                        type="text"
                        value={customTemplate.header.phone}
                        onChange={(e) => setCustomTemplate({
                          ...customTemplate,
                          header: { ...customTemplate.header, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Phone Number"
                      />
                      <input
                        type="text"
                        value={customTemplate.header.email}
                        onChange={(e) => setCustomTemplate({
                          ...customTemplate,
                          header: { ...customTemplate.header, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Email"
                      />
                      <input
                        type="text"
                        value={customTemplate.header.gst}
                        onChange={(e) => setCustomTemplate({
                          ...customTemplate,
                          header: { ...customTemplate.header, gst: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="GST Number"
                      />
                    </div>
                  </div>

                  {/* Footer Settings */}
                  <div>
                    <h4 className="font-medium mb-2">Footer</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={customTemplate.footer.showThankYou}
                          onChange={(e) => setCustomTemplate({
                            ...customTemplate,
                            footer: { ...customTemplate.footer, showThankYou: e.target.checked }
                          })}
                          className="mr-2"
                        />
                        Show Thank You Message
                      </label>
                      <textarea
                        value={customTemplate.footer.customMessage}
                        onChange={(e) => setCustomTemplate({
                          ...customTemplate,
                          footer: { ...customTemplate.footer, customMessage: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Custom Message"
                        rows="2"
                      />
                    </div>
                  </div>

                  {/* Styling */}
                  <div>
                    <h4 className="font-medium mb-2">Styling</h4>
                    <div className="space-y-2">
                      <select
                        value={customTemplate.styling.fontSize}
                        onChange={(e) => setCustomTemplate({
                          ...customTemplate,
                          styling: { ...customTemplate.styling, fontSize: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={saveTemplate}
                    disabled={!customTemplate.name || loading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center Panel - Receipt Preview */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {/* Payment Status Indicator */}
              {order?.payments?.some(p => p.status === 'SUCCESS') && (
                <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                  <Check className="h-4 w-4 mr-2" />
                  Payment Completed
                </div>
              )}
              
              <button
                onClick={printReceipt}
                disabled={!bill || !order?.payments?.some(p => p.status === 'SUCCESS')}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors font-medium ${
                  !bill || !order?.payments?.some(p => p.status === 'SUCCESS')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title={!order?.payments?.some(p => p.status === 'SUCCESS') ? 'Payment required to print receipt' : 'Print Receipt'}
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Receipt
              </button>
              
              <button
                onClick={downloadReceipt}
                disabled={!bill || !order?.payments?.some(p => p.status === 'SUCCESS')}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors font-medium ${
                  !bill || !order?.payments?.some(p => p.status === 'SUCCESS')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={!order?.payments?.some(p => p.status === 'SUCCESS') ? 'Payment required to download receipt' : 'Download Receipt'}
              >
                <Download className="h-5 w-5 mr-2" />
                Download
              </button>
            </div>

            {/* Receipt Content */}
            {bill ? (
              generateReceiptContent()
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bill Generated</h3>
                <p className="text-gray-500">Complete the payment process to generate a receipt.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Billing;