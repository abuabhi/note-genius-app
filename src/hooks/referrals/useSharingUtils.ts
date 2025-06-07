
import { toast } from 'sonner';

export const useSharingUtils = () => {
  const generateReferralLink = (referralCode: string) => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const shareViaWhatsApp = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const message = `🎓 Hey! I've been using StudyBuddy for my studies and it's incredible! 

✨ It's helped me:
• Organize my notes better
• Create smart flashcards instantly
• Track my study progress
• Ace my exams with AI-powered insights

🎁 Join using my code: ${referralCode}
👉 Or click here: ${link}

We'll both get awesome rewards! Let's study smarter together! 🚀📚`;
    
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
    
    const subject = "Join me on StudyBuddy - Transform your learning experience!";
    const body = `Hi there!

I wanted to share something that's been a game-changer for my studies - StudyBuddy!

🎯 What makes it special:
• Smart flashcards that adapt to your learning style
• AI-powered note organization and insights
• Progress tracking that keeps you motivated
• Collaborative study features

I've seen real improvements in my grades and study efficiency since I started using it.

🎁 Get started with my referral link:
${link}

Use my code: ${referralCode}

When you sign up, we both get rewards! It's a win-win 🎉

Give it a try - I think you'll love it as much as I do!

Best regards`;

    // Create a modal popup with pre-filled email content
    const emailWindow = window.open('', '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    
    if (emailWindow) {
      emailWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Share StudyBuddy via Email</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 100%;
                margin: 0;
                padding: 20px;
                background: #f8fafc;
              }
              .container {
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #1f2937;
                margin-bottom: 20px;
                text-align: center;
              }
              .form-group {
                margin-bottom: 20px;
              }
              label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #374151;
              }
              input, textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                box-sizing: border-box;
              }
              textarea {
                height: 200px;
                resize: vertical;
              }
              .btn {
                background: #10b981;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                margin-top: 10px;
              }
              .btn:hover {
                background: #059669;
              }
              .btn-secondary {
                background: #6b7280;
                margin-right: 10px;
                width: auto;
              }
              .btn-secondary:hover {
                background: #4b5563;
              }
              .referral-info {
                background: #ecfdf5;
                border: 1px solid #a7f3d0;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .button-group {
                display: flex;
                gap: 10px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>📧 Share StudyBuddy via Email</h1>
              
              <div class="referral-info">
                <h3>Your Referral Details:</h3>
                <p><strong>Code:</strong> ${referralCode}</p>
                <p><strong>Link:</strong> ${link}</p>
              </div>

              <form id="emailForm">
                <div class="form-group">
                  <label for="recipients">Email Recipients (separate with commas):</label>
                  <input type="email" id="recipients" name="recipients" 
                         placeholder="friend1@example.com, friend2@example.com" required>
                </div>
                
                <div class="form-group">
                  <label for="subject">Subject:</label>
                  <input type="text" id="subject" name="subject" 
                         value="${subject}" required>
                </div>
                
                <div class="form-group">
                  <label for="message">Message:</label>
                  <textarea id="message" name="message" required>${body}</textarea>
                </div>
                
                <div class="button-group">
                  <button type="button" class="btn btn-secondary" onclick="window.close()">Cancel</button>
                  <button type="submit" class="btn">Send Email</button>
                </div>
              </form>
            </div>

            <script>
              document.getElementById('emailForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const recipients = document.getElementById('recipients').value;
                const subject = document.getElementById('subject').value;
                const message = document.getElementById('message').value;
                
                const mailtoLink = 'mailto:' + recipients + 
                                 '?subject=' + encodeURIComponent(subject) + 
                                 '&body=' + encodeURIComponent(message);
                
                window.location.href = mailtoLink;
                
                alert('Email client opened! Your referral email is ready to send.');
                
                setTimeout(() => {
                  window.close();
                }, 2000);
              });
            </script>
          </body>
        </html>
      `);
      
      toast.success('Email sharing form opened! 📧');
    } else {
      toast.error('Please allow popups to use email sharing');
    }
  };

  const shareViaLinkedIn = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const text = `🎓 Excited to share StudyBuddy - a platform that's revolutionizing how I approach learning!

Key benefits I've experienced:
✅ Smart flashcard generation with AI
✅ Organized note-taking system  
✅ Progress tracking & analytics
✅ Collaborative study features

It's significantly improved my study efficiency and results. Highly recommend for students and professionals looking to enhance their learning experience.

Check it out: ${link}

#StudyBuddy #Learning #Education #ProductivityTools #StudentLife #AI #StudyTips`;
    
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareViaTwitter = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const text = `🎓 Just discovered @StudyBuddy - game-changing study platform! 

✨ AI flashcards
📝 Smart notes  
📊 Progress tracking
🤝 Collaboration

Boosted my grades significantly! 

Try it: ${link}

#StudyBuddy #EdTech #StudentLife #AI #Learning`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const generateQRCode = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    
    const newWindow = window.open('', '_blank', 'width=400,height=500');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>StudyBuddy Referral QR Code</title></head>
          <body style="display: flex; flex-direction: column; align-items: center; padding: 20px; font-family: Arial, sans-serif;">
            <h2>📱 Scan to Join StudyBuddy</h2>
            <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px; border-radius: 8px;" />
            <p style="margin-top: 20px; text-align: center; color: #666;">
              Share this QR code for easy mobile access<br>
              Referral Code: <strong>${referralCode}</strong>
            </p>
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Close
            </button>
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
