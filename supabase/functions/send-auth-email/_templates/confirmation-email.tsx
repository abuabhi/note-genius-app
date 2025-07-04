import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Img,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ConfirmationEmailProps {
  confirmationUrl: string;
  userEmail: string;
}

export const ConfirmationEmail = ({
  confirmationUrl,
  userEmail,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to PrepGenie! Confirm your account to get started.</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with PrepGenie branding */}
        <Section style={header}>
          <Row>
            <Text style={brandName}>PrepGenie</Text>
          </Row>
          <Text style={tagline}>Your AI-Powered Study Companion</Text>
        </Section>

        {/* Main content */}
        <Section style={content}>
          <Heading style={h1}>Welcome to PrepGenie! 🎉</Heading>
          
          <Text style={text}>
            Hi there! We're excited to have you join our community of smart learners.
          </Text>

          <Text style={text}>
            To get started with your PrepGenie account (<strong>{userEmail}</strong>), 
            please confirm your email address by clicking the button below:
          </Text>

          <Section style={buttonContainer}>
            <Button
              href={confirmationUrl}
              style={button}
            >
              Confirm Your Account
            </Button>
          </Section>

          <Text style={smallText}>
            This link will expire in 24 hours for security reasons.
          </Text>

          {/* What's next section */}
          <Section style={nextStepsSection}>
            <Heading style={h2}>What's Next?</Heading>
            <Text style={text}>After confirming your email, you'll be able to:</Text>
            
            <Section style={featureList}>
              <Text style={featureItem}>📝 Create and organize your study notes</Text>
              <Text style={featureItem}>🧠 Generate AI-powered flashcards</Text>
              <Text style={featureItem}>📊 Track your learning progress</Text>
              <Text style={featureItem}>🎯 Set and achieve study goals</Text>
            </Section>
          </Section>

          {/* Backup link section */}
          <Section style={backupSection}>
            <Text style={smallText}>
              Having trouble with the button? Copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{confirmationUrl}</Text>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            If you didn't create an account with PrepGenie, you can safely ignore this email.
          </Text>
          <Text style={footerText}>
            Questions? We're here to help! Just reply to this email.
          </Text>
          <Text style={footerBrand}>
            Best regards,<br />
            The PrepGenie Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ConfirmationEmail;

// Styles using PrepGenie theme colors
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 0',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e3f9ed',
  marginBottom: '32px',
};

const brandName = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#3dc087', // mint-500
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const tagline = {
  fontSize: '16px',
  color: '#6b7280', // neutral-500
  margin: '0',
  textAlign: 'center' as const,
};

const content = {
  padding: '0 20px',
};

const h1 = {
  color: '#1f2937', // neutral-800
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
  lineHeight: '1.3',
};

const h2 = {
  color: '#374151', // neutral-700
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 16px 0',
  lineHeight: '1.4',
};

const text = {
  color: '#4b5563', // neutral-600
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
};

const smallText = {
  color: '#6b7280', // neutral-500
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3dc087', // mint-500
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  border: 'none',
  cursor: 'pointer',
};

const nextStepsSection = {
  margin: '40px 0',
  padding: '24px',
  backgroundColor: '#f2fcf6', // mint-50
  borderRadius: '8px',
  border: '1px solid #c7f2dc', // mint-200
};

const featureList = {
  margin: '16px 0 0 0',
};

const featureItem = {
  color: '#374151', // neutral-700
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 8px 0',
};

const backupSection = {
  margin: '32px 0',
  padding: '20px',
  backgroundColor: '#f9fafb', // neutral-50
  borderRadius: '6px',
  border: '1px solid #e5e7eb', // neutral-200
};

const linkText = {
  color: '#3dc087', // mint-500
  fontSize: '13px',
  wordBreak: 'break-all' as const,
  margin: '8px 0 0 0',
};

const footer = {
  padding: '32px 20px 0 20px',
  borderTop: '1px solid #e5e7eb', // neutral-200
  textAlign: 'center' as const,
  marginTop: '48px',
};

const footerText = {
  color: '#6b7280', // neutral-500
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 12px 0',
};

const footerBrand = {
  color: '#3dc087', // mint-500
  fontSize: '15px',
  fontWeight: '600',
  margin: '20px 0 0 0',
};