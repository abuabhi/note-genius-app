
import { toast } from 'sonner';

export const useSharingUtils = () => {
  const generateReferralLink = (referralCode: string) => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const shareViaWhatsApp = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const message = `🎓 Hey! I've been using StudyBuddy for my studies and it's absolutely incredible! 

✨ It's transformed how I learn:
• Smart AI flashcards that adapt to my style
• Instant note organization with AI insights
• Progress tracking that keeps me motivated
• Study with friends through collaboration features

📈 My grades have improved significantly since I started using it!

🎁 Join using my code: ${referralCode}
👉 Direct link: ${link}

We'll both get awesome rewards when you sign up! Let's study smarter together! 🚀📚

#StudyBuddy #SmartLearning`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp opened! Your message is ready to share 📱');
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
    const text = `🎓 Excited to share StudyBuddy - a game-changing platform that's revolutionized my learning approach!

🚀 Key transformations I've experienced:
✅ AI-powered flashcard generation that adapts to my learning patterns
✅ Intelligent note organization with automated insights
✅ Comprehensive progress analytics and goal tracking
✅ Seamless collaboration features for group study sessions

📊 The impact on my academic performance has been remarkable - improved efficiency, better retention, and higher grades.

Perfect for students, professionals, and lifelong learners seeking to optimize their study experience with cutting-edge AI technology.

🔗 Experience it yourself: ${link}

#StudyBuddy #EdTech #ArtificialIntelligence #LearningOptimization #StudentSuccess #ProfessionalDevelopment #EducationInnovation`;
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
    toast.success('LinkedIn opened! Your professional post is ready 💼');
  };

  const shareViaTwitter = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const text = `🎓 Game-changer alert! @StudyBuddy has completely transformed my learning experience 

🔥 What's amazing:
✨ AI flashcards that adapt to YOU
📝 Smart note organization
📊 Progress tracking that motivates
🤝 Collaborative study features

📈 My grades have never been better!

Try it: ${link}

#StudyBuddy #EdTech #AI #StudentLife #LearningHacks #StudyTips #Education`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    toast.success('Twitter opened! Your tweet is ready to share 🐦');
  };

  const generateQRCode = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&margin=20&data=${encodeURIComponent(link)}`;
    
    const newWindow = window.open('', '_blank', 'width=500,height=600,scrollbars=no,resizable=yes,location=no');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>StudyBuddy Referral QR Code</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 30px;
                background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                box-sizing: border-box;
              }
              .container {
                background: white;
                padding: 30px;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                width: 100%;
              }
              h1 {
                color: #065f46;
                margin-bottom: 10px;
                font-size: 24px;
              }
              .subtitle {
                color: #059669;
                margin-bottom: 25px;
                font-size: 14px;
              }
              img {
                border: 3px solid #d1fae5;
                border-radius: 12px;
                margin: 20px 0;
                width: 100%;
                max-width: 300px;
                height: auto;
              }
              .info {
                background: #f0fdf4;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #10b981;
              }
              .code {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: #059669;
                font-size: 16px;
              }
              .instructions {
                color: #374151;
                font-size: 14px;
                line-height: 1.5;
                margin: 15px 0;
              }
              button {
                background: #10b981;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.2s;
              }
              button:hover {
                background: #059669;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📱 Scan to Join StudyBuddy</h1>
              <p class="subtitle">Share this QR code for instant access</p>
              
              <img src="${qrUrl}" alt="StudyBuddy Referral QR Code" />
              
              <div class="info">
                <div class="instructions">
                  📲 <strong>How to use:</strong><br>
                  Point your phone's camera at this QR code or use any QR scanner app
                </div>
                <div class="code">Referral Code: ${referralCode}</div>
              </div>
              
              <p class="instructions">
                Perfect for sharing at study groups, libraries, or with classmates!
              </p>
              
              <button onclick="window.close()">Close</button>
            </div>
          </body>
        </html>
      `);
      
      toast.success('QR code generated! Perfect for in-person sharing 📱');
    } else {
      toast.error('Please allow popups to generate QR code', {
        description: 'Enable popups in your browser settings to use this feature'
      });
    }
  };

  return {
    generateReferralLink,
    shareViaWhatsApp,
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter,
    generateQRCode
  };
};
