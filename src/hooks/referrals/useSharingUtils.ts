
import { toast } from 'sonner';

export const useSharingUtils = () => {
  const generateReferralLink = (referralCode: string) => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const shareViaWhatsApp = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const message = `Hey! 👋 I've been using StudyBuddy for my studies and it's amazing! 📚✨ 

Join me using my referral code: ${referralCode} or click here: ${link}

You'll get access to:
🎯 Smart flashcards
📝 AI-powered notes
🏆 Study tracking & achievements
🎊 And we both get rewards!

Let's ace our studies together! 🚀`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

  const shareViaEmail = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const subject = "Try StudyBuddy - Great Study Platform";
    const body = `Hi there!

I've been using StudyBuddy for my studies and thought you might find it helpful too. It's a comprehensive platform with smart flashcards, note organization, and progress tracking.

Here's my referral link to get started:
${link}

Best regards!`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaLinkedIn = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const text = "Discovered an excellent study platform that's been helping me stay organized and improve my learning efficiency. Check out StudyBuddy:";
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareViaTwitter = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const text = "Found a great study platform that's been helping me stay organized and learn more effectively. Check out StudyBuddy:";
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    window.open(twitterUrl, '_blank');
  };

  const generateQRCode = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>StudyBuddy Referral QR Code</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Scan to Join StudyBuddy</h2>
            <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px; border-radius: 8px;" />
            <p style="margin-top: 20px; text-align: center; color: #666;">
              Share this QR code for easy mobile access
            </p>
          </body>
        </html>
      `);
    }
  };

  return {
    generateReferralLink,
    shareViaWhatsApp,
    copyReferralLink,
    shareViaEmail,
    shareViaLinkedIn,
    shareViaTwitter,
    generateQRCode
  };
};
