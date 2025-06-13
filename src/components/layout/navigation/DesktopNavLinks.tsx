
import { Link, useLocation } from 'react-router-dom';

interface DesktopNavLinksProps {
  isPublicRoute: boolean;
}

export const DesktopNavLinks = ({ isPublicRoute }: DesktopNavLinksProps) => {
  const location = useLocation();

  if (!isPublicRoute) {
    return null;
  }

  const publicNavItems = [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <div className="flex items-center space-x-8">
      {publicNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`text-sm font-medium transition-colors hover:text-mint-600 ${
            location.pathname === item.href
              ? 'text-mint-600'
              : 'text-gray-700'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};
