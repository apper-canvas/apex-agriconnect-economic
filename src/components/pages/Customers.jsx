import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import DataTable from "@/components/molecules/DataTable";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import customerService from "@/services/api/customerService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    farmSize: "",
    cropTypes: []
  });
  const [communicationData, setCommunicationData] = useState({
    type: "call",
    notes: ""
  });
  const [cropInput, setCropInput] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await customerService.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError("Failed to load customers. Please try again.");
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.cropTypes.some(crop => crop.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      const customerData = {
        ...formData,
        cropTypes: formData.cropTypes.length > 0 ? formData.cropTypes : []
      };

      const newCustomer = await customerService.create(customerData);
      setCustomers(prev => [newCustomer, ...prev]);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        farmSize: "",
        cropTypes: []
      });
      setCropInput("");
      setShowModal(false);
      toast.success("Customer created successfully!");
    } catch (err) {
      toast.error("Failed to create customer");
    }
  };

  const handleAddCropType = () => {
    if (cropInput.trim() && !formData.cropTypes.includes(cropInput.trim())) {
      setFormData(prev => ({
        ...prev,
        cropTypes: [...prev.cropTypes, cropInput.trim()]
      }));
      setCropInput("");
    }
  };

  const handleRemoveCropType = (crop) => {
    setFormData(prev => ({
      ...prev,
      cropTypes: prev.cropTypes.filter(c => c !== crop)
    }));
  };

  const handleAddCommunication = async (e) => {
    e.preventDefault();
    try {
      if (!communicationData.notes.trim()) {
        toast.error("Please add communication notes");
        return;
      }

      await customerService.addCommunication(selectedCustomer.Id, communicationData);
      const updatedCustomer = await customerService.getById(selectedCustomer.Id);
      setSelectedCustomer(updatedCustomer);
      setCustomers(prev => prev.map(c => c.Id === updatedCustomer.Id ? updatedCustomer : c));
      setCommunicationData({ type: "call", notes: "" });
      setShowCommunicationModal(false);
      toast.success("Communication logged successfully!");
    } catch (err) {
      toast.error("Failed to log communication");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Customer Name",
      sortable: true,
      render: (value, customer) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 premium-gradient rounded-full flex items-center justify-center">
            <ApperIcon name="User" size={16} className="text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{customer.farmSize}</div>
          </div>
        </div>
      )
    },
    {
      key: "phone",
      header: "Contact",
      render: (value, customer) => (
        <div>
          <div className="text-sm font-medium">{value}</div>
          <div className="text-sm text-gray-600">{customer.email}</div>
        </div>
      )
    },
    {
      key: "cropTypes",
      header: "Crop Types",
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((crop, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {crop}
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
      key: "totalPurchases",
      header: "Total Purchases",
      sortable: true,
      render: (value) => (
        <div className="font-medium text-primary-700">
          ${value.toFixed(2)}
        </div>
      )
    },
    {
      key: "loyaltyPoints",
      header: "Loyalty Points",
      sortable: true,
      render: (value) => (
        <Badge variant="accent" className="font-medium">
          {value} pts
        </Badge>
      )
    },
    {
      key: "lastVisit",
      header: "Last Visit",
      sortable: true,
      render: (value) => value ? format(new Date(value), "MMM dd, yyyy") : "Never"
    }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCustomers} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your agricultural customers and their relationships</p>
        </div>
        <Button 
          variant="primary" 
          icon="UserPlus"
          onClick={() => setShowModal(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <SearchBar
            placeholder="Search customers by name, phone, email, or crop types..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Customer Table */}
      {filteredCustomers.length === 0 ? (
        <Empty
          title="No customers found"
          description={searchQuery ? "No customers match your search criteria" : "Start by adding your first customer"}
          action={searchQuery ? undefined : () => setShowModal(true)}
          actionLabel="Add Customer"
          icon="Users"
        />
      ) : (
        <DataTable
          data={filteredCustomers}
          columns={columns}
          onRowClick={(customer) => setSelectedCustomer(customer)}
          actionButtons={(customer) => (
            <Button
              variant="ghost"
              size="sm"
              icon="Eye"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCustomer(customer);
              }}
            >
              View
            </Button>
          )}
        />
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && !showModal && !showCommunicationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setSelectedCustomer(null)}
              />
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> {selectedCustomer.name}</div>
                    <div><span className="text-gray-600">Phone:</span> {selectedCustomer.phone}</div>
                    <div><span className="text-gray-600">Email:</span> {selectedCustomer.email}</div>
                    <div><span className="text-gray-600">Address:</span> {selectedCustomer.address}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Farm Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Farm Size:</span> {selectedCustomer.farmSize}</div>
                    <div><span className="text-gray-600">Total Purchases:</span> ${selectedCustomer.totalPurchases.toFixed(2)}</div>
                    <div><span className="text-gray-600">Loyalty Points:</span> {selectedCustomer.loyaltyPoints}</div>
                    <div><span className="text-gray-600">Last Visit:</span> {selectedCustomer.lastVisit ? format(new Date(selectedCustomer.lastVisit), "PPP") : "Never"}</div>
                  </div>
                </div>
              </div>

              {/* Crop Types */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Crop Types</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.cropTypes.map((crop, idx) => (
                    <Badge key={idx} variant="primary">{crop}</Badge>
                  ))}
                </div>
              </div>

              {/* Communication Log */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Communication Log</h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="Plus"
                    onClick={() => setShowCommunicationModal(true)}
                  >
                    Add Note
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedCustomer.communicationLog && selectedCustomer.communicationLog.length > 0 ? (
                    selectedCustomer.communicationLog.map((log, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={log.type === "visit" ? "primary" : log.type === "call" ? "info" : "secondary"}>
                            {log.type}
                          </Badge>
                          <span className="text-xs text-gray-600">
                            {format(new Date(log.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{log.notes}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No communication history</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Customer</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowModal(false)}
              />
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <FormField
                label="Customer Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter customer name"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                />
                <FormField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <FormField
                label="Farm Address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter farm address"
                required
              />
              <FormField
                label="Farm Size"
                value={formData.farmSize}
                onChange={(e) => setFormData(prev => ({ ...prev, farmSize: e.target.value }))}
                placeholder="e.g., 50 acres"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Crop Types</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cropInput}
                    onChange={(e) => setCropInput(e.target.value)}
                    placeholder="Add crop type"
                    className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCropType())}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddCropType}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.cropTypes.map((crop, idx) => (
                    <Badge key={idx} variant="primary" className="flex items-center gap-1">
                      {crop}
                      <button
                        type="button"
                        onClick={() => handleRemoveCropType(crop)}
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
                  Create Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommunicationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Communication</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowCommunicationModal(false)}
              />
            </div>
            <form onSubmit={handleAddCommunication} className="p-6 space-y-4">
              <FormField
                label="Communication Type"
                type="select"
                value={communicationData.type}
                onChange={(e) => setCommunicationData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="call">Phone Call</option>
                <option value="visit">Store Visit</option>
                <option value="email">Email</option>
                <option value="meeting">Farm Visit</option>
              </FormField>
              <FormField
                label="Notes"
                type="textarea"
                value={communicationData.notes}
                onChange={(e) => setCommunicationData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter communication notes..."
                required
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowCommunicationModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Communication
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;