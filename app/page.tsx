import HomeWithOnboarding from "@/components/onboarding/HomeWithOnboarding";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/queries/users";
import { loadAllPacks } from "@/lib/pack-loader/load";

export default async function HomePage() {
  const [packs, session] = await Promise.all([loadAllPacks(), getSession()]);
  const user = await getUserById(session.user.id);
  const hasProfile = !!(user?.expertiseProfile && Object.keys(user.expertiseProfile).length > 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-8 py-16 sm:py-24">
        <header className="mb-14">
          <h1 className="font-serif text-5xl font-light tracking-tight text-foreground">Lattice</h1>
          <p className="mt-4 text-base text-muted-foreground max-w-md leading-relaxed">
            A research agent that learns from curated sources — not the whole internet. Pick a topic
            and start building your knowledge.
          </p>
        </header>
        <HomeWithOnboarding packs={packs} hasProfile={hasProfile} />
      </div>
    </main>
  );
}
