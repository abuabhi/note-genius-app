
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || 'Contact Form Submission',
          message: formData.message.trim()
        }
      });

      if (error) {
        console.error('Error sending contact form:', error);
        toast.error("Failed to send your message. Please try again or email us directly at hello@prepgenie.io");
        return;
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error("Failed to send your message. Please try again or email us directly at hello@prepgenie.io");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                Message Sent Successfully!
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Thank you for contacting us! We've received your message and will get back to you as soon as possible, typically within 24 hours during business days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  className="bg-mint-600 hover:bg-mint-700"
                >
                  Send Another Message
                </Button>
                <Button variant="outline" asChild>
                  <a href="/help">Visit Help Center</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about PrepGenie? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-mint-200">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="mt-1"
                      disabled={isSubmitting}
                      placeholder="General Inquiry"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="Tell us how we can help you..."
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-mint-600 hover:bg-mint-700"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Mail className="h-6 w-6 text-mint-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">hello@prepgenie.io</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-mint-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Response Times</h3>
                <p className="text-gray-600 mb-4">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• General inquiries: Within 24 hours</li>
                  <li>• Technical support: Within 12 hours</li>
                  <li>• Billing questions: Within 6 hours</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-mint-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Connect</h3>
                <p className="text-gray-600 mb-4">
                  Looking for help? Check out our comprehensive help center or browse our frequently asked questions.
                </p>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/help">Visit Help Center</a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/faq">Browse FAQ</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
