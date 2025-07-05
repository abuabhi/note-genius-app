import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const [urlReferralCode, setUrlReferralCode] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    referralCode: "", // Start empty to avoid hydration mismatch
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const refCode = searchParams.get('ref');
    setUrlReferralCode(refCode);
    
    // Pre-fill referral code after hydration
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        referralCode: refCode
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      acceptTerms: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, {
        username: formData.name || formData.email.split('@')[0],
        referral_code: formData.referralCode.trim() || null,
      });
      
      if (error) {
        throw error;
      }
      
      // With instant signup, navigate directly to tier selection
      navigate('/tier-selection');
    } catch (error: any) {
      setError(error.message || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Layout>
      <div className="min-h-[calc(100vh-16rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-mint-600 hover:text-mint-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Full name</Label>
                <div className="mt-1">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="referralCode">Referral code (optional)</Label>
                <div className="mt-1">
                  <Input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="block w-full"
                    placeholder="Enter referral code"
                    disabled={isClient && !!urlReferralCode} // Only disable after hydration
                  />
                </div>
                {isClient && urlReferralCode && (
                  <p className="mt-1 text-sm text-mint-600">
                    Referral code automatically applied from your invitation link
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="acceptTerms" 
                  checked={formData.acceptTerms}
                  onCheckedChange={handleCheckboxChange}
                  required
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-mint-600 hover:text-mint-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-mint-600 hover:text-mint-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-mint-600 hover:bg-mint-700"
                  disabled={isSubmitting || !formData.acceptTerms}
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
