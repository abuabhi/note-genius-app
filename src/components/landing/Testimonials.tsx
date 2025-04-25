
const testimonials = [
  {
    content: "StudyAI has transformed how I prepare for exams. I'm spending less time making study materials and more time actually learning.",
    author: "Alex Johnson",
    role: "Computer Science Student",
  },
  {
    content: "The AI-generated quizzes helped me identify knowledge gaps I didn't know I had. My grades have improved significantly.",
    author: "Sarah Williams",
    role: "Medical Student",
  },
  {
    content: "I love the flashcard feature! It saves me hours of work and the spaced repetition algorithm helps me remember everything better.",
    author: "Michael Chen",
    role: "Law Student",
  },
];

const Testimonials = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Students love StudyAI
          </p>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col"
            >
              <div className="flex-grow">
                <p className="text-lg text-gray-600 italic">"{testimonial.content}"</p>
              </div>
              <div className="mt-4">
                <p className="font-medium text-gray-900">{testimonial.author}</p>
                <p className="text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
