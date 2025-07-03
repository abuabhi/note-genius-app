import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

export const AIChatDemo = () => {
  return (
    <div className="mt-6">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Note content on the left */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700 text-base">
              📝 Current Note
              <Badge variant="outline" className="text-xs">Biology</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg min-h-[280px]">
              <h3 className="font-semibold mb-2">Photosynthesis Process</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Definition:</strong> Process where plants convert light energy into chemical energy</p>
                <p><strong>Inputs:</strong> Sunlight, CO₂, H₂O</p>
                <p><strong>Outputs:</strong> Glucose, O₂</p>
                <p><strong>Location:</strong> Chloroplasts</p>
                <p><strong>Stages:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• Light reactions</li>
                  <li>• Calvin cycle</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Chat on the right */}
        <Card className="border-mint-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mint-700 text-base">
              <Bot className="h-5 w-5" />
              AI Study Assistant
              <Badge className="bg-mint-100 text-mint-700 text-xs">24/7 Available</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 min-h-[200px]">
              {/* Chat messages */}
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
                <div className="bg-gray-100 p-2 rounded-lg text-sm max-w-[80%]">
                  Can you explain the difference between light reactions and Calvin cycle?
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-6 h-6 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-mint-50 p-2 rounded-lg text-sm max-w-[80%] border border-mint-200">
                  <p className="mb-2"><strong>Light Reactions:</strong></p>
                  <p className="mb-2 text-xs">• Occur in thylakoids</p>
                  <p className="mb-2 text-xs">• Convert light energy to ATP and NADPH</p>
                  <p className="mb-2 text-xs">• Release oxygen as byproduct</p>
                  
                  <p className="mb-2 mt-3"><strong>Calvin Cycle:</strong></p>
                  <p className="mb-1 text-xs">• Occurs in stroma</p>
                  <p className="text-xs">• Uses ATP and NADPH to make glucose</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
                <div className="bg-gray-100 p-2 rounded-lg text-sm max-w-[80%]">
                  Thanks! Can you create flashcards for this?
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-6 h-6 bg-mint-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-mint-50 p-2 rounded-lg text-sm max-w-[80%] border border-mint-200">
                  I'll create flashcards based on your notes! ✨
                  <Button size="sm" className="mt-2 w-full bg-mint-500 hover:bg-mint-600">
                    Generate Flashcards
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat input */}
            <div className="mt-4 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask anything about your notes..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-300"
                disabled
              />
              <Button size="sm" className="bg-mint-500 hover:bg-mint-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};