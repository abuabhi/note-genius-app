
import { Chat } from "@/components/chat/Chat";

const ChatPage = () => {
  return (
    <div className="container mx-auto p-0 md:p-6 h-full">
      <h1 className="text-3xl font-bold mb-6 px-4 md:px-0 pt-4 md:pt-0">Chat</h1>
      <Chat />
    </div>
  );
};

export default ChatPage;
