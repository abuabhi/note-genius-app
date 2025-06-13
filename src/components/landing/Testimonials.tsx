
const testimonials = [
  {
    content: "The AI flashcard generation saved me hours! I just upload my lecture notes and get perfectly formatted study cards instantly.",
    author: "Sarah Chen",
    role: "Medical Student, Stanford",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "AI Flashcards"
  },
  {
    content: "The OCR scanning is incredible. I can scan my handwritten notes and the AI creates study guides and quizzes automatically.",
    author: "Marcus Johnson",
    role: "Engineering Student, MIT",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Smart Scanning"
  },
  {
    content: "My exam scores improved by 30% using the adaptive quizzes. The progress tracking helps me focus on weak areas.",
    author: "Emily Rodriguez",
    role: "Pre-Med, UCLA",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Progress Tracking"
  },
  {
    content: "Study groups became so much easier! We share flashcard sets and track our collective progress. Game changer for group study.",
    author: "David Park",
    role: "Law Student, Harvard",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Collaboration"
  },
  {
    content: "The AI note enhancement turned my messy lecture notes into clear, structured study materials. It's like having a study assistant.",
    author: "Priya Patel",
    role: "Computer Science, Berkeley",
    image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Note Enhancement"
  },
  {
    content: "From struggling with chemistry to acing my exams - the personalized quiz generation adapts to exactly what I need to study.",
    author: "Alex Thompson",
    role: "Chemistry Major, Caltech",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    feature: "Adaptive Learning"
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
            Trusted by students at top universities
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            See how students are achieving better grades and saving study time
          </p>
        </div>
        
        <div className="mt-20 grid gap-8 lg:grid-cols-3 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-mint-300 to-neutral-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-200" />
              <div className="relative h-full p-8 bg-white rounded-2xl border border-mint-100">
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
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div className="inline-flex items-center px-3 py-1 bg-mint-50 rounded-full text-mint-700 text-xs font-medium">
                  {testimonial.feature}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by students at</p>
          <div className="flex justify-center items-center gap-8 text-gray-400 text-sm">
            <span>Stanford • MIT • Harvard • UCLA • Berkeley • Caltech</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
