import { describe, expect, it } from "vitest";
import { hasAnySources } from "./load";
import type { TopicPack } from "./types";

const minimalPack: TopicPack = {
  slug: "test-pack",
  name: "Test Pack",
  description: "A pack with no sources.",
};

const fullPack: TopicPack = {
  slug: "full-pack",
  name: "Full Pack",
  description: "A pack with sources.",
  sources: { rss: ["https://example.com/feed.xml"] },
};

describe("hasAnySources", () => {
  it("returns false for a minimal pack with no sources field", () => {
    expect(hasAnySources(minimalPack)).toBe(false);
  });

  it("returns false for a pack with empty source arrays", () => {
    expect(hasAnySources({ ...minimalPack, sources: { rss: [], sites: [] } })).toBe(false);
  });

  it("returns true when at least one source is present", () => {
    expect(hasAnySources(fullPack)).toBe(true);
  });
});
