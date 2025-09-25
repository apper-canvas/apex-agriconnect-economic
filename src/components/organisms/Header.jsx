import { useState } from "react";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";
import { useNavigate, useLocation } from "react-router-dom";

const Header = ({ onMobileMenuToggle }) => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    const titles = {
      "/dashboard": "Dashboard",
      "/customers": "Customer Management",
      "/products": "Product Inventory", 
      "/sales": "Sales & Orders",
      "/suppliers": "Supplier Management",
      "/reports": "Reports & Analytics"
    };
    return titles[pathname] || "AgriConnect CRM";
  };

  const handleSearch = (query) => {
    // Global search functionality would be implemented here
    console.log("Searching for:", query);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon="Menu"
            onClick={onMobileMenuToggle}
            className="lg:hidden"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getPageTitle(location.pathname)}
            </h1>
            <p className="text-sm text-gray-600">
              Welcome back, manage your agricultural store efficiently
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar
            placeholder="Search customers, products, orders..."
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            className="hidden md:block w-80"
          />
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon="Bell" className="relative">
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center">
              <ApperIcon name="User" size={18} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;