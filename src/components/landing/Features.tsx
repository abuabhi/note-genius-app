
import { BookOpen, Brain, Users, Calendar } from "lucide-react";

const features = [
  {
    name: "Smart Learning Paths",
    description: "AI-powered study recommendations tailored to your learning style and goals.",
    icon: Brain,
    gradient: "from-mint-400 to-mint-500",
  },
  {
    name: "Interactive Courses",
    description: "Engaging video lessons, quizzes, and hands-on projects to master new skills.",
    icon: BookOpen,
    gradient: "from-purple-400 to-purple-500",
  },
  {
    name: "Progress Tracking",
    description: "Visual analytics and insights to monitor your learning journey.",
    icon: Calendar,
    gradient: "from-mint-400 to-purple-400",
  },
  {
    name: "Study Groups",
    description: "Connect with peers and join study groups for collaborative learning.",
    icon: Users,
    gradient: "from-purple-400 to-mint-400",
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-mint-600 tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything you need to excel
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
            Tools and features designed to make learning effective and enjoyable
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative group rounded-xl transition-all duration-200 hover:scale-105"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r opacity-75 blur-sm transition duration-200"
                style={{
                  backgroundImage: `linear-gradient(to right, ${feature.gradient})`,
                }}
              />
              <div className="relative h-full p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div>
                  <span className="inline-flex items-center justify-center p-3 rounded-lg bg-gradient-to-br" style={{backgroundImage: `linear-gradient(to bottom right, ${feature.gradient})`}}>
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
