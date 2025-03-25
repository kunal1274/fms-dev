import { useNavigate } from 'react-router-dom';

const SidebarItem = ({ icon, label, isOpen, path }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)} // Navigate programmatically
      className="flex items-center space-x-3 p-3 hover:bg-gray-100 cursor-pointer"
      role="button"
      aria-label={label} // Accessibility improvement
    >
      {icon}
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

export default SidebarItem;
