import { getSession } from "@/lib/auth/session";
import { getUserById, updateExpertiseProfile, upsertUser } from "@/lib/db/queries/users";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  const user = await getUserById(session.user.id);
  return Response.json({ expertiseProfile: user?.expertiseProfile ?? null });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  const body = (await req.json()) as {
    background?: string;
    level?: string;
    goals?: string;
  };

  const allowed = ["beginner", "intermediate", "advanced", "expert"];
  if (body.level && !allowed.includes(body.level)) {
    return new Response("Invalid level", { status: 400 });
  }

  // Ensure user row exists before updating
  await upsertUser({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });

  await updateExpertiseProfile(session.user.id, {
    background: body.background ?? "",
    level: body.level ?? "intermediate",
    goals: body.goals ?? "",
  });

  return new Response(null, { status: 204 });
}
