
import { Link } from 'react-router-dom';

export const AppLogo = () => {
  return (
    <Link to="/" className="text-2xl font-bold flex items-center ml-2">
      <span className="text-mint-600">Prep</span>
      <span className="text-gray-900">Genie</span>
    </Link>
  );
};
