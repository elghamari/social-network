import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  console.log(p);
  redirect(`/groups/${p.id}/posts`);
}
