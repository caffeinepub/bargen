import { useState, useEffect, useRef } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetChatMessages, useSendMessage, useGetProductDetails } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { normalizeBackendError } from '../utils/backendErrors';

export default function MessagesThreadPage() {
  const { productId } = useParams({ from: '/messages/$productId' });
  const { identity } = useInternetIdentity();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading, error: messagesError } = useGetChatMessages(productId);
  const { data: productDetails, isLoading: productLoading, error: productError } = useGetProductDetails(productId);
  const sendMessageMutation = useSendMessage();

  const currentUserPrincipal = identity?.getPrincipal().toString();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!productDetails) {
      toast.error('Unable to send message. Product information not available');
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        to: productDetails.shop.owner,
        content: messageText.trim(),
        productId: BigInt(productId),
      });

      setMessageText('');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  const isLoading = messagesLoading || productLoading;
  const hasError = messagesError || productError;

  return (
    <AuthGate message="Please log in to view messages">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader className="border-b border-border">
              {productLoading ? (
                <Skeleton className="h-6 w-1/2" />
              ) : productDetails ? (
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    {productDetails.product.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Chat with {productDetails.shop.name}
                  </p>
                </div>
              ) : (
                <CardTitle>Messages</CardTitle>
              )}
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {hasError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {normalizeBackendError(messagesError || productError)}
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <Skeleton className="h-16 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">
                      Start the conversation by sending a message
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isOwnMessage = message.from.toString() === currentUserPrincipal;
                    const timestamp = new Date(Number(message.timestamp) / 1000000);

                    return (
                      <div
                        key={message.id.toString()}
                        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                            {isOwnMessage ? 'You' : 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sendMessageMutation.isPending || !productDetails}
                />
                <Button 
                  type="submit" 
                  disabled={!messageText.trim() || sendMessageMutation.isPending || !productDetails}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </AuthGate>
  );
}
