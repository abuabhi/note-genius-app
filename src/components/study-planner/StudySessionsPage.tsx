import React, { useState, useMemo } from 'react';
import { Calendar, Grid3X3, Clock, Filter, Plus, Link as LinkIcon } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useStudyPlanSessions } from '@/hooks/useStudyPlanSessions';
import { StudySessionsGrid } from './StudySessionsGrid';
import { StudySessionsCalendar } from './StudySessionsCalendar';
import { SessionExecutionModal } from './SessionExecutionModal';
import { SessionRescheduleDialog } from './SessionRescheduleDialog';
import { SessionLinkingDialog } from './SessionLinkingDialog'; // New import
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { StudyPlanSession } from '@/types/studyPlanner';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const StudySessionsPage = () => {
  const { user, loading } = useRequireAuth();
  const navigate = useNavigate();
  
  const {
    sessions,
    sessionsLoading,
    sessionStats,
    startSession,
    completeSession,
    rescheduleSession,
    isStarting,
    isCompleting,
    isRescheduling,
  } = useStudyPlanSessions();

  const [selectedSession, setSelectedSession] = useState<StudyPlanSession | null>(null);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showLinkingDialog, setShowLinkingDialog] = useState(false); // New state
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentView, setCurrentView] = useState<'grid' | 'calendar'>('grid');

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(session => session.priority === priorityFilter);
    }

    return filtered;
  }, [sessions, statusFilter, priorityFilter]);

  const handleStartSession = async (sessionId: string) => {
    await startSession(sessionId);
  };

  const handleCompleteSession = async (params: { sessionId: string; notes?: string; rating?: number }) => {
    await completeSession(params);
    setShowExecutionModal(false);
  };

  const handleRescheduleSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setShowRescheduleDialog(true);
    }
  };

  const handleSessionClick = (session: StudyPlanSession) => {
    setSelectedSession(session);
    setShowExecutionModal(true);
  };

  // New handler for linking sessions
  const handleLinkSession = (session: StudyPlanSession) => {
    setSelectedSession(session);
    setShowLinkingDialog(true);
  };

  const handleReschedule = async (params: { sessionId: string; newDate: string; newStartTime: string; newEndTime: string }) => {
    await rescheduleSession(params);
    setShowRescheduleDialog(false);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
  };

  const handleSessionDrop = async (sessionId: string, newDate: string, newStartTime: string, newEndTime: string) => {
    await rescheduleSession({ sessionId, newDate, newStartTime, newEndTime });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const breadcrumbs = [
    { label: "Study Sessions" }
  ];

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => navigate('/study-planner')}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Plan
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Study Sessions"
        description="Execute and track your planned study sessions"
        icon={<Clock className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-center p-4">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {sessionStats.total}
                  </div>
                  <div className="text-sm text-blue-600">Total Sessions</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-4">
                <Calendar className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {sessionStats.scheduled}
                  </div>
                  <div className="text-sm text-yellow-600">Scheduled</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-4">
                <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {sessionStats.inProgress}
                  </div>
                  <div className="text-sm text-orange-600">In Progress</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-4">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {sessionStats.completed}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center bg-white rounded-lg p-1 border">
              <Button
                variant={currentView === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('grid')}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={currentView === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('calendar')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>

          {/* Sessions Content */}
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mint-500" />
            </div>
          ) : (
            <>
              {currentView === 'grid' ? (
                <StudySessionsGrid
                  sessions={filteredSessions}
                  onStartSession={handleStartSession}
                  onCompleteSession={handleCompleteSession}
                  onRescheduleSession={handleRescheduleSession}
                  onSessionClick={handleSessionClick}
                  onLinkSession={handleLinkSession} // New prop
                  isStarting={isStarting}
                  isCompleting={isCompleting}
                />
              ) : (
                <div className="h-[800px]">
                  <StudySessionsCalendar
                    sessions={filteredSessions}
                    onSessionClick={handleSessionClick}
                    onDateClick={handleDateClick}
                    onSessionDrop={handleSessionDrop}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <SessionExecutionModal
        session={selectedSession}
        isOpen={showExecutionModal}
        onClose={() => setShowExecutionModal(false)}
        onStartSession={handleStartSession}
        onCompleteSession={handleCompleteSession}
        isStarting={isStarting}
        isCompleting={isCompleting}
      />

      <SessionRescheduleDialog
        session={selectedSession}
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        onReschedule={handleReschedule}
        isRescheduling={isRescheduling}
      />

      {/* New Linking Dialog */}
      <SessionLinkingDialog
        session={selectedSession}
        isOpen={showLinkingDialog}
        onClose={() => setShowLinkingDialog(false)}
      />
    </div>
  );
};

export default StudySessionsPage;
