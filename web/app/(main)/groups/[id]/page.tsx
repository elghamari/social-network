import { redirect } from "next/navigation";

export default async function GroupDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  redirect(`/groups/${p.id}/posts`);
}
