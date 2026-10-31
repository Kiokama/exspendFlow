import React from "react";
import { CategoryKey } from "../types";
import { 
  Home, 
  ShoppingBag, 
  Utensils, 
  Zap, 
  Gift, 
  Film, 
  Car, 
  HeartPulse, 
  MoreHorizontal,
  DollarSign
} from "lucide-react";

interface CategoryIconProps {
  category: CategoryKey | string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "w-5 h-5" }) => {
  switch (category) {
    case "Housing":
      return <Home className={className} />;
    case "Groceries":
      return <ShoppingBag className={className} />;
    case "Dating":
      return <Utensils className={className} />;
    case "Utilities":
      return <Zap className={className} />;
    case "Shopping":
      return <Gift className={className} />;
    case "Entertainment":
      return <Film className={className} />;
    case "Transportation":
      return <Car className={className} />;
    case "Health":
      return <HeartPulse className={className} />;
    case "Other":
    default:
      return <MoreHorizontal className={className} />;
  }
};
