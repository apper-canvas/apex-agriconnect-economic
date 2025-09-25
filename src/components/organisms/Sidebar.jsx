import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { name: "Customers", href: "/customers", icon: "Users" },
    { name: "Products", href: "/products", icon: "Package" },
    { name: "Sales", href: "/sales", icon: "ShoppingCart" },
    { name: "Suppliers", href: "/suppliers", icon: "Truck" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-200">
            <div className="w-10 h-10 premium-gradient rounded-lg flex items-center justify-center">
              <ApperIcon name="Sprout" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AgriConnect</h1>
              <p className="text-xs text-gray-600">CRM System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "premium-gradient text-white shadow-lg" 
                      : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                  )}
                >
                  <ApperIcon name={item.icon} size={18} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50">
              <div className="w-8 h-8 accent-gradient rounded-full flex items-center justify-center">
                <ApperIcon name="Leaf" size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-900">Farm Fresh</p>
                <p className="text-xs text-primary-700">Agricultural Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;