import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';

const HelpRedirectPage = () => {
  useEffect(() => {
    // Replace with your actual GitBook domain
    // Example: https://help.yourdomain.com or https://yourorg.gitbook.io/help
    const gitbookUrl = 'https://help.yourdomain.com'; // Update this URL
    
    // Redirect after a short delay to show the message
    const timer = setTimeout(() => {
      window.location.href = gitbookUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Help Center - Redirecting...</title>
        <meta name="description" content="Redirecting to our help documentation" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-6 p-8 rounded-lg bg-card shadow-lg max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              Redirecting to Help Center...
            </h2>
            <p className="text-muted-foreground">
              You'll be redirected to our comprehensive help documentation shortly.
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>If you're not redirected automatically,</p>
            <a 
              href="https://help.yourdomain.com" 
              className="text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              click here to visit our Help Center
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpRedirectPage;