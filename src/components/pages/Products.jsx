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
import productService from "@/services/api/productService";
import { toast } from "react-toastify";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [formData, setFormData] = useState({
    name: "",
    category: "Seeds",
    price: "",
    costPrice: "",
    stockQuantity: "",
    minStockLevel: "",
    supplier: "",
    description: "",
    unit: ""
  });

  const categories = ["All", "Seeds", "Fertilizers", "Pesticides", "Irrigation", "Tools"];

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await productService.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError("Failed to load products. Please try again.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (categoryFilter !== "All") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, products]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim() || !formData.price || !formData.stockQuantity) {
        toast.error("Please fill in all required fields");
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || 0,
        stockQuantity: parseInt(formData.stockQuantity),
        minStockLevel: parseInt(formData.minStockLevel) || 10
      };

      const newProduct = await productService.create(productData);
      setProducts(prev => [newProduct, ...prev]);
      setFormData({
        name: "",
        category: "Seeds",
        price: "",
        costPrice: "",
        stockQuantity: "",
        minStockLevel: "",
        supplier: "",
        description: "",
        unit: ""
      });
      setShowModal(false);
      toast.success("Product created successfully!");
    } catch (err) {
      toast.error("Failed to create product");
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await productService.updateStock(productId, newQuantity);
      setProducts(prev => prev.map(p => 
        p.Id === productId ? { ...p, stockQuantity: newQuantity } : p
      ));
      toast.success("Stock updated successfully!");
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  const getStockStatus = (product) => {
    if (product.stockQuantity === 0) return "Out of Stock";
    if (product.stockQuantity <= product.minStockLevel) return "Low Stock";
    return "In Stock";
  };

  const columns = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (value, product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <ApperIcon 
              name={
                product.category === "Seeds" ? "Sprout" :
                product.category === "Fertilizers" ? "Beaker" :
                product.category === "Pesticides" ? "Bug" :
                product.category === "Irrigation" ? "Droplets" :
                "Wrench"
              } 
              size={20} 
              className="text-primary-600" 
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{product.category}</div>
          </div>
        </div>
      )
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (value, product) => (
        <div>
          <div className="font-medium text-gray-900">${value.toFixed(2)}</div>
          <div className="text-sm text-gray-600">per {product.unit}</div>
        </div>
      )
    },
    {
      key: "stockQuantity",
      header: "Stock",
      sortable: true,
      render: (value, product) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{value}</span>
          <StatusIndicator status={getStockStatus(product)} type="stock" />
        </div>
      )
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (value) => (
        <div className="text-sm text-gray-700">{value}</div>
      )
    },
    {
      key: "barcode",
      header: "Barcode",
      render: (value) => (
        <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {value}
        </div>
      )
    }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadProducts} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
          <p className="text-gray-600">Manage your agricultural products and inventory levels</p>
        </div>
        <Button 
          variant="primary" 
          icon="Package"
          onClick={() => setShowModal(true)}
        >
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <SearchBar
              placeholder="Search products by name, category, or supplier..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <ApperIcon name="Package" size={24} className="text-primary-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0).length}
              </p>
            </div>
            <ApperIcon name="AlertTriangle" size={24} className="text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stockQuantity === 0).length}
              </p>
            </div>
            <ApperIcon name="XCircle" size={24} className="text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-primary-600">
                ${products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0).toFixed(0)}
              </p>
            </div>
            <ApperIcon name="DollarSign" size={24} className="text-primary-500" />
          </div>
        </Card>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <Empty
          title="No products found"
          description={searchQuery || categoryFilter !== "All" ? "No products match your search criteria" : "Start by adding your first product"}
          action={searchQuery || categoryFilter !== "All" ? undefined : () => setShowModal(true)}
          actionLabel="Add Product"
          icon="Package"
        />
      ) : (
        <DataTable
          data={filteredProducts}
          columns={columns}
          onRowClick={(product) => setSelectedProduct(product)}
          actionButtons={(product) => (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon="Eye"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(product);
                }}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon="Package"
                onClick={async (e) => {
                  e.stopPropagation();
                  const newQuantity = prompt(`Update stock for ${product.name}:`, product.stockQuantity);
                  if (newQuantity !== null && !isNaN(newQuantity) && parseInt(newQuantity) >= 0) {
                    await handleUpdateStock(product.Id, parseInt(newQuantity));
                  }
                }}
              >
                Stock
              </Button>
            </div>
          )}
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && !showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setSelectedProduct(null)}
              />
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Product Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Name:</span> {selectedProduct.name}</div>
                      <div><span className="text-gray-600">Category:</span> <Badge variant="primary">{selectedProduct.category}</Badge></div>
                      <div><span className="text-gray-600">Description:</span> {selectedProduct.description}</div>
                      <div><span className="text-gray-600">Unit:</span> {selectedProduct.unit}</div>
                      <div><span className="text-gray-600">Barcode:</span> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedProduct.barcode}</code></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Pricing & Stock</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Selling Price:</span> <span className="font-semibold text-primary-700">${selectedProduct.price.toFixed(2)}</span></div>
                      <div><span className="text-gray-600">Cost Price:</span> ${selectedProduct.costPrice.toFixed(2)}</div>
                      <div><span className="text-gray-600">Profit Margin:</span> {selectedProduct.price > selectedProduct.costPrice ? `${(((selectedProduct.price - selectedProduct.costPrice) / selectedProduct.price) * 100).toFixed(1)}%` : "N/A"}</div>
                      <div><span className="text-gray-600">Stock Quantity:</span> <span className="font-semibold">{selectedProduct.stockQuantity}</span></div>
                      <div><span className="text-gray-600">Min Stock Level:</span> {selectedProduct.minStockLevel}</div>
                      <div><span className="text-gray-600">Status:</span> <StatusIndicator status={getStockStatus(selectedProduct)} type="stock" /></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Supplier</h4>
                    <div className="text-sm">
                      <div><span className="text-gray-600">Supplier:</span> {selectedProduct.supplier}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const newQuantity = prompt(`Update stock for ${selectedProduct.name}:`, selectedProduct.stockQuantity);
                    if (newQuantity !== null && !isNaN(newQuantity) && parseInt(newQuantity) >= 0) {
                      await handleUpdateStock(selectedProduct.Id, parseInt(newQuantity));
                      setSelectedProduct({ ...selectedProduct, stockQuantity: parseInt(newQuantity) });
                    }
                  }}
                >
                  Update Stock
                </Button>
                <Button variant="primary" onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={() => setShowModal(false)}
              />
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
                <FormField
                  label="Category"
                  type="select"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.filter(cat => cat !== "All").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </FormField>
              </div>
              <FormField
                label="Description"
                type="textarea"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Selling Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
                <FormField
                  label="Cost Price"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
                  placeholder="0.00"
                />
                <FormField
                  label="Unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., per bag, each"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Stock Quantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                  placeholder="0"
                  required
                />
                <FormField
                  label="Minimum Stock Level"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                  placeholder="10"
                />
              </div>
              <FormField
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="Enter supplier name"
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;