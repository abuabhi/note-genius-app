
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { StudySessionsGrid } from './StudySessionsGrid';
import { StudySessionsCalendar } from './StudySessionsCalendar';
import { SessionExecutionModal } from './SessionExecutionModal';
import { SessionRescheduleDialog } from './SessionRescheduleDialog';
import { useStudyPlanSessions } from '@/hooks/useStudyPlanSessions';
import { StudyPlanSession } from '@/types/studyPlanner';
import { Calendar, Grid, Search, Filter, Plus } from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

const StudySessionsPage = () => {
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

  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedSession, setSelectedSession] = useState<StudyPlanSession | null>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<StudyPlanSession | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique subjects for filtering
  const subjects = useMemo(() => {
    const subjectSet = new Set(sessions.map(s => s.topic).filter(Boolean));
    return Array.from(subjectSet);
  }, [sessions]);

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Status filter
      const statusMatch = statusFilter === 'all' || session.status === statusFilter;
      
      // Priority filter - declare before use
      const priorityMatch = priorityFilter === 'all' || session.priority === priorityFilter;
      
      // Subject filter
      const subjectMatch = subjectFilter === 'all' || session.topic === subjectFilter;
      
      // Search query
      const searchMatch = searchQuery === '' || 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (session.topic && session.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (session.description && session.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return statusMatch && priorityMatch && subjectMatch && searchMatch;
    });
  }, [sessions, statusFilter, priorityFilter, subjectFilter, searchQuery]);

  const handleSessionClick = (session: StudyPlanSession) => {
    setSelectedSession(session);
    setIsExecutionModalOpen(true);
  };

  const handleStartSession = async (sessionId: string) => {
    await startSession(sessionId);
  };

  const handleCompleteSession = async (params: { sessionId: string; notes?: string; rating?: number }) => {
    await completeSession(params);
  };

  const handleRescheduleSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSessionToReschedule(session);
      setIsRescheduleDialogOpen(true);
    }
  };

  const handleRescheduleSubmit = async (params: { sessionId: string; newDate: string; newStartTime: string; newEndTime: string }) => {
    await rescheduleSession(params);
    setIsRescheduleDialogOpen(false);
    setSessionToReschedule(null);
  };

  const handleCalendarSessionClick = (session: StudyPlanSession) => {
    handleSessionClick(session);
  };

  const handleCalendarDateClick = (date: Date) => {
    // TODO: Implement create new session on date click
    console.log('Create session for date:', date);
  };

  const handleCalendarSessionDrop = async (sessionId: string, newDate: string, newStartTime: string, newEndTime: string) => {
    await rescheduleSession({ sessionId, newDate, newStartTime, newEndTime });
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return filteredSessions
      .filter(session => new Date(session.scheduled_date) >= now && session.status === 'scheduled')
      .slice(0, 3);
  };

  if (sessionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading study sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Sessions</h1>
          <p className="text-gray-600 mt-1">Manage and track your study sessions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Scheduled</span>
            </div>
            <div className="text-2xl font-bold">{sessionStats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="text-2xl font-bold">{sessionStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <div className="text-2xl font-bold">{sessionStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <div className="text-2xl font-bold">{sessionStats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="skipped">Skipped</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {subjects.length > 0 && (
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject!}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-6">
        {viewMode === 'grid' ? (
          <StudySessionsGrid
            sessions={filteredSessions}
            onStartSession={handleStartSession}
            onCompleteSession={handleCompleteSession}
            onRescheduleSession={handleRescheduleSession}
            onSessionClick={handleSessionClick}
            isStarting={isStarting}
            isCompleting={isCompleting}
          />
        ) : (
          <Card>
            <CardContent className="p-6">
              <StudySessionsCalendar
                sessions={filteredSessions}
                onSessionClick={handleCalendarSessionClick}
                onDateClick={handleCalendarDateClick}
                onSessionDrop={handleCalendarSessionDrop}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <SessionExecutionModal
        session={selectedSession}
        isOpen={isExecutionModalOpen}
        onClose={() => {
          setIsExecutionModalOpen(false);
          setSelectedSession(null);
        }}
        onStartSession={handleStartSession}
        onCompleteSession={handleCompleteSession}
        isStarting={isStarting}
        isCompleting={isCompleting}
      />

      <SessionRescheduleDialog
        session={sessionToReschedule}
        isOpen={isRescheduleDialogOpen}
        onClose={() => {
          setIsRescheduleDialogOpen(false);
          setSessionToReschedule(null);
        }}
        onReschedule={handleRescheduleSubmit}
        isRescheduling={isRescheduling}
      />
    </div>
  );
};

export default StudySessionsPage;
