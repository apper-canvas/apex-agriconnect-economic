import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "@/components/molecules/MetricCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import productService from "@/services/api/productService";
import salesService from "@/services/api/salesService";
import customerService from "@/services/api/customerService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [salesMetrics, lowStock, sales, customers] = await Promise.all([
        salesService.getSalesMetrics(),
        productService.getLowStockProducts(),
        salesService.getAll(),
        customerService.getAll()
      ]);

      setMetrics(salesMetrics);
      setLowStockProducts(lowStock.slice(0, 5));
      setRecentSales(sales.slice(-5).reverse());
      setRecentCustomers(customers.slice(-4));
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading type="metrics" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApperIcon name="Zap" className="text-accent-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="primary" 
              icon="UserPlus" 
              size="sm"
              onClick={() => navigate("/customers")}
            >
              Add Customer
            </Button>
            <Button 
              variant="secondary" 
              icon="Package" 
              size="sm"
              onClick={() => navigate("/products")}
            >
              Add Product
            </Button>
            <Button 
              variant="accent" 
              icon="ShoppingCart" 
              size="sm"
              onClick={() => navigate("/sales")}
            >
              New Sale
            </Button>
            <Button 
              variant="outline" 
              icon="BarChart3" 
              size="sm"
              onClick={() => navigate("/reports")}
            >
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={`$${metrics.totalSales?.toFixed(2) || "0.00"}`}
          change="+12.5%"
          changeType="positive"
          icon="DollarSign"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders || 0}
          change="+8 today"
          changeType="positive"
          icon="ShoppingBag"
        />
        <MetricCard
          title="Average Order"
          value={`$${metrics.averageOrderValue?.toFixed(2) || "0.00"}`}
          change="+5.2%"
          changeType="positive"
          icon="TrendingUp"
        />
        <MetricCard
          title="Pending Payments"
          value={`$${metrics.pendingAmount?.toFixed(2) || "0.00"}`}
          change={`${metrics.pendingOrders || 0} orders`}
          changeType="warning"
          icon="Clock"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ApperIcon name="AlertTriangle" className="text-accent-500" />
                Low Stock Alerts
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                icon="ArrowRight"
                onClick={() => navigate("/products")}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map(product => (
                  <div key={product.Id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">
                        {product.stockQuantity} left
                      </Badge>
                      <ApperIcon name="Package" size={16} className="text-yellow-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="CheckCircle" size={48} className="mx-auto mb-2 text-green-500" />
                <p>All products are well stocked!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ApperIcon name="ShoppingCart" className="text-primary-500" />
                Recent Sales
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                icon="ArrowRight"
                onClick={() => navigate("/sales")}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.map(sale => (
                <div key={sale.Id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{sale.customerName}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(sale.orderDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${sale.total.toFixed(2)}
                    </span>
                    <Badge variant={
                      sale.paymentStatus === "Paid" ? "success" : 
                      sale.paymentStatus === "Pending" ? "warning" : "danger"
                    }>
                      {sale.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ApperIcon name="Users" className="text-secondary-500" />
              Recent Customers
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              icon="ArrowRight"
              onClick={() => navigate("/customers")}
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentCustomers.map(customer => (
              <div key={customer.Id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                   onClick={() => navigate("/customers")}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 premium-gradient rounded-full flex items-center justify-center">
                    <ApperIcon name="User" size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{customer.name}</h4>
                    <p className="text-xs text-gray-600">{customer.farmSize}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Purchases:</span>
                    <span className="font-medium">${customer.totalPurchases.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loyalty Points:</span>
                    <span className="font-medium text-accent-600">{customer.loyaltyPoints}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;