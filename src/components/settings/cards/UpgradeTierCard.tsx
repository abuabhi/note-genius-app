
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Award, Crown } from "lucide-react";

export const UpgradeTierCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center space-x-2">
          <Gem className="h-5 w-5 text-blue-600" />
          <span>Upgrade Your Learning Experience</span>
        </CardTitle>
        <CardDescription>
          Get access to premium features and unlock your full learning potential
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">Graduate Tier</span>
            </div>
            <p className="text-sm text-muted-foreground">Enhanced flashcards, progress tracking</p>
          </div>
          
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-indigo-100 rounded-full">
                <Crown className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="font-medium">Master Tier</span>
            </div>
            <p className="text-sm text-muted-foreground">AI note enrichment, quiz generation</p>
          </div>
          
          <div className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <Gem className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium">Dean Tier</span>
            </div>
            <p className="text-sm text-muted-foreground">Unlimited storage, priority support</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate('/pricing')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          View Pricing Plans
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpgradeTierCard;
