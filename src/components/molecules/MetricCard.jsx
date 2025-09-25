import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  className 
}) => {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  };

  return (
    <Card className={cn("metric-card hover:shadow-lg transition-shadow duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change && (
                <span className={cn("text-sm font-medium flex items-center gap-1", changeColors[changeType])}>
                  <ApperIcon 
                    name={changeType === "positive" ? "TrendingUp" : changeType === "negative" ? "TrendingDown" : "Minus"} 
                    size={14} 
                  />
                  {change}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className="w-12 h-12 premium-gradient rounded-lg flex items-center justify-center">
              <ApperIcon name={icon} size={24} className="text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;