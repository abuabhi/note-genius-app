
import { Link } from 'react-router-dom';

export const AppLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center space-x-1 group transition-transform duration-200 hover:scale-105"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
        <span className="text-white font-bold text-sm">P</span>
      </div>
      <div className="text-xl font-bold">
        <span className="text-mint-600">Prep</span>
        <span className="text-gray-800">Genie</span>
      </div>
    </Link>
  );
};
