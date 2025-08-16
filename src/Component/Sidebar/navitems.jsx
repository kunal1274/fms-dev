import {
  FaUser,
  FaTruck,
  FaBoxOpen,
  FaShoppingCart,
  FaCartPlus,
  FaCog,
  FaWarehouse,
  FaMapMarkerAlt,
} from "react-icons/fa";

export const navItems = [
  {
    label: "Company",
    icon: FaTruck,
    subItems: [
      { label: "Company List", icon: FaWarehouse },
      { label: "Company Form", icon: FaCog },
    ],
  },
  {
    label: "Inventory",
    icon: FaBoxOpen,
    subItems: [
      { label: "Item List", icon: FaWarehouse },
      { label: "Item Form", icon: FaCog },
    ],
  },
  {
    label: "Sale",
    icon: FaShoppingCart,
    subItems: [
      { label: "Customer", icon: FaUser },
      { label: "Sale Orders", icon: FaShoppingCart },
    ],
  },
  {
    label: "Purchase",
    icon: FaCartPlus,
    subItems: [
      { label: "Vendor", icon: FaTruck },
      { label: "Purchase Orders", icon: FaCartPlus },
    ],
  },
  {
    label: "Bank",
    icon: FaMapMarkerAlt,
    subItems: [
      { label: "Bank List", icon: FaWarehouse },
      { label: "Bank Form", icon: FaCog },
    ],
  },
  { label: "User", icon: FaUser },
  { label: "Accounting And Tax", icon: FaUser },
];
