
import { useState } from "react";
import { useConnections } from "@/hooks/useConnections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, UserPlus, X, Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ConnectionsManager = () => {
  const {
    connections,
    incomingRequests,
    outgoingRequests,
    isLoading,
    respondToRequest,
    sendRequest
  } = useConnections();

  const [activeTab, setActiveTab] = useState("all");

  if (isLoading) {
    return <ConnectionsLoading />;
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5" />
          Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Connections
              {connections.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {connections.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="incoming">
              Incoming Requests
              {incomingRequests.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {incomingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Outgoing
              {outgoingRequests.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {outgoingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="all">
              <UserSearch />
              
              {connections.length === 0 ? (
                <EmptyState
                  message="You don't have any connections yet"
                  description="Search for users to connect with them"
                />
              ) : (
                <div className="space-y-2 mt-4">
                  {connections.map((connection) => {
                    // Handle both types of connections
                    const profile = connection.sender_profile || connection.receiver_profile;
                    
                    if (!profile) return null;
                    
                    return (
                      <div key={connection.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback>
                              {profile.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.username}</p>
                            <p className="text-xs text-muted-foreground">Connected</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="incoming">
              {incomingRequests.length === 0 ? (
                <EmptyState
                  message="No pending requests"
                  description="When someone sends you a connection request, it will appear here"
                />
              ) : (
                <div className="space-y-2">
                  {incomingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.sender_profile?.avatar_url || ''} />
                          <AvatarFallback>
                            {request.sender_profile?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.sender_profile?.username || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">
                            Sent request {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          onClick={() => respondToRequest.mutate({ connectionId: request.id, accept: true })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          onClick={() => respondToRequest.mutate({ connectionId: request.id, accept: false })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="outgoing">
              {outgoingRequests.length === 0 ? (
                <EmptyState
                  message="No outgoing requests"
                  description="Requests you've sent will appear here"
                />
              ) : (
                <div className="space-y-2">
                  {outgoingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.receiver_profile?.avatar_url || ''} />
                          <AvatarFallback>
                            {request.receiver_profile?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.receiver_profile?.username || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">
                            Sent request {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs italic text-muted-foreground">Pending</div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { searchUsers, sendRequest } = useConnections();
  
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search users by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleSearch}
          disabled={isSearching}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium">Search Results</h3>
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.username}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="gap-1"
                onClick={() => {
                  sendRequest.mutate(user.id);
                  setSearchResults(searchResults.filter(u => u.id !== user.id));
                }}
              >
                <UserPlus className="h-4 w-4" />
                Connect
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ message, description }: { message: string; description: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <h3 className="font-medium">{message}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
    </div>
  );
};

const ConnectionsLoading = () => (
  <Card className="border shadow-sm">
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-full mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
