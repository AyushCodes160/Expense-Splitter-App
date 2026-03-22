import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FriendService, Friendship } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, UserPlus, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/friends")({
  component: FriendsPage,
});

function FriendsPage() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [friendId, setFriendId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const f = await FriendService.getFriends();
      const r = await FriendService.getPendingRequests();
      setFriends(f);
      setRequests(r);
    } catch (e) {
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await FriendService.sendRequest(friendId);
      toast.success("Friend request sent!");
      setFriendId("");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to send request");
    }
  };

  const acceptRequest = async (id: string) => {
    try {
      await FriendService.acceptRequest(id);
      toast.success("Friend request accepted!");
      loadData();
    } catch (e) {
      toast.error("Failed to accept");
    }
  };

  if (loading) return <AppShell><div className="p-6">Loading...</div></AppShell>;

  return (
    <AppShell>
      <div className="container max-w-4xl py-6 animate-fade-in space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
          <p className="text-muted-foreground mt-1">Manage your friends list.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Add Friend */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <UserPlus className="h-5 w-5" /> Add Friend
            </h2>
            <form onSubmit={sendRequest} className="flex gap-2">
              <Input
                placeholder="Enter User ID"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                required
              />
              <Button type="submit">Send</Button>
            </form>
          </div>

          {/* Pending Requests */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              Pending Requests
            </h2>
            {requests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending requests</p>
            ) : (
              <ul className="space-y-4">
                {requests.map(req => (
                  <li key={req.requestId} className="flex items-center justify-between">
                    <span className="font-medium">{req.sender.username}</span>
                    <Button size="sm" onClick={() => acceptRequest(req.requestId)}>
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Friends List */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" /> My Friends
          </h2>
          {friends.length === 0 ? (
             <p className="text-muted-foreground">You don't have any friends yet.</p>
          ) : (
             <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
               {friends.map(f => (
                 <li key={f.friendshipId} className="flex items-center p-3 rounded-xl bg-background/50 border border-white/5">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-primary font-bold">
                      {f.username[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{f.username}</span>
                 </li>
               ))}
             </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
