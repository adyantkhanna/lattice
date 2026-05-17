"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  open: boolean;
  onComplete: () => void;
};

export default function OnboardingModal({ open, onComplete }: Props) {
  const [background, setBackground] = useState("");
  const [level, setLevel] = useState<Level>("intermediate");
  const [goals, setGoals] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background, level, goals }),
      });
      onComplete();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            Tell us about yourself
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Lattice calibrates its answers to your background so you get explanations at the right
            depth — not too basic, not over your head.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="background" className="text-sm font-medium">
              Your background
            </Label>
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
            <Label className="text-sm font-medium">Expertise level</Label>
            <div className="grid grid-cols-2 gap-2">
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
            <Label htmlFor="goals" className="text-sm font-medium">
              What do you want to learn or accomplish?
            </Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Understand transformer architectures well enough to implement one from scratch…"
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving…" : "Get started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
