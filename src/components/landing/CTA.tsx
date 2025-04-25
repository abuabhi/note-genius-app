
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <div className="bg-purple-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to boost your grades?</span>
          <span className="block text-purple-200">Start using StudyAI today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-purple-800">
              <Link to="/features">Learn more</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
