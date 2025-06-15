
import Layout from '@/components/layout/Layout';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Heart } from 'lucide-react';

const FeedbackPage = () => {
  const breadcrumbs = [
    { label: "Feedback" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Share Your Feedback"
          description="Help us make your learning experience even better! Your thoughts and suggestions matter to us."
          icon={<Heart className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <FeedbackForm />
        </div>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
