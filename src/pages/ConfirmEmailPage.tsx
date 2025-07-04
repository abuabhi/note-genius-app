import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConfirmEmailPage = () => {
  const [isResending, setIsResending] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Get email from sessionStorage if available
  const signupInfo = sessionStorage.getItem('signup_completed');
  let userEmail = '';
  
  if (signupInfo) {
    try {
      const parsed = JSON.parse(signupInfo);
      userEmail = parsed.email || '';
    } catch (error) {
      // Ignore parsing errors
    }
  }

  const handleResendEmail = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "Email address not found. Please try signing up again.",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    try {
      // We can't resend confirmation emails directly, so we'll show a helpful message
      toast({
        title: "Check your email",
        description: "If you didn't receive the email, please check your spam folder or try signing up again.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-mint-100 p-3">
              <Mail className="h-8 w-8 text-mint-600" />
            </div>
          </div>
          
          <Card className="mt-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Check your email
              </CardTitle>
              <CardDescription className="text-gray-600">
                We've sent a confirmation link to your email address
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {userEmail && (
                <div className="text-center p-4 bg-mint-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Confirmation email sent to:</p>
                  <p className="font-medium text-gray-900">{userEmail}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-mint-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Click the confirmation link</p>
                    <p className="text-sm text-gray-600">Check your email and click the confirmation link to activate your account</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-mint-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Select your plan</p>
                    <p className="text-sm text-gray-600">After confirming your email, you'll be redirected to choose your learning plan</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-mint-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start learning</p>
                    <p className="text-sm text-gray-600">Complete onboarding and begin your learning journey with PrepGenie</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-4">
                  Didn't receive the email? Check your spam folder or click below to get help.
                </p>
                
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Getting help...
                    </>
                  ) : (
                    "Need help?"
                  )}
                </Button>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already confirmed your email? </span>
                <Link to="/login" className="text-mint-600 hover:text-mint-500 font-medium">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmEmailPage;