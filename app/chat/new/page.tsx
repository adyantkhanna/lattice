import { redirect } from "next/navigation";
import NewChatLayout from "@/components/chat/NewChatLayout";
import { loadPackBySlug } from "@/lib/pack-loader/load";

export default async function NewChatPage({ searchParams }: { searchParams: { pack?: string } }) {
  const packSlug = searchParams.pack;
  if (!packSlug) redirect("/");

  const pack = await loadPackBySlug(packSlug);
  if (!pack) redirect("/");

  return <NewChatLayout packSlug={packSlug} packName={pack.name} />;
}
