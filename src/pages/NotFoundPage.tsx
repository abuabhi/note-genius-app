
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="max-w-md w-full text-center">
          <h1 className="text-6xl font-extrabold text-mint-600">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-mint-800">Page not found</h2>
          <p className="mt-2 text-sm text-mint-600">Sorry, we couldn't find the page you're looking for.</p>
          <div className="mt-6">
            <Button asChild className="bg-mint-600 hover:bg-mint-700 text-white">
              <Link to="/">Go back home</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
