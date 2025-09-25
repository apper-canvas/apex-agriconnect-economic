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
import supplierService from "@/services/api/supplierService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
    products: [],
    paymentTerms: "Net 30"
  });
  const [productInput, setProductInput] = useState("");

  const paymentTermsOptions = ["Net 15", "Net 30", "Net 45", "Net 60", "Cash on Delivery", "Prepaid"];

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await supplierService.getAll();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (err) {
      setError("Failed to load suppliers. Please try again.");
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contact.includes(searchQuery) ||
        supplier.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.products.some(product => product.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSuppliers(filtered);
    }
  }, [searchQuery, suppliers]);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim() || !formData.contact.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      const supplierData = {
        ...formData,
        products: formData.products.length > 0 ? formData.products : []
      };

      const newSupplier = await supplierService.create(supplierData);
      setSuppliers(prev => [newSupplier, ...prev]);
      setFormData({
        name: "",
        contact: "",
        address: "",
        products: [],
        paymentTerms: "Net 30"
      });
      setProductInput("");
      setShowModal(false);
      toast.success("Supplier created successfully!");
    } catch (err) {
      toast.error("Failed to create supplier");
    }
  };

  const handleAddProduct = () => {
    if (productInput.trim() && !formData.products.includes(productInput.trim())) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, productInput.trim()]
      }));
      setProductInput("");
    }
  };

  const handleRemoveProduct = (product) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p !== product)
    }));
  };

  const handleUpdateReliability = async (supplierId, newScore) => {
    try {
      await supplierService.updateReliabilityScore(supplierId, newScore);
      setSuppliers(prev => prev.map(s => 
        s.Id === supplierId ? { ...s, reliability: newScore } : s
      ));
      toast.success("Reliability score updated!");
    } catch (err) {
      toast.error("Failed to update reliability score");
    }
  };

  const getReliabilityStatus = (score) => {
    if (score >= 90) return "Reliable";
    if (score >= 80) return "Good";
    if (score >= 70) return "Average";
    return "Poor";
  };

  const columns = [
    {
      key: "name",
      header: "Supplier Name",
      sortable: true,
      render: (value, supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 premium-gradient rounded-lg flex items-center justify-center">
            <ApperIcon name="Truck" size={18} className="text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{supplier.contact}</div>
          </div>
        </div>
      )
    },
    {
      key: "products",
      header: "Product Categories",
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((product, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {product}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "paymentTerms",
      header: "Payment Terms",
      render: (value) => (
        <Badge variant="info">{value}</Badge>
      )
    },
    {
      key: "lastDelivery",
      header: "Last Delivery",
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM dd, yyyy") : "Never"
    },
    {
      key: "reliability",
      header: "Reliability",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{value}%</span>
          <StatusIndicator status={getReliabilityStatus(value)} type="supplier" />
        </div>
      )
    }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSuppliers} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage your agricultural product suppliers and vendor relationships</p>
        </div>
        <Button 
          variant="primary" 
          icon="Truck"
          onClick={() => setShowModal(true)}
        >
          Add Supplier
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <ApperIcon name="Truck" size={24} className="text-primary-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reliable Suppliers</p>
              <p className="text-2xl font-bold text-green-600">
                {suppliers.filter(s => s.reliability >= 90).length}
              </p>
            </div>
            <ApperIcon name="CheckCircle" size={24} className="text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Relationships</p>
              <p className="text-2xl font-bold text-primary-600">
                {suppliers.filter(s => s.lastDelivery).length}
              </p>
            </div>
            <ApperIcon name="Handshake" size={24} className="text-primary-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Reliability</p>
              <p className="text-2xl font-bold text-accent-600">
                {suppliers.length > 0 ? Math.round(suppliers.reduce((sum, s) => sum + s.reliability, 0) / suppliers.length) : 0}%
              </p>
            </div>
            <ApperIcon name="TrendingUp" size={24} className="text-accent-500" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <SearchBar
            placeholder="Search suppliers by name, contact, products, or address..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      {filteredSuppliers.length === 0 ? (
        <Empty
          title="No suppliers found"
          description={searchQuery ? "No suppliers match your search criteria" : "Start by adding your first supplier"}
          action={searchQuery ? undefined : () => setShowModal(true)}
          actionLabel="Add Supplier"
          icon="Truck"
        />
      ) : (
        <DataTable
          data={filteredSuppliers}
          columns={columns}
          onRowClick={(supplier) => setSelectedSupplier(supplier)}
          actionButtons={(supplier) => (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon="Eye"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSupplier(supplier);
                }}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="Star"
                onClick={(e) => {
                  e.stopPropagation();
                  const newScore = prompt(`Update reliability score for ${supplier.name} (0-100):`, supplier.reliability);
                  if (newScore !== null && !isNaN(newScore) && newScore >= 0 && newScore <= 100) {
                    handleUpdateReliability(supplier.Id, parseInt(newScore));
                  }
                }}
              >
                Rate
              </Button>
            </div>
          )}
        />
      )}

      {/* Supplier Details Modal */}
      {selectedSupplier && !showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Supplier Details</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setSelectedSupplier(null)}
              />
            </div>
            <div className="p-6 space-y-6">
              {/* Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> {selectedSupplier.name}</div>
                    <div><span className="text-gray-600">Contact:</span> {selectedSupplier.contact}</div>
                    <div><span className="text-gray-600">Address:</span> {selectedSupplier.address}</div>
                    <div><span className="text-gray-600">Payment Terms:</span> <Badge variant="info">{selectedSupplier.paymentTerms}</Badge></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Reliability Score:</span> 
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
                            style={{ width: `${selectedSupplier.reliability}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{selectedSupplier.reliability}%</span>
                        <StatusIndicator status={getReliabilityStatus(selectedSupplier.reliability)} type="supplier" />
                      </div>
                    </div>
                    <div><span className="text-gray-600">Last Delivery:</span> {selectedSupplier.lastDelivery ? format(new Date(selectedSupplier.lastDelivery), "PPP") : "No deliveries yet"}</div>
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Product Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplier.products.map((product, idx) => (
                    <Badge key={idx} variant="primary">{product}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const newScore = prompt(`Update reliability score for ${selectedSupplier.name} (0-100):`, selectedSupplier.reliability);
                    if (newScore !== null && !isNaN(newScore) && newScore >= 0 && newScore <= 100) {
                      handleUpdateReliability(selectedSupplier.Id, parseInt(newScore));
                      setSelectedSupplier({ ...selectedSupplier, reliability: parseInt(newScore) });
                    }
                  }}
                >
                  Update Reliability
                </Button>
                <Button variant="primary" onClick={() => setSelectedSupplier(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Supplier</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowModal(false)}
              />
            </div>
            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4">
              <FormField
                label="Supplier Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter supplier name"
                required
              />
              <FormField
                label="Contact Information"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="Phone number or email"
                required
              />
              <FormField
                label="Address"
                type="textarea"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter supplier address"
              />
              <FormField
                label="Payment Terms"
                type="select"
                value={formData.paymentTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
              >
                {paymentTermsOptions.map(terms => (
                  <option key={terms} value={terms}>{terms}</option>
                ))}
              </FormField>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    placeholder="Add product category"
                    className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddProduct())}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddProduct}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.products.map((product, idx) => (
                    <Badge key={idx} variant="primary" className="flex items-center gap-1">
                      {product}
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product)}
                        className="ml-1 hover:text-red-600"
                      >
                        <ApperIcon name="X" size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Supplier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;