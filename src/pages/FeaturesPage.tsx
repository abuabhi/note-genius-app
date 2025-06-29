
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const demoData = {
  note: {
    title: "Photosynthesis Process",
    rawContent: "Photosynthesis is the process where plants make food using sunlight, water, and carbon dioxide.",
    enhancedContent: {
      overview: "Photosynthesis is the biological process by which plants, algae, and certain bacteria convert light energy into chemical energy stored in glucose.",
      keyInputs: ["Sunlight (light energy)", "Water (H2O) - absorbed through roots", "Carbon dioxide (CO2) - taken from air through stomata"],
      products: ["Glucose (C6H12O6) - sugar for energy", "Oxygen (O2) - released as byproduct"],
      location: "Occurs primarily in chloroplasts of plant cells",
      equation: "6CO2 + 6H2O + light energy → C6H12O6 + 6O2"
    }
  },
  flashcards: [
    {
      front: "What is the chemical equation for photosynthesis?",
      back: "6CO2 + 6H2O + light energy → C6H12O6 + 6O2",
      difficulty: "Medium"
    },
    {
      front: "What are the main inputs of photosynthesis?",
      back: "Sunlight, carbon dioxide (CO2), and water (H2O)",
      difficulty: "Easy"
    }
  ],
  quiz: {
    question: "Where does photosynthesis primarily occur in plant cells?",
    options: ["Mitochondria", "Nucleus", "Chloroplasts", "Cytoplasm"],
    correct: 2,
    explanation: "Photosynthesis occurs in chloroplasts, which contain chlorophyll that captures light energy for the process."
  }
};

const FeaturesPage = () => {
  const [activeDemo, setActiveDemo] = useState<'note' | 'flashcard' | 'quiz'>('note');
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const demos = [
    { id: 'note', label: 'Smart Notes', icon: FileText },
    { id: 'flashcard', label: 'AI Flashcards', icon: Brain },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="py-24 bg-gradient-to-b from-white to-mint-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-mint-100 rounded-full text-mint-700 text-sm mb-8">
              🎯 Interactive Demo
            </div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Experience the power in action
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              See how your content transforms into powerful study materials with AI
            </p>
          </div>

          {/* Demo Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.id}
                    onClick={() => setActiveDemo(demo.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                      activeDemo === demo.id
                        ? 'bg-white text-mint-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {demo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demo Content */}
          <div className="max-w-4xl mx-auto">
            {activeDemo === 'note' && (
              <Card className="border-mint-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-mint-600" />
                    Smart Note Enhancement
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                      AI Enhanced
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Raw Content */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800">Raw Notes</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">{demoData.note.title}</h4>
                        <p className="text-gray-700 text-sm">{demoData.note.rawContent}</p>
                      </div>
                    </div>

                    {/* Enhanced Content */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800">AI Enhanced</h3>
                      <div className="bg-mint-50 p-4 rounded-lg border border-mint-200">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-mint-800 mb-1">Overview</h4>
                            <p className="text-mint-700 text-sm">{demoData.note.enhancedContent.overview}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-mint-800 mb-1">Key Inputs</h4>
                            <ul className="text-mint-700 text-sm space-y-1">
                              {demoData.note.enhancedContent.keyInputs.map((input, idx) => (
                                <li key={idx}>• {input}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-mint-800 mb-1">Products</h4>
                            <ul className="text-mint-700 text-sm space-y-1">
                              {demoData.note.enhancedContent.products.map((product, idx) => (
                                <li key={idx}>• {product}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-mint-800 mb-1">Location</h4>
                            <p className="text-mint-700 text-sm">{demoData.note.enhancedContent.location}</p>
                          </div>

                          <div>
                            <h4 className="font-medium text-mint-800 mb-1">Chemical Equation</h4>
                            <p className="text-mint-700 text-sm font-mono bg-white p-2 rounded border">
                              {demoData.note.enhancedContent.equation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeDemo === 'flashcard' && (
              <Card className="border-mint-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-mint-600" />
                    AI-Generated Flashcard
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                      Auto-Generated
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 border-mint-200 rounded-xl p-8 min-h-[250px] flex flex-col justify-center items-center text-center relative">
                    {/* Difficulty Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className={`${getDifficultyColor(demoData.flashcards[currentCard].difficulty)} border`}>
                        {demoData.flashcards[currentCard].difficulty}
                      </Badge>
                    </div>

                    <div className="space-y-6 w-full">
                      <div className="text-lg font-medium text-gray-800">
                        {showAnswer ? demoData.flashcards[currentCard].back : demoData.flashcards[currentCard].front}
                      </div>
                      
                      <Button
                        onClick={() => setShowAnswer(!showAnswer)}
                        variant="outline"
                        className="border-mint-300 text-mint-700 hover:bg-mint-50"
                      >
                        {showAnswer ? 'Show Question' : 'Show Answer'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">Card {currentCard + 1} of {demoData.flashcards.length}</span>
                    <Button
                      onClick={() => {
                        setCurrentCard((currentCard + 1) % demoData.flashcards.length);
                        setShowAnswer(false);
                      }}
                      size="sm"
                      className="bg-mint-600 hover:bg-mint-700"
                    >
                      Next Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeDemo === 'quiz' && (
              <Card className="border-mint-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-mint-600" />
                    Adaptive Quiz Question
                    <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                      AI Generated
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg text-gray-800">{demoData.quiz.question}</h3>
                    
                    <div className="space-y-3">
                      {demoData.quiz.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedAnswer(index)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedAnswer === index
                              ? index === demoData.quiz.correct
                                ? 'border-green-400 bg-green-50 text-green-800'
                                : 'border-red-400 bg-red-50 text-red-800'
                              : index === demoData.quiz.correct && selectedAnswer !== null
                              ? 'border-green-400 bg-green-50 text-green-800'
                              : 'border-gray-200 hover:border-mint-300 hover:bg-mint-50'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                        </button>
                      ))}
                    </div>

                    {selectedAnswer !== null && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Explanation:</h4>
                        <p className="text-blue-700 text-sm">{demoData.quiz.explanation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button size="lg" className="bg-mint-600 hover:bg-mint-700" asChild>
              <Link to="/signup" className="flex items-center">
                Try It Yourself
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              Create your first AI-powered study set in under 2 minutes
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeaturesPage;
