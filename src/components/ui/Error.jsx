import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry, 
  title = "Error"
}) => {
  return (
    <Card className="max-w-md mx-auto text-center">
      <CardContent className="p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <ApperIcon name="AlertCircle" size={32} className="text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="primary" icon="RefreshCw">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Error;