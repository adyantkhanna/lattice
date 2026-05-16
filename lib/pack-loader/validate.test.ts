import { describe, expect, it } from "vitest";
import { validatePack } from "./validate";

describe("validatePack", () => {
  it("accepts a minimal valid pack", async () => {
    const result = await validatePack({
      slug: "ai-hardware",
      name: "AI Hardware",
      description: "A placeholder pack.",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects a pack missing required fields", async () => {
    const result = await validatePack({ slug: "bad" });
    expect(result.valid).toBe(false);
  });

  it("rejects a slug with invalid characters", async () => {
    const result = await validatePack({
      slug: "AI Hardware",
      name: "AI Hardware",
      description: "Bad slug.",
    });
    expect(result.valid).toBe(false);
  });

  it("accepts a pack with empty source arrays", async () => {
    const result = await validatePack({
      slug: "empty-sources",
      name: "Empty Sources",
      description: "Sources present but empty.",
      sources: { rss: [], sites: [] },
    });
    expect(result.valid).toBe(true);
  });
});
