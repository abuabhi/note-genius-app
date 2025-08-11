
import { toast } from 'sonner';

export const useSharingUtils = () => {
  const generateReferralLink = (referralCode: string) => {
    return `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode)}`;
  };

  const copyReferralLink = async (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Referral link copied to clipboard! 🎉');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareViaLinkedIn = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const text = `🎓 Excited to share PrepGenie - a game-changing platform that's revolutionized my learning approach!

🚀 Key transformations I've experienced:
✅ AI-powered flashcard generation that adapts to my learning patterns
✅ Intelligent note organization with automated insights
✅ Comprehensive progress analytics and goal tracking
✅ Advanced export & import capabilities for flexible learning

📊 The impact on my academic performance has been remarkable - improved efficiency, better retention, and higher grades.

Perfect for students, professionals, and lifelong learners seeking to optimize their study experience with cutting-edge AI technology.

🔗 Experience it yourself: ${link}

#PrepGenie #EdTech #ArtificialIntelligence #LearningOptimization #StudentSuccess #ProfessionalDevelopment #EducationInnovation`;
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
    toast.success('LinkedIn opened! Your professional post is ready 💼');
  };

  const shareViaTwitter = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const text = `🎓 Game-changer alert! @PrepGenie has completely transformed my learning experience 

🔥 What's amazing:
✨ AI flashcards that adapt to YOU
📝 Smart note organization
📊 Progress tracking that motivates
📁 Export & import study materials

📈 My grades have never been better!

Try it: ${link}

#PrepGenie #EdTech #AI #StudentLife #LearningHacks #StudyTips #Education`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    toast.success('Twitter opened! Your tweet is ready to share 🐦');
  };

  const generateRecommendedMessage = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    return `Hey! I've been using PrepGenie and it's seriously improved how I study.

Here’s why I love it:
• AI-powered flashcards tailored to you
• Smart note organization and insights
• Progress tracking that actually motivates

Join with my link and check it out: ${link}`;
  };

  const shareViaWhatsApp = (referralCode: string) => {
    const text = generateRecommendedMessage(referralCode);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    toast.success('WhatsApp opened! Message ready to send 💬');
  };

  const shareViaEmail = (referralCode: string) => {
    const subject = 'Join me on PrepGenie!';
    const body = generateRecommendedMessage(referralCode);
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_self');
    toast.success('Email composer opened ✉️');
  };

  return {
    generateReferralLink,
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter,
    generateRecommendedMessage,
    shareViaWhatsApp,
    shareViaEmail
  };
};
