import PackGrid from "@/components/pack-selector/PackGrid";
import { loadAllPacks } from "@/lib/pack-loader/load";

export default async function HomePage() {
  const packs = await loadAllPacks();
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Lattice</h1>
          <p className="mt-2 text-muted-foreground">Choose a research topic to get started.</p>
        </header>
        <PackGrid packs={packs} />
      </div>
    </main>
  );
}
