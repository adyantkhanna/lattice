import type { TopicPack } from "@/lib/pack-loader/types";
import PackCard from "./PackCard";

export default function PackGrid({ packs }: { packs: TopicPack[] }) {
  if (packs.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No packs available. Add YAML files to /packs.</p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack) => (
        <PackCard key={pack.slug} pack={pack} />
      ))}
    </div>
  );
}
