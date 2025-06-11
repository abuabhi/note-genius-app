
import { Link } from 'react-router-dom';

export const AppLogo = () => {
  return (
    <Link to="/" className="text-2xl font-bold flex items-center">
      <span className="text-primary">Prep</span>
      <span>Genie</span>
    </Link>
  );
};
