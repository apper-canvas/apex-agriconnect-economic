import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ className, variant = "primary", size = "md", icon, children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "premium-gradient text-white hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-primary-500",
    secondary: "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 hover:shadow-md focus:ring-primary-500",
    outline: "bg-transparent text-primary-700 border border-primary-300 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    accent: "accent-gradient text-white hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-accent-500",
    danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
    xl: "px-8 py-4 text-lg gap-3"
  };

  return (
    <button
      ref={ref}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <ApperIcon name={icon} size={size === "sm" ? 16 : size === "lg" || size === "xl" ? 20 : 18} />}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;