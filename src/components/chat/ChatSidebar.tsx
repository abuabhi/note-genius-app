
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, MessageSquare, Clock, Check, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfile } from "@/hooks/useRequireAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserConnection } from "@/types/chat";

export const ChatSidebar = () => {
  const { user } = useAuth();
  const { 
    conversations,
    loadingConversations,
    setActiveConversationId,
    activeConversationId,
    connections,
    loadingConnections,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    searchUsers
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 3) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const getPendingRequests = () => {
    if (!connections) return [];
    return connections.filter(
      conn => conn.receiver_id === user?.id && conn.status === 'pending'
    );
  };

  const getInitials = (name: string) => {
    return name?.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase() || '?';
  };

  const renderConnectionRequests = () => {
    const pendingRequests = getPendingRequests();
    
    if (pendingRequests.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No pending connection requests
        </div>
      );
    }
    
    return (
      <div className="space-y-2 p-2">
        {pendingRequests.map((request: UserConnection) => (
          <div key={request.id} className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{getInitials(request.sender_id)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{request.sender_id}</p>
                <p className="text-xs text-muted-foreground">Wants to connect</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-500"
                onClick={() => acceptConnectionRequest(request.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500"
                onClick={() => declineConnectionRequest(request.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserPlus className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Find Connections</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="secondary" 
                  onClick={handleSearch} 
                  disabled={searchQuery.length < 3 || isSearching}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} />
                          ) : (
                            <AvatarFallback>{getInitials(user.username || '')}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.user_tier}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => sendConnectionRequest(user.id)}
                      >
                        Connect
                      </Button>
                    </div>
                  ))
                ) : searchQuery.length >= 3 && !isSearching ? (
                  <p className="text-center text-muted-foreground py-4">No users found</p>
                ) : null}
                
                {isSearching && (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <Tabs defaultValue="conversations" className="flex flex-col flex-1">
        <TabsList className="grid grid-cols-2 m-2">
          <TabsTrigger value="conversations">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chats
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="h-4 w-4 mr-2" />
            Requests
            {getPendingRequests().length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {getPendingRequests().length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversations" className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-13rem)]">
            {loadingConversations ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : conversations && conversations.length > 0 ? (
              conversations.map((conversation) => {
                const participant = conversation.participants?.find(
                  (p) => p.user_id !== user?.id
                );
                
                return (
                  <div
                    key={conversation.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer ${
                      activeConversationId === conversation.id ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <Avatar>
                      {participant?.profile?.avatar_url ? (
                        <AvatarImage src={participant.profile.avatar_url} />
                      ) : (
                        <AvatarFallback>
                          {getInitials(participant?.profile?.username || '')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {participant?.profile?.username || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.last_message_at
                          ? new Date(conversation.last_message_at).toLocaleString()
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="requests" className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-13rem)]">
            {loadingConnections ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : (
              renderConnectionRequests()
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
