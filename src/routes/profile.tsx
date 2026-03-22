import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as UserIcon, Mail, AtSign } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileService, type Profile } from "@/lib/services";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Splitly" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    ProfileService.getMe().then((p) => {
      if (p) {
        setProfile(p);
        setFullName(p.full_name || "");
        setUsername(p.username);
      }
    });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await ProfileService.update({ full_name: fullName, username });
      setProfile(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <AppShell><div className="py-24" /></AppShell>;

  const initials = (profile.full_name || profile.username).slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <div className="animate-fade-in-up max-w-2xl">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account</p>

        <div className="mt-8 glass rounded-3xl p-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/20 text-2xl text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{profile.full_name || profile.username}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AtSign className="h-3 w-3" />
                {profile.username}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3" />
                {user?.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-4" id="profile-form">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-username">Username</Label>
              <Input
                id="profile-username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                minLength={3}
                required
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Friends use this to add you to groups.
              </p>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="btn-gradient h-11"
              id="profile-save-btn"
            >
              <UserIcon className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
