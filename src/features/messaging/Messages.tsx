import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { Search, Send, User, MoreVertical, CheckCheck, Loader2, MessageSquare } from "lucide-react";
import { useMessaging } from "./MessagingContext";
import { useAuth } from "../auth/AuthContext";

export function Messages() {
  const { conversations, messages, loading, sendMessage, selectConversation, activeConversationId } = useMessaging();
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedConv = React.useMemo(() => 
    conversations.find(c => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return;
    setIsSubmitting(true);
    try {
      await sendMessage(activeConversationId, newMessage);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex space-x-6 animate-in">
      {/* Conversation List */}
      <Card className="w-full md:w-80 flex flex-col p-0 overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-4 dark:border-gray-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
            <Input placeholder="Search messages..." className="pl-10 h-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={cn(
                "w-full flex items-center space-x-3 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left dark:border-gray-800 dark:hover:bg-gray-800/50",
                activeConversationId === conv.id && "bg-blue-600/5 border-l-4 border-l-blue-600"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:bg-gray-800 dark:border-gray-800">
                {conv.photo ? (
                  <img 
                    src={conv.photo} 
                    alt={conv.name} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-6 w-6 text-slate-400 dark:text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 truncate dark:text-white">{conv.name}</h3>
                  <span className="text-[10px] text-slate-400 dark:text-gray-500">
                    {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5 dark:text-gray-400">{conv.lastMessage}</p>
              </div>
              {profile && conv.unreadCount && conv.unreadCount[profile.uid] > 0 && (
                <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {conv.unreadCount[profile.uid]}
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Chat View */}
      <Card className="hidden md:flex flex-1 flex-col p-0 overflow-hidden">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:bg-gray-800 dark:border-gray-800">
                  {selectedConv.photo ? (
                    <img 
                      src={selectedConv.photo} 
                      alt={selectedConv.name} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="h-6 w-6 text-slate-400 dark:text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedConv.name}</h3>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-slate-400 dark:text-gray-500" />
              </Button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[70%] space-y-1",
                    msg.senderId === profile?.uid ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "rounded-2xl px-4 py-2 text-sm",
                    msg.senderId === profile?.uid 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-slate-100 text-slate-700 rounded-tl-none dark:bg-gray-800 dark:text-gray-200"
                  )}>
                    {msg.content}
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 dark:text-gray-500">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.senderId === profile?.uid && <CheckCheck className="h-3 w-3 text-blue-500" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 dark:border-gray-800 dark:bg-gray-900/50">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isSubmitting}
                />
                <Button size="icon" disabled={!newMessage.trim() || isSubmitting} onClick={handleSendMessage}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4 dark:bg-gray-900">
              <MessageSquare className="h-10 w-10 text-slate-300 dark:text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select a conversation</h3>
            <p className="text-slate-400 mt-2 dark:text-gray-500">Choose a trader from the list to start messaging.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
