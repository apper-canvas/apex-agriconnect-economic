import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const StatusIndicator = ({ status, type = "default" }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      stock: {
        "In Stock": { variant: "success", icon: "CheckCircle" },
        "Low Stock": { variant: "warning", icon: "AlertCircle" },
        "Out of Stock": { variant: "danger", icon: "XCircle" }
      },
      payment: {
        "Paid": { variant: "success", icon: "CheckCircle" },
        "Pending": { variant: "warning", icon: "Clock" },
        "Overdue": { variant: "danger", icon: "AlertTriangle" },
        "Partial": { variant: "info", icon: "Info" }
      },
      order: {
        "Completed": { variant: "success", icon: "CheckCircle" },
        "Pending": { variant: "warning", icon: "Clock" },
        "Processing": { variant: "info", icon: "RotateCw" },
        "Cancelled": { variant: "danger", icon: "XCircle" }
      },
      supplier: {
        "Reliable": { variant: "success", icon: "CheckCircle" },
        "Good": { variant: "info", icon: "ThumbsUp" },
        "Average": { variant: "warning", icon: "Minus" },
        "Poor": { variant: "danger", icon: "ThumbsDown" }
      }
    };

    return configs[type]?.[status] || { variant: "default", icon: "Circle" };
  };

  const config = getStatusConfig(status, type);

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <ApperIcon name={config.icon} size={12} />
      {status}
    </Badge>
  );
};

export default StatusIndicator;