
import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { Helmet } from 'react-helmet';
import { FloatingSessionTimer } from '@/components/ui/floating/FloatingSessionTimer';
import { HelpFloatingButton } from '@/components/help/HelpFloatingButton';
import { SimpleHelpDialog } from '@/components/help/SimpleHelpDialog';
import { useSimpleHelp } from '@/contexts/SimpleHelpContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isOpen, closeHelp } = useSimpleHelp();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mint-50 via-white to-blue-50">
      <NavBar />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "PrepGenie",
            "url": typeof window !== 'undefined' ? window.location.origin : "",
            "logo": "/favicon.ico"
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "PrepGenie",
            "url": typeof window !== 'undefined' ? window.location.origin : "",
            "potentialAction": {
              "@type": "SearchAction",
              "target": typeof window !== 'undefined' ? `${window.location.origin}/search?q={search_term_string}` : "/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingSessionTimer />
      <HelpFloatingButton />
      <SimpleHelpDialog open={isOpen} onOpenChange={(open) => !open && closeHelp()} />
    </div>
  );
};

export default Layout;
