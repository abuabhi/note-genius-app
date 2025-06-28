
import React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Button,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22'

interface EnhancedDailyDigestEmailProps {
  user_name: string;
  goals: any[];
  todos: any[];
  notes: any[];
  flashcards: any[];
  quizzes: any[];
  study_sessions: any[];
  overdue_count: number;
  completed_today: number;
  study_streak: number;
  app_url: string;
  unsubscribe_url: string;
  preferences: {
    include_goals?: boolean;
    include_todos?: boolean;
    include_notes?: boolean;
    include_flashcards?: boolean;
    include_quizzes?: boolean;
    include_study_sessions?: boolean;
    include_streaks?: boolean;
    include_recommendations?: boolean;
  };
}

export const EnhancedDailyDigestEmail = ({
  user_name,
  goals = [],
  todos = [],
  notes = [],
  flashcards = [],
  quizzes = [],
  study_sessions = [],
  overdue_count = 0,
  completed_today = 0,
  study_streak = 0,
  app_url,
  unsubscribe_url,
  preferences = {}
}: EnhancedDailyDigestEmailProps) => (
  <Html>
    <Head />
    <Preview>Your daily study digest - Stay on track with your learning goals!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📚 Your Daily Study Digest</Heading>
        
        <Text style={greeting}>Good morning, {user_name}!</Text>
        
        {preferences.include_streaks && (
          <Section style={streakSection}>
            <Text style={streakText}>
              🔥 Study Streak: <strong>{study_streak} days</strong>
            </Text>
            {completed_today > 0 && (
              <Text style={completedText}>
                ✅ Completed today: <strong>{completed_today}</strong> tasks
              </Text>
            )}
          </Section>
        )}

        {overdue_count > 0 && (
          <Section style={urgentSection}>
            <Text style={urgentText}>
              ⚠️ You have <strong>{overdue_count}</strong> overdue items that need attention
            </Text>
          </Section>
        )}

        {preferences.include_goals && goals.length > 0 && (
          <Section>
            <Heading style={h2}>🎯 Your Goals</Heading>
            {goals.map((goal, index) => (
              <div key={index} style={itemCard}>
                <Text style={itemTitle}>{goal.title}</Text>
                <Text style={itemMeta}>
                  Progress: {goal.progress}% • Due: {new Date(goal.end_date).toLocaleDateString()}
                </Text>
                {goal.description && (
                  <Text style={itemDescription}>{goal.description}</Text>
                )}
              </div>
            ))}
          </Section>
        )}

        {preferences.include_todos && todos.length > 0 && (
          <Section>
            <Heading style={h2}>📝 Your Tasks</Heading>
            {todos.map((todo, index) => (
              <div key={index} style={itemCard}>
                <Text style={itemTitle}>
                  {todo.escalation_level === 'urgent' && '🚨 '}
                  {todo.escalation_level === 'critical' && '🔴 '}
                  {todo.title}
                </Text>
                <Text style={itemMeta}>
                  Priority: {todo.priority} • Due: {new Date(todo.due_date).toLocaleDateString()}
                  {todo.days_overdue > 0 && ` • ${todo.days_overdue} days overdue`}
                </Text>
                {todo.description && (
                  <Text style={itemDescription}>{todo.description}</Text>
                )}
              </div>
            ))}
          </Section>
        )}

        {preferences.include_notes && notes.length > 0 && (
          <Section>
            <Heading style={h2}>📄 Recent Notes</Heading>
            {notes.map((note, index) => (
              <div key={index} style={itemCard}>
                <Text style={itemTitle}>{note.title}</Text>
                <Text style={itemMeta}>
                  Subject: {note.subject} • Updated: {new Date(note.updated_at).toLocaleDateString()}
                </Text>
                {note.description && (
                  <Text style={itemDescription}>{note.description.substring(0, 100)}...</Text>
                )}
              </div>
            ))}
          </Section>
        )}

        {preferences.include_flashcards && flashcards.length > 0 && (
          <Section>
            <Heading style={h2}>🎴 Flashcard Sets</Heading>
            {flashcards.map((set, index) => (
              <div key={index} style={itemCard}>
                <Text style={itemTitle}>{set.title}</Text>
                <Text style={itemMeta}>
                  {set.card_count} cards • Subject: {set.subject}
                  {set.needs_review && ' • Needs Review'}
                </Text>
                {set.description && (
                  <Text style={itemDescription}>{set.description}</Text>
                )}
              </div>
            ))}
          </Section>
        )}

        {preferences.include_quizzes && quizzes.length > 0 && (
          <Section>
            <Heading style={h2}>🧠 Recent Quiz Results</Heading>
            {quizzes.map((quiz, index) => (
              <div key={index} style={itemCard}>
                <Text style={itemTitle}>{quiz.title}</Text>
                <Text style={itemMeta}>
                  Score: {quiz.score}/{quiz.total_questions} ({Math.round((quiz.score/quiz.total_questions)*100)}%)
                  • Completed: {new Date(quiz.completed_at).toLocaleDateString()}
                </Text>
              </div>
            ))}
          </Section>
        )}

        {preferences.include_study_sessions && study_sessions.length > 0 && (
          <Section>
            <Heading style={h2}>⏱️ Study Sessions</Heading>
            {study_sessions.map((session, index) => (
              <div key={index} style={itemCard}>
                <Text style={itemTitle}>{session.title}</Text>
                <Text style={itemMeta}>
                  Duration: {Math.round(session.duration/60)} min • 
                  Quality: {session.session_quality} • 
                  {new Date(session.start_time).toLocaleDateString()}
                </Text>
                {session.notes && (
                  <Text style={itemDescription}>{session.notes}</Text>
                )}
              </div>
            ))}
          </Section>
        )}

        {preferences.include_recommendations && (
          <Section>
            <Heading style={h2}>💡 Today's Recommendations</Heading>
            <div style={recommendationCard}>
              <Text style={itemTitle}>Keep up your study momentum!</Text>
              <Text style={itemDescription}>
                Based on your recent activity, consider reviewing your flashcards and working on overdue tasks.
              </Text>
            </div>
          </Section>
        )}

        <Hr style={hr} />

        <Section style={actionSection}>
          <Button href={app_url} style={primaryButton}>
            Open PrepGenie
          </Button>
        </Section>

        <Text style={footer}>
          <Link href={unsubscribe_url} style={footerLink}>
            Manage your email preferences
          </Link>
          {' • '}
          <Link href={`${app_url}/help`} style={footerLink}>
            Get Help
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
  padding: '0',
}

const greeting = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const streakSection = {
  backgroundColor: '#e8f5e8',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const streakText = {
  color: '#2d5a2d',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const completedText = {
  color: '#2d5a2d',
  fontSize: '14px',
  margin: '0',
}

const urgentSection = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const urgentText = {
  color: '#dc2626',
  fontSize: '14px',
  margin: '0',
}

const itemCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
  border: '1px solid #e2e8f0',
}

const itemTitle = {
  color: '#1a202c',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const itemMeta = {
  color: '#4a5568',
  fontSize: '14px',
  margin: '0 0 8px',
}

const itemDescription = {
  color: '#718096',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.4',
}

const recommendationCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '16px',
  margin: '12px 0',
  border: '1px solid #fcd34d',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
}

const actionSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const primaryButton = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
}

const footer = {
  color: '#8a8a8a',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '32px 0 0',
}

const footerLink = {
  color: '#10b981',
  textDecoration: 'underline',
}

export default EnhancedDailyDigestEmail
