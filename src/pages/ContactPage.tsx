
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(formData.subject || 'Contact Form Submission');
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const mailtoLink = `mailto:hello@prepgenie.io?subject=${subject}&body=${body}`;
      
      // Open user's email client
      window.location.href = mailtoLink;
      
      toast.success("Email client opened! Please send the email to complete your message.");
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error("Error opening email client. Please email us directly at hello@prepgenie.io");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-mint-600 hover:bg-mint-700"
                  >
                    {isSubmitting ? "Opening Email Client..." : "Send Message"}
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
