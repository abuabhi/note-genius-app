import { BookOpen, Brain, Users, Calendar } from "lucide-react";

const features = [
  {
    name: "Smart Learning Paths",
    description: "AI-powered study recommendations tailored to your learning style and goals.",
    icon: Brain,
  },
  {
    name: "Interactive Courses",
    description: "Engaging video lessons, quizzes, and hands-on projects to master new skills.",
    icon: BookOpen,
  },
  {
    name: "Progress Tracking",
    description: "Visual analytics and insights to monitor your learning journey.",
    icon: Calendar,
  },
  {
    name: "Study Groups",
    description: "Connect with peers and join study groups for collaborative learning.",
    icon: Users,
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-gradient-to-b from-mint-50/10 via-white to-mint-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
            Why Choose Us
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything you need to excel
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Tools and features designed to make learning effective and enjoyable
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative group rounded-2xl transition-all duration-200 hover:scale-105"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-200" />
              <div className="relative h-full p-6 bg-white rounded-2xl border border-mint-100">
                <div>
                  <span className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-mint-400 to-neutral-400">
                    <feature.icon className="h-6 w-6 text-white" />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
