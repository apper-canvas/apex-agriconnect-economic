import { useState } from "react";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className,
  value: controlledValue,
  onChange: controlledOnChange
}) => {
  const [localValue, setLocalValue] = useState("");
  
  const value = controlledValue !== undefined ? controlledValue : localValue;
  const onChange = controlledOnChange !== undefined ? controlledOnChange : setLocalValue;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <ApperIcon
        name="Search"
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4"
      />
    </form>
  );
};

export default SearchBar;