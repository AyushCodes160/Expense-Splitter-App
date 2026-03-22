import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GroupService, type Group } from "@/lib/services";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/groups/")({
  head: () => ({ meta: [{ title: "Groups — Splitly" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setGroups(await GroupService.listMine());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await GroupService.create(name, description || undefined);
      toast.success(`Group "${name}" created`);
      setOpen(false);
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell>
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-sm text-muted-foreground">
              {groups.length} {groups.length === 1 ? "group" : "groups"}
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient" id="new-group-btn">
                <Plus className="h-4 w-4" /> New group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-border sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2" id="create-group-form">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Name</Label>
                  <Input
                    id="group-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Roommates, Bali trip..."
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-desc">Description (optional)</Label>
                  <Textarea
                    id="group-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this group for?"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={creating}
                  className="btn-gradient w-full h-11"
                  id="create-group-submit"
                >
                  {creating ? "Creating..." : "Create group"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="mt-12 glass rounded-3xl p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl btn-gradient animate-float">
              <UsersIcon className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No groups yet</h2>
            <p className="mt-2 text-muted-foreground">
              Create a group to start splitting expenses with friends.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="btn-gradient mt-6"
              id="empty-create-group-btn"
            >
              <Plus className="h-4 w-4" /> Create group
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <Link
                key={g.id}
                to="/groups/$groupId"
                params={{ groupId: g.id }}
                id={`group-card-${g.id}`}
                className="glass rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-glow"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl btn-gradient">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{g.name}</h3>
                {g.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {g.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
