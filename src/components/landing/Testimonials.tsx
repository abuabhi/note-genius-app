
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    content: "The AI flashcard generation is incredible! I just upload my VCE Biology notes and get perfectly formatted study cards that helped me achieve a study score of 45.",
    author: "Priya Sharma",
    role: "Year 12 Student",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "AI Flashcards"
  },
  {
    content: "The study planner is a game-changer! It automatically schedules my HSC prep around my part-time job and helps me balance all my subjects effectively.",
    author: "Wei Chen",
    role: "Year 12 Student",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Study Planning"
  },
  {
    content: "My SAT prep became so much easier with the adaptive quizzes. They focus on exactly what I'm struggling with and track my improvement over time.",
    author: "Arjun Patel",
    role: "Grade 11 Student",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Smart Quizzes"
  },
  {
    content: "The OCR scanning is perfect for my handwritten math notes. I can scan my equations and the AI creates practice problems automatically - saved me hours!",
    author: "Jessica Zhang",
    role: "Year 11 Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Document Scanning"
  },
  {
    content: "The learning analytics help me understand my study patterns perfectly. I can see when I'm most productive and plan my hardest subjects like Physics accordingly.",
    author: "Ravi Kumar",
    role: "First Year Engineering Student",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Learning Analytics"
  },
  {
    content: "From struggling with chemistry to getting A+ grades - the AI note enhancement breaks down complex organic chemistry reactions into easy concepts I can actually understand.",
    author: "Emma Liu",
    role: "Year 12 Student",
    image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Note Enhancement"
  },
  {
    content: "The smart goal tracking keeps me motivated through my HSC year. Breaking down my ATAR goal into smaller, achievable milestones has made all the difference.",
    author: "Dev Singh",
    role: "Year 12 Student",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Goal Tracking"
  },
  {
    content: "The AI todo suggestions are spot-on! It knows exactly when to remind me about assignments and even suggests the best times to work on different subjects based on my schedule.",
    author: "Lily Wang",
    role: "Year 10 Student",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Smart ToDos"
  },
  {
    content: "The dashboard gives me a complete overview of my academic progress. I love seeing my study streaks and completion rates - it keeps me motivated every day!",
    author: "Aditya Gupta",
    role: "Grade 12 Student",
    image: "https://images.unsplash.com/photo-1558203728-00f45181dd84?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Study Dashboard"
  }
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const Testimonials = () => {
  return (
    <div className="bg-gradient-to-b from-mint-50/20 via-white to-mint-50/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-neutral-100 rounded-full text-neutral-700 text-sm mb-8">
            💬 Student Success Stories
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by high school and university students worldwide
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how students across Australia, India, and beyond are achieving better grades and building effective study habits
          </p>
        </div>
        
        <div className="mt-20 grid gap-8 lg:grid-cols-3 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-200" />
              <div className="relative h-full p-8 bg-white rounded-2xl border border-mint-100 shadow-sm group-hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-12 w-12 border-2 border-mint-200">
                    <AvatarImage
                      src={testimonial.image}
                      alt={`${testimonial.author} - ${testimonial.role}`}
                      loading="lazy"
                      decoding="async"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                    <AvatarFallback>{getInitials(testimonial.author)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-neutral-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div className="inline-flex items-center px-3 py-1 bg-mint-50 rounded-full text-mint-700 text-xs font-medium border border-mint-200">
                  {testimonial.feature}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Helping students succeed worldwide</p>
          <div className="flex justify-center items-center gap-2 text-gray-400 text-sm flex-wrap">
            <span>Australia • India • Singapore • United States • Canada • United Kingdom</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
