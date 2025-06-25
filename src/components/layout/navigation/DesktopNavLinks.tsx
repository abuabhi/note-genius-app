
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
    <div className="flex items-center bg-gray-50/60 rounded-full px-6 py-2 backdrop-blur-sm border border-gray-200/50">
      {publicNavItems.map((item, index) => (
        <div key={item.name} className="flex items-center">
          <Link
            to={item.href}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              location.pathname === item.href
                ? 'text-mint-700 bg-white shadow-sm border border-mint-100'
                : 'text-gray-600 hover:text-mint-600 hover:bg-white/60'
            }`}
          >
            {item.name}
          </Link>
          {index < publicNavItems.length - 1 && (
            <div className="w-px h-4 bg-gray-300/50 mx-1" />
          )}
        </div>
      ))}
    </div>
  );
};
