import SettingsForm from "@/components/settings/SettingsForm";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries/users";

export default async function SettingsPage() {
  const session = await getSession();
  const user = await getUserById(session.user.id);
  const profile = (user?.expertiseProfile ?? {}) as {
    background?: string;
    level?: string;
    goals?: string;
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-8 py-16">
        <header className="mb-10">
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Lattice uses your profile to calibrate explanations to your level.
          </p>
        </header>
        <SettingsForm initialProfile={profile} />
      </div>
    </main>
  );
}
