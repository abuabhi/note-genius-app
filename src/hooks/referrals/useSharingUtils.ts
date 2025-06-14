
import { toast } from 'sonner';

export const useSharingUtils = () => {
  const generateReferralLink = (referralCode: string) => {
    return `${window.location.origin}?ref=${referralCode}`;
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
✅ Seamless collaboration features for group study sessions

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
🤝 Collaborative study features

📈 My grades have never been better!

Try it: ${link}

#PrepGenie #EdTech #AI #StudentLife #LearningHacks #StudyTips #Education`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    toast.success('Twitter opened! Your tweet is ready to share 🐦');
  };

  return {
    generateReferralLink,
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter
  };
};
