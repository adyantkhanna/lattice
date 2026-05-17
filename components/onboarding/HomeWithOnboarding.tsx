"use client";

import { useState } from "react";
import PackGrid from "@/components/pack-selector/PackGrid";
import type { TopicPack } from "@/lib/pack-loader/types";
import OnboardingModal from "./OnboardingModal";

type Props = {
  packs: TopicPack[];
  hasProfile: boolean;
};

export default function HomeWithOnboarding({ packs, hasProfile }: Props) {
  const [showModal, setShowModal] = useState(!hasProfile);

  return (
    <>
      <PackGrid packs={packs} />
      <OnboardingModal open={showModal} onComplete={() => setShowModal(false)} />
    </>
  );
}
