import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import MetricCard from "@/components/molecules/MetricCard";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import salesService from "@/services/api/salesService";
import productService from "@/services/api/productService";
import customerService from "@/services/api/customerService";
import supplierService from "@/services/api/supplierService";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "react-toastify";

const Reports = () => {
  const [salesMetrics, setSalesMetrics] = useState({});
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [supplierReport, setSupplierReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("thisMonth");

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError("");

      const [sales, customers, products, suppliers] = await Promise.all([
        salesService.getAll(),
        customerService.getAll(),
        productService.getAll(),
        supplierService.getAll()
      ]);

      // Calculate date range
      let startDate, endDate;
      const now = new Date();
      
      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "last7days":
          startDate = subDays(now, 7);
          endDate = now;
          break;
        case "last30days":
          startDate = subDays(now, 30);
          endDate = now;
          break;
        case "thisMonth":
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
      }

      // Filter sales by date range
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.orderDate);
        return saleDate >= startDate && saleDate <= endDate;
      });

      // Sales Metrics
      const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalOrders = filteredSales.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      const paidSales = filteredSales.filter(sale => sale.paymentStatus === "Paid");
      const paidAmount = paidSales.reduce((sum, sale) => sum + sale.total, 0);

      setSalesMetrics({
        totalSales,
        totalOrders,
        averageOrderValue,
        paidAmount,
        totalCustomers: customers.length,
        totalProducts: products.length
      });

      // Top Customers (by total purchases)
      const customerSales = {};
      filteredSales.forEach(sale => {
        if (!customerSales[sale.customerId]) {
          customerSales[sale.customerId] = {
            customerId: sale.customerId,
            customerName: sale.customerName,
            totalSpent: 0,
            orderCount: 0
          };
        }
        customerSales[sale.customerId].totalSpent += sale.total;
        customerSales[sale.customerId].orderCount += 1;
      });

      const topCustomersList = Object.values(customerSales)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      setTopCustomers(topCustomersList);

      // Top Products (by quantity sold)
      const productSales = {};
      filteredSales.forEach(sale => {
        sale.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              productId: item.productId,
              productName: item.productName,
              quantitySold: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantitySold += item.quantity;
          productSales[item.productId].revenue += item.total;
        });
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5);

      setTopProducts(topProductsList);

      // Low Stock Products
      const lowStock = products
        .filter(product => product.stockQuantity <= product.minStockLevel)
        .sort((a, b) => a.stockQuantity - b.stockQuantity)
        .slice(0, 10);

      setLowStockProducts(lowStock);

      // Supplier Report
      const reliableSuppliers = suppliers.filter(s => s.reliability >= 90).length;
      const totalSuppliers = suppliers.length;
      const avgReliability = totalSuppliers > 0 
        ? Math.round(suppliers.reduce((sum, s) => sum + s.reliability, 0) / totalSuppliers)
        : 0;

      setSupplierReport({
        totalSuppliers,
        reliableSuppliers,
        avgReliability
      });

    } catch (err) {
      setError("Failed to load reports data. Please try again.");
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  if (loading) return <Loading type="metrics" />;
  if (error) return <Error message={error} onRetry={loadReportsData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your agricultural business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
          </select>
          <Button variant="secondary" icon="Download">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${salesMetrics.totalSales?.toFixed(2) || "0.00"}`}
          change="+15.3%"
          changeType="positive"
          icon="DollarSign"
        />
        <MetricCard
          title="Orders Processed"
          value={salesMetrics.totalOrders || 0}
          change="+8.2%"
          changeType="positive"
          icon="ShoppingBag"
        />
        <MetricCard
          title="Average Order Value"
          value={`$${salesMetrics.averageOrderValue?.toFixed(2) || "0.00"}`}
          change="+5.7%"
          changeType="positive"
          icon="TrendingUp"
        />
        <MetricCard
          title="Customer Base"
          value={salesMetrics.totalCustomers || 0}
          change="+12 new"
          changeType="positive"
          icon="Users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Trophy" className="text-accent-500" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 premium-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{customer.customerName}</h4>
                        <p className="text-sm text-gray-600">{customer.orderCount} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-700">${customer.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Users" size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No customer data for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Star" className="text-primary-500" />
              Best Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 accent-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{product.productName}</h4>
                        <p className="text-sm text-gray-600">{product.quantitySold} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent-700">${product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Package" size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No product sales for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="AlertTriangle" className="text-yellow-500" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {lowStockProducts.filter(p => p.stockQuantity === 0).length}
                      </p>
                      <p className="text-xs text-red-700">Out of Stock</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {lowStockProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length}
                      </p>
                      <p className="text-xs text-yellow-700">Low Stock</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {salesMetrics.totalProducts - lowStockProducts.length}
                      </p>
                      <p className="text-xs text-green-700">Well Stocked</p>
                    </div>
                  </div>
                  {lowStockProducts.slice(0, 5).map(product => (
                    <div key={product.Id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={product.stockQuantity === 0 ? "danger" : "warning"}>
                          {product.stockQuantity} left
                        </Badge>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="CheckCircle" size={48} className="mx-auto mb-2 text-green-500" />
                  <p>All products are well stocked!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supplier Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Truck" className="text-secondary-500" />
              Supplier Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary-700">{supplierReport.totalSuppliers}</p>
                  <p className="text-sm text-primary-600">Total Suppliers</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{supplierReport.reliableSuppliers}</p>
                  <p className="text-sm text-green-600">Reliable (90%+)</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Reliability Score</span>
                  <span className="text-lg font-bold text-gray-900">{supplierReport.avgReliability}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
                    style={{ width: `${supplierReport.avgReliability}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-700">
                    {Math.round((supplierReport.reliableSuppliers / supplierReport.totalSuppliers) * 100) || 0}%
                  </p>
                  <p className="text-xs text-blue-600">Reliability Rate</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-700">8</p>
                  <p className="text-xs text-purple-600">Active Partners</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900 mb-2">Sales Performance</h3>
                <p className="text-3xl font-bold text-primary-700 mb-1">
                  ${salesMetrics.paidAmount?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-primary-600">Confirmed Revenue</p>
              </div>
              <ApperIcon name="TrendingUp" size={32} className="text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Customer Growth</h3>
                <p className="text-3xl font-bold text-green-700 mb-1">+12.5%</p>
                <p className="text-sm text-green-600">vs Previous Period</p>
              </div>
              <ApperIcon name="Users" size={32} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-accent-900 mb-2">Inventory Health</h3>
                <p className="text-3xl font-bold text-accent-700 mb-1">
                  {Math.round(((salesMetrics.totalProducts - lowStockProducts.length) / salesMetrics.totalProducts) * 100) || 0}%
                </p>
                <p className="text-sm text-accent-600">Well Stocked Items</p>
              </div>
              <ApperIcon name="Package" size={32} className="text-accent-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;