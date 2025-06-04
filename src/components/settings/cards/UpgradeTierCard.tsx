
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, BookOpen, Award, Crown } from "lucide-react";

export const UpgradeTierCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="bg-gradient-to-br from-mint-50 to-mint-100/50 border-mint-200">
      <CardHeader>
        <CardTitle className="text-mint-800 flex items-center space-x-2">
          <Gem className="h-5 w-5 text-mint-600" />
          <span>Upgrade Your Learning Experience</span>
        </CardTitle>
        <CardDescription className="text-slate-600">
          Get access to premium features and unlock your full learning potential
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-mint-200 rounded-lg p-3 bg-white/80 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-mint-50 rounded-full">
                <BookOpen className="h-4 w-4 text-mint-600" />
              </div>
              <span className="font-medium text-mint-700">Scholar Tier</span>
            </div>
            <p className="text-sm text-slate-600">Basic features for students</p>
          </div>
          
          <div className="border border-mint-200 rounded-lg p-3 bg-white/80 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-mint-100 rounded-full">
                <Award className="h-4 w-4 text-mint-600" />
              </div>
              <span className="font-medium text-mint-700">Graduate Tier</span>
            </div>
            <p className="text-sm text-slate-600">Enhanced flashcards, progress tracking</p>
          </div>
          
          <div className="border border-mint-200 rounded-lg p-3 bg-white/80 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 bg-mint-200 rounded-full">
                <Crown className="h-4 w-4 text-mint-700" />
              </div>
              <span className="font-medium text-mint-700">Master Tier</span>
            </div>
            <p className="text-sm text-slate-600">AI note enrichment, quiz generation</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate('/pricing')}
          className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800"
        >
          View Pricing Plans
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpgradeTierCard;
