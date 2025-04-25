
import { Brain, Zap, Star, Users } from "lucide-react";

const features = [
  {
    name: "Smart AI Analysis",
    description: "Our AI understands your notes and learning style, creating personalized study materials that work for you.",
    icon: Brain,
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    name: "Instant Flashcards",
    description: "Transform your notes into effective flashcards in seconds. Save hours of manual work.",
    icon: Zap,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Custom Quizzes",
    description: "Generate tests that adapt to your knowledge gaps and help you learn faster.",
    icon: Star,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "Study Groups",
    description: "Connect with classmates, share notes, and learn together in virtual study rooms.",
    icon: Users,
    gradient: "from-emerald-500 to-teal-500",
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-purple-600 tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-4xl font-bold text-gray-900 tracking-tight">
            Everything you need to excel
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Powerful tools that make studying smarter, not harder
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative group"
            >
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r opacity-25 blur-lg transition duration-200 group-hover:opacity-75"
                style={{
                  backgroundImage: `linear-gradient(to right, ${feature.gradient})`,
                }}
              />
              <div className="relative h-full p-6 bg-white rounded-lg border border-gray-100 shadow-sm transition duration-200 group-hover:scale-[1.02]">
                <div>
                  <span className="inline-flex items-center justify-center p-3 rounded-md">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
