"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Level = "beginner" | "intermediate" | "advanced" | "expert";

const LEVELS: { value: Level; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "New to this field" },
  { value: "intermediate", label: "Intermediate", hint: "Some background knowledge" },
  { value: "advanced", label: "Advanced", hint: "Strong working knowledge" },
  { value: "expert", label: "Expert", hint: "Deep domain expertise" },
];

type Props = {
  initialProfile: {
    background?: string;
    level?: string;
    goals?: string;
  };
};

export default function SettingsForm({ initialProfile }: Props) {
  const [background, setBackground] = useState(initialProfile.background ?? "");
  const [level, setLevel] = useState<Level>((initialProfile.level as Level) ?? "intermediate");
  const [goals, setGoals] = useState(initialProfile.goals ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ background, level, goals }),
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">
          Your Profile
        </h2>

        <div className="space-y-2">
          <Label htmlFor="background">Background</Label>
          <input
            id="background"
            type="text"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="e.g. Software engineer, PhD student in ML, curious generalist…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <Label>Expertise level</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                  level === l.value
                    ? "border-ring bg-muted/60 text-foreground"
                    : "border-border text-muted-foreground hover:border-ring/50 hover:text-foreground"
                }`}
              >
                <p className="text-sm font-medium">{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals">Learning goals</Label>
          <Textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What do you want to understand or accomplish?"
            rows={4}
            className="resize-none text-sm"
          />
        </div>
      </section>

      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save changes"}
      </Button>
    </form>
  );
}
