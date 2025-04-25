
const testimonials = [
  {
    content: "StudyAI feels like having a personal tutor. My grades improved within weeks!",
    author: "Alex J.",
    role: "Computer Science Major",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
  },
  {
    content: "The AI quizzes are amazing at finding my weak spots. Game-changer for med school!",
    author: "Sarah W.",
    role: "Medical Student",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
  },
  {
    content: "Finally, a study tool that actually makes learning fun and effective!",
    author: "Michael C.",
    role: "Law Student",
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
  },
];

const Testimonials = () => {
  return (
    <div className="bg-purple-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-purple-600 tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">Loved by students worldwide</p>
        </div>
        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-200" />
              <div className="relative h-full p-8 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.author}</h4>
                    <p className="text-sm text-purple-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
