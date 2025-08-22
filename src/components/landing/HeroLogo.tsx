import { Link } from 'react-router-dom';

export const HeroLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center justify-center space-x-2 sm:space-x-3 group transition-transform duration-200 hover:scale-105 mb-6 sm:mb-8"
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
        <span className="text-white font-bold text-lg sm:text-2xl">P</span>
      </div>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
        <span className="text-mint-600">Prep</span>
        <span className="text-gray-800">Genie</span>
      </div>
    </Link>
  );
};