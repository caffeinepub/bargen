import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProductDetails, useGetChatMessages, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, AlertCircle, Package, User } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesThreadPage() {
  const { productId } = useParams({ from: '/messages/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: productDetails, isLoading: productLoading, error: productError } = useGetProductDetails(productId);
  const { data: messages, isLoading: messagesLoading } = useGetChatMessages(productId);
  const sendMessageMutation = useSendMessage();

  // Get participant from URL search params manually
  const urlParams = new URLSearchParams(window.location.search);
  const participantFromUrl = urlParams.get('participant');

  // Determine the other participant
  // If participantFromUrl is provided (shopkeeper replying), use that
  // Otherwise, use the shop owner (customer messaging shopkeeper)
  const otherParticipant = participantFromUrl || productDetails?.shop.owner.toString();

  const { data: otherUserProfile } = useGetUserProfile(otherParticipant);

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

    if (!otherParticipant) {
      toast.error('Unable to determine recipient');
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        to: otherParticipant,
        content: messageText.trim(),
        productId: BigInt(productId),
      });
      setMessageText('');
    } catch (err: any) {
      toast.error(normalizeBackendError(err));
    }
  };

  if (productLoading || messagesLoading) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AuthGate>
    );
  }

  if (productError || !productDetails) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {productError ? normalizeBackendError(productError) : 'Unable to load product details.'}
              </p>
              <Button onClick={() => navigate({ to: '/' })}>
                Back to Discovery
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthGate>
    );
  }

  const shop = productDetails.shop;
  const otherUserName = otherUserProfile?.name || 'User';

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4">
            ← Back
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>Conversation with {otherUserName}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Package className="h-4 w-4" />
                    About: {productDetails.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
                {!messages || messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.from.toString() === identity?.getPrincipal().toString();
                    const timeAgo = formatDistanceToNow(new Date(Number(message.timestamp) / 1000000), { addSuffix: true });

                    return (
                      <div
                        key={message.id.toString()}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sendMessageMutation.isPending}
                />
                <Button type="submit" disabled={sendMessageMutation.isPending || !messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGate>
  );
}
