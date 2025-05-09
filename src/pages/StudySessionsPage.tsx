
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, Clock, BarChart } from "lucide-react";
import { StudyTimer } from "@/components/study/StudyTimer";
import { StudySessionList } from "@/components/study/StudySessionList";
import { useStudySessions } from "@/hooks/useStudySessions";
import { StudyStatsOverview } from "@/components/study/StudyStatsOverview";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { SessionForm } from "@/components/study/SessionForm";
import { EndSessionForm } from "@/components/study/EndSessionForm";
import { FlashcardProvider } from "@/contexts/FlashcardContext";

const StudySessionsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showStartForm, setShowStartForm] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);
  const { isAuthorized, loading } = useRequireAuth();
  
  const { 
    sessions, 
    isLoading, 
    activeSession,
    timerActive,
    timerMode,
    toggleMode,
    handleTimerTick,
    focusTime,
    breakTime,
    setTimerActive,
  } = useStudySessions();

  // If not logged in, this will redirect to login
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Study Sessions</h1>
            <p className="text-muted-foreground">
              Track your study time and productivity
            </p>
          </div>
          
          {!activeSession && !showStartForm && (
            <Button 
              onClick={() => setShowStartForm(true)}
              className="mt-3 sm:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Session
            </Button>
          )}
        </div>
        
        {/* Start New Session Form */}
        {showStartForm && (
          <div className="mb-6">
            <SessionForm 
              onComplete={() => setShowStartForm(false)} 
              onCancel={() => setShowStartForm(false)}
            />
          </div>
        )}
        
        {/* Active Session Controls */}
        {activeSession && !showEndForm && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <StudyTimer
                isActive={timerActive}
                mode={timerMode}
                focusTime={focusTime}
                breakTime={breakTime}
                onStart={() => setTimerActive(true)}
                onPause={() => setTimerActive(false)}
                onToggleMode={toggleMode}
                onTick={handleTimerTick}
              />
            </div>
            <div>
              <Card className="p-4">
                <h3 className="font-medium mb-3">Session Details</h3>
                <p className="text-sm mb-1"><strong>Title:</strong> {activeSession.title}</p>
                {activeSession.subject && (
                  <p className="text-sm mb-1"><strong>Subject:</strong> {activeSession.subject}</p>
                )}
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEndForm(true)} 
                    className="w-full"
                  >
                    End Session
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* End Session Form */}
        {activeSession && showEndForm && (
          <div className="mb-6">
            <EndSessionForm 
              activeSession={activeSession}
              focusTime={focusTime}
              breakTime={breakTime}
              onComplete={() => {
                setShowEndForm(false);
              }}
            />
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <StudyStatsOverview />
            <StudySessionList sessions={sessions} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Detailed Analytics</h2>
              <p className="text-muted-foreground">
                More detailed study analytics coming soon!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StudySessionsPage;
