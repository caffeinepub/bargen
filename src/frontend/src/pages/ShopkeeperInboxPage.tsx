import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetShopkeeperChatThreads, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGate from '../components/AuthGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, User, Package, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define thread type since backend doesn't have this endpoint yet
interface ChatThread {
  productId: bigint;
  productName: string;
  otherParticipant: string;
  lastMessagePreview?: string;
  lastMessageTime?: bigint;
}

export default function ShopkeeperInboxPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: threads, isLoading, error } = useGetShopkeeperChatThreads();

  return (
    <AuthGate>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Shopkeeper Inbox</h1>
            <p className="text-muted-foreground">View and respond to customer messages</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load conversations. Please try again.
              </AlertDescription>
            </Alert>
          ) : !threads || threads.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Messages Yet</h3>
                <p className="text-muted-foreground">
                  Customer messages will appear here when they contact you about your products.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(threads as ChatThread[]).map((thread) => (
                <ThreadCard key={`${thread.productId}-${thread.otherParticipant}`} thread={thread} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}

function ThreadCard({ thread }: { thread: ChatThread }) {
  const navigate = useNavigate();
  const { data: userProfile } = useGetUserProfile(thread.otherParticipant);

  const handleOpenThread = () => {
    navigate({
      to: '/messages/$productId',
      params: { productId: thread.productId.toString() },
      search: { participant: thread.otherParticipant.toString() },
    });
  };

  const displayName = userProfile?.name || `User ${thread.otherParticipant.toString().slice(0, 8)}...`;
  const timeAgo = thread.lastMessageTime
    ? formatDistanceToNow(new Date(Number(thread.lastMessageTime) / 1000000), { addSuffix: true })
    : 'No messages yet';

  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleOpenThread}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1">{displayName}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Package className="h-4 w-4" />
                <span className="truncate">{thread.productName}</span>
              </div>
              {thread.lastMessagePreview && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {thread.lastMessagePreview}
                </p>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
            {timeAgo}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
