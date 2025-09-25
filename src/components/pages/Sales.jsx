import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import DataTable from "@/components/molecules/DataTable";
import FormField from "@/components/molecules/FormField";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import salesService from "@/services/api/salesService";
import customerService from "@/services/api/customerService";
import productService from "@/services/api/productService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    notes: ""
  });
  const [newItem, setNewItem] = useState({
    productId: "",
    productName: "",
    quantity: 1,
    price: 0
  });

  const statusOptions = ["All", "Completed", "Processing", "Pending", "Cancelled"];
  const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Check", "Bank Transfer"];

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError("");
      const [salesData, customersData, productsData] = await Promise.all([
        salesService.getAll(),
        customerService.getAll(),
        productService.getAll()
      ]);
      setSales(salesData);
      setFilteredSales(salesData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      setError("Failed to load sales data. Please try again.");
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, []);

  useEffect(() => {
    let filtered = sales;

    if (statusFilter !== "All") {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(sale =>
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.Id.toString().includes(searchQuery) ||
        sale.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSales(filtered);
  }, [searchQuery, statusFilter, sales]);

  const calculateTotals = (items, discount = 0, taxRate = 0.08) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  const handleAddItem = () => {
    if (!newItem.productId || newItem.quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const product = products.find(p => p.Id === parseInt(newItem.productId));
    if (!product) {
      toast.error("Product not found");
      return;
    }

    const item = {
      productId: newItem.productId,
      productName: product.name,
      quantity: newItem.quantity,
      price: product.price,
      total: product.price * newItem.quantity
    };

    const updatedItems = [...formData.items, item];
    const totals = calculateTotals(updatedItems, formData.discount);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      ...totals
    }));

    setNewItem({ productId: "", productName: "", quantity: 1, price: 0 });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const totals = calculateTotals(updatedItems, formData.discount);

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      ...totals
    }));
  };

  const handleDiscountChange = (discount) => {
    const totals = calculateTotals(formData.items, discount);
    setFormData(prev => ({
      ...prev,
      discount,
      ...totals
    }));
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customerId || formData.items.length === 0) {
        toast.error("Please select a customer and add at least one item");
        return;
      }

      const customer = customers.find(c => c.Id === parseInt(formData.customerId));
      const saleData = {
        ...formData,
        customerName: customer.name
      };

      const newSale = await salesService.create(saleData);
      setSales(prev => [newSale, ...prev]);
      
      // Reset form
      setFormData({
        customerId: "",
        customerName: "",
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        paymentMethod: "Cash",
        paymentStatus: "Paid",
        notes: ""
      });
      setShowModal(false);
      toast.success("Sale created successfully!");
    } catch (err) {
      toast.error("Failed to create sale");
    }
  };

  const handleUpdatePaymentStatus = async (saleId, newStatus) => {
    try {
      await salesService.updatePaymentStatus(saleId, newStatus);
      setSales(prev => prev.map(s => 
        s.Id === saleId ? { ...s, paymentStatus: newStatus, status: newStatus === "Paid" ? "Completed" : s.status } : s
      ));
      toast.success("Payment status updated successfully!");
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  };

  const columns = [
    {
      key: "Id",
      header: "Order #",
      sortable: true,
      render: (value) => (
        <div className="font-mono text-sm font-medium text-primary-700">
          #{value.toString().padStart(4, "0")}
        </div>
      )
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: "orderDate",
      header: "Date",
      sortable: true,
      render: (value) => format(new Date(value), "MMM dd, yyyy")
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (value) => (
        <div className="font-semibold text-gray-900">
          ${value.toFixed(2)}
        </div>
      )
    },
    {
      key: "paymentMethod",
      header: "Payment",
      render: (value) => (
        <Badge variant="info">{value}</Badge>
      )
    },
    {
      key: "paymentStatus",
      header: "Status",
      render: (value) => (
        <StatusIndicator status={value} type="payment" />
      )
    },
    {
      key: "status",
      header: "Order Status",
      render: (value) => (
        <StatusIndicator status={value} type="order" />
      )
    }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSalesData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales & Orders</h1>
          <p className="text-gray-600">Manage sales orders and track payments</p>
        </div>
        <Button 
          variant="primary" 
          icon="ShoppingCart"
          onClick={() => setShowModal(true)}
        >
          New Sale
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-primary-700">
                ${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
              </p>
            </div>
            <ApperIcon name="DollarSign" size={24} className="text-primary-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
            </div>
            <ApperIcon name="ShoppingBag" size={24} className="text-primary-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">
                {sales.filter(s => s.paymentStatus === "Pending").length}
              </p>
            </div>
            <ApperIcon name="Clock" size={24} className="text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2) : "0.00"}
              </p>
            </div>
            <ApperIcon name="TrendingUp" size={24} className="text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <SearchBar
              placeholder="Search by customer name, order ID, or payment method..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      {filteredSales.length === 0 ? (
        <Empty
          title="No sales found"
          description={searchQuery || statusFilter !== "All" ? "No sales match your search criteria" : "Start by creating your first sale"}
          action={searchQuery || statusFilter !== "All" ? undefined : () => setShowModal(true)}
          actionLabel="New Sale"
          icon="ShoppingCart"
        />
      ) : (
        <DataTable
          data={filteredSales}
          columns={columns}
          onRowClick={(sale) => setSelectedSale(sale)}
          actionButtons={(sale) => (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon="Eye"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSale(sale);
                }}
              >
                View
              </Button>
              {sale.paymentStatus !== "Paid" && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="CreditCard"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdatePaymentStatus(sale.Id, "Paid");
                  }}
                >
                  Mark Paid
                </Button>
              )}
            </div>
          )}
        />
      )}

      {/* Sale Details Modal */}
      {selectedSale && !showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{selectedSale.Id.toString().padStart(4, "0")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setSelectedSale(null)}
              />
            </div>
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Customer:</span> {selectedSale.customerName}</div>
                    <div><span className="text-gray-600">Order Date:</span> {format(new Date(selectedSale.orderDate), "PPP")}</div>
                    <div><span className="text-gray-600">Payment Method:</span> <Badge variant="info">{selectedSale.paymentMethod}</Badge></div>
                    <div><span className="text-gray-600">Payment Status:</span> <StatusIndicator status={selectedSale.paymentStatus} type="payment" /></div>
                    <div><span className="text-gray-600">Order Status:</span> <StatusIndicator status={selectedSale.status} type="order" /></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span> <span>${selectedSale.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tax:</span> <span>${selectedSale.tax.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Discount:</span> <span>-${selectedSale.discount.toFixed(2)}</span></div>
                    <div className="flex justify-between border-t pt-2 font-semibold"><span>Total:</span> <span>${selectedSale.total.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedSale.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">${item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedSale.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedSale.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {selectedSale.paymentStatus !== "Paid" && (
                  <Button
                    variant="accent"
                    onClick={() => {
                      handleUpdatePaymentStatus(selectedSale.Id, "Paid");
                      setSelectedSale({ ...selectedSale, paymentStatus: "Paid", status: "Completed" });
                    }}
                  >
                    Mark as Paid
                  </Button>
                )}
                <Button variant="primary" onClick={() => setSelectedSale(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Sale</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowModal(false)}
              />
            </div>
            <form onSubmit={handleCreateSale} className="p-6 space-y-6">
              {/* Customer Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Select Customer"
                  type="select"
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  required
                >
                  <option value="">Choose a customer</option>
                  {customers.map(customer => (
                    <option key={customer.Id} value={customer.Id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </FormField>
                <FormField
                  label="Payment Method"
                  type="select"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </FormField>
              </div>

              {/* Add Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Add Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                  <FormField
                    label="Product"
                    type="select"
                    value={newItem.productId}
                    onChange={(e) => {
                      const product = products.find(p => p.Id === parseInt(e.target.value));
                      setNewItem(prev => ({
                        ...prev,
                        productId: e.target.value,
                        productName: product?.name || "",
                        price: product?.price || 0
                      }));
                    }}
                  >
                    <option value="">Select product</option>
                    {products.map(product => (
                      <option key={product.Id} value={product.Id}>
                        {product.name} - ${product.price.toFixed(2)}
                      </option>
                    ))}
                  </FormField>
                  <FormField
                    label="Quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <div className="text-lg font-semibold text-primary-700">
                      ${(newItem.price * newItem.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="secondary" onClick={handleAddItem}>
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {formData.items.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {formData.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">${item.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${item.total.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                icon="X"
                                onClick={() => handleRemoveItem(idx)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    label="Discount ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                  />
                  <FormField
                    label="Notes"
                    type="textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Order notes..."
                    className="mt-4"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Subtotal:</span> <span>${formData.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Tax (8%):</span> <span>${formData.tax.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span>-${formData.discount.toFixed(2)}</span></div>
                    <div className="flex justify-between border-t pt-2 font-semibold text-lg"><span>Total:</span> <span>${formData.total.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={!formData.customerId || formData.items.length === 0}>
                  Create Sale
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;