
const testimonials = [
  {
    content: "The AI flashcard generation is incredible! I just upload my AP Biology notes and get perfectly formatted study cards that helped me ace my exams.",
    author: "Emma Rodriguez",
    role: "High School Junior, Lincoln High",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "AI Flashcards"
  },
  {
    content: "The study planner changed everything for me. It automatically schedules my study sessions around my work schedule and helps me stay consistent.",
    author: "Marcus Thompson",
    role: "Community College Student, Mesa CC",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Study Planning"
  },
  {
    content: "My SAT prep became so much easier with the adaptive quizzes. They focus on exactly what I'm struggling with and track my improvement.",
    author: "Sophia Chen",
    role: "High School Senior, Roosevelt High",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Smart Quizzes"
  },
  {
    content: "The OCR scanning is a game-changer for my math notes. I can scan my handwritten equations and the AI creates practice problems automatically.",
    author: "Jordan Kim",
    role: "High School Sophomore, Valley Prep",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Document Scanning"
  },
  {
    content: "The learning analytics help me understand my study patterns. I can see when I'm most productive and plan my hardest subjects accordingly.",
    author: "Ashley Martinez",
    role: "College Freshman, City College",
    image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Learning Analytics"
  },
  {
    content: "From struggling with chemistry to getting A's - the AI note enhancement breaks down complex topics into easy-to-understand concepts.",
    author: "Tyler Johnson",
    role: "High School Junior, Oak Ridge High",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Note Enhancement"
  },
];

const Testimonials = () => {
  return (
    <div className="bg-gradient-to-b from-mint-50/20 via-white to-mint-50/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-neutral-100 rounded-full text-neutral-700 text-sm mb-8">
            💬 Student Success Stories
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by high school and college students
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how students are achieving better grades and building effective study habits
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
                  <img
                    className="h-12 w-12 rounded-full object-cover border-2 border-mint-200"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
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
          <p className="text-sm text-gray-500 mb-4">Helping students succeed at</p>
          <div className="flex justify-center items-center gap-8 text-gray-400 text-sm">
            <span>Roosevelt High • Lincoln High • Valley Prep • Mesa Community College • City College • Oak Ridge High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
