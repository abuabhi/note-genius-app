
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface Goal {
  id: string;
  title: string;
  description?: string;
  end_date: string;
  progress: number;
  is_completed: boolean;
  status?: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  escalation_level?: string;
  days_overdue?: number;
}

interface DailyDigestEmailProps {
  user_name: string;
  goals: Goal[];
  todos: Todo[];
  overdue_count: number;
  completed_today: number;
  app_url: string;
  unsubscribe_url: string;
}

export const DailyDigestEmail = ({
  user_name,
  goals,
  todos,
  overdue_count,
  completed_today,
  app_url,
  unsubscribe_url,
}: DailyDigestEmailProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string, escalation?: string) => {
    if (escalation === 'critical') return '#dc2626';
    if (escalation === 'urgent' || priority === 'high') return '#ea580c';
    if (priority === 'medium') return '#ca8a04';
    return '#65a30d';
  };

  return (
    <Html>
      <Head />
      <Preview>Your daily study digest - {goals.length} goals, {todos.length} todos</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Good morning, {user_name}! 📚</Heading>
          
          <Text style={paragraph}>
            Here's your daily study digest to help you stay on track with your goals and tasks.
          </Text>

          {/* Summary Stats */}
          <Section style={statsSection}>
            <Row>
              <Column style={statColumn}>
                <Text style={statNumber}>{goals.length}</Text>
                <Text style={statLabel}>Active Goals</Text>
              </Column>
              <Column style={statColumn}>
                <Text style={statNumber}>{todos.length}</Text>
                <Text style={statLabel}>Pending Todos</Text>
              </Column>
              <Column style={statColumn}>
                <Text style={statNumber}>{completed_today}</Text>
                <Text style={statLabel}>Completed Today</Text>
              </Column>
            </Row>
          </Section>

          {/* Overdue Alert */}
          {overdue_count > 0 && (
            <Section style={alertSection}>
              <Text style={alertText}>
                ⚠️ You have {overdue_count} overdue {overdue_count === 1 ? 'item' : 'items'} that need attention!
              </Text>
              <Link href={`${app_url}/todos`} style={alertButton}>
                Review Overdue Items
              </Link>
            </Section>
          )}

          {/* Goals Section */}
          {goals.length > 0 && (
            <Section>
              <Heading style={h2}>🎯 Your Active Goals</Heading>
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} style={itemCard}>
                  <Text style={itemTitle}>{goal.title}</Text>
                  {goal.description && (
                    <Text style={itemDescription}>{goal.description}</Text>
                  )}
                  <div style={progressContainer}>
                    <div style={progressBar}>
                      <div style={{...progressFill, width: `${goal.progress}%`}} />
                    </div>
                    <Text style={progressText}>{goal.progress}% complete</Text>
                  </div>
                  <Text style={itemDate}>Due: {formatDate(goal.end_date)}</Text>
                </div>
              ))}
              {goals.length > 5 && (
                <Text style={moreItemsText}>
                  And {goals.length - 5} more goals...
                </Text>
              )}
            </Section>
          )}

          {/* Todos Section */}
          {todos.length > 0 && (
            <Section>
              <Heading style={h2}>✅ Today's Tasks</Heading>
              {todos.slice(0, 8).map((todo) => (
                <div key={todo.id} style={itemCard}>
                  <div style={todoHeader}>
                    <Text style={itemTitle}>{todo.title}</Text>
                    <span 
                      style={{
                        ...priorityBadge, 
                        backgroundColor: getPriorityColor(todo.priority, todo.escalation_level)
                      }}
                    >
                      {todo.escalation_level === 'critical' ? 'CRITICAL' :
                       todo.escalation_level === 'urgent' ? 'URGENT' :
                       todo.priority.toUpperCase()}
                    </span>
                  </div>
                  {todo.description && (
                    <Text style={itemDescription}>{todo.description}</Text>
                  )}
                  {todo.due_date && (
                    <Text style={itemDate}>
                      Due: {formatDate(todo.due_date)}
                      {todo.days_overdue && todo.days_overdue > 0 && (
                        <span style={overdueText}> ({todo.days_overdue} days overdue)</span>
                      )}
                    </Text>
                  )}
                </div>
              ))}
              {todos.length > 8 && (
                <Text style={moreItemsText}>
                  And {todos.length - 8} more tasks...
                </Text>
              )}
            </Section>
          )}

          {/* Call to Action */}
          <Section style={ctaSection}>
            <Link href={app_url} style={ctaButton}>
              Open StudyHub
            </Link>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Text style={footer}>
            You're receiving this because you have daily digest enabled. 
            <Link href={unsubscribe_url} style={footerLink}>
              Update your preferences
            </Link> or 
            <Link href={unsubscribe_url} style={footerLink}>
              unsubscribe
            </Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default DailyDigestEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '0 0 24px 0',
};

const statsSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const statColumn = {
  textAlign: 'center' as const,
  width: '33.333%',
};

const statNumber = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0',
};

const statLabel = {
  fontSize: '14px',
  color: '#64748b',
  margin: '4px 0 0 0',
};

const alertSection = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const alertText = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0 0 12px 0',
};

const alertButton = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
};

const itemCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const itemTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 4px 0',
};

const itemDescription = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 8px 0',
};

const itemDate = {
  fontSize: '12px',
  color: '#64748b',
  margin: '8px 0 0 0',
};

const todoHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const priorityBadge = {
  fontSize: '10px',
  fontWeight: 'bold',
  color: '#ffffff',
  padding: '2px 6px',
  borderRadius: '4px',
  textTransform: 'uppercase' as const,
};

const overdueText = {
  color: '#dc2626',
  fontWeight: '600',
};

const progressContainer = {
  margin: '8px 0',
};

const progressBar = {
  backgroundColor: '#e2e8f0',
  borderRadius: '4px',
  height: '8px',
  overflow: 'hidden',
  marginBottom: '4px',
};

const progressFill = {
  backgroundColor: '#10b981',
  height: '100%',
};

const progressText = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0',
};

const moreItemsText = {
  fontSize: '14px',
  color: '#64748b',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '600',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
