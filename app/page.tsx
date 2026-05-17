import PackGrid from "@/components/pack-selector/PackGrid";
import { loadAllPacks } from "@/lib/pack-loader/load";

export default async function HomePage() {
  const packs = await loadAllPacks();
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
        <PackGrid packs={packs} />
      </div>
    </main>
  );
}
