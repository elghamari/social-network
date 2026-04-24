import "./page.css";

import Link from "next/link";

import Tabs from "@/app/ui/groups/tabs";
import Search from "@/app/ui/groups/search";
import GroupsList from "@/app/ui/groups/list";

import { Tab } from "@/app/lib/types/groups";
import { PlusIcon } from "@/app/ui/icons";
import { listGroups } from "@/app/lib/services/groups";
import { showToast } from "@/app/ui/layout/toast-store";
import { useAuth } from "@/app/context/AuthContext";

export default async function Page(props: {
  searchParams?: Promise<{
    tab?: Tab;
    query?: string;
  }>;
}) {
  // Tabs Setup.
  const searchParams = await props.searchParams;
  let activeTab = searchParams?.tab || "discover";

  if (!["discover", "joined", "pending"].includes(activeTab))
    activeTab = "discover";

  const query = searchParams?.query || "";

  // List Setup.
  const groups = (await listGroups(activeTab, query)) || [];

  return (
    <div className="groups-page">
      <div className="groups-page__header">
        <h1 className="groups-page__title">Groups</h1>
        <Link href="/groups/create" className="btn-primary">
          <PlusIcon />
          Create
        </Link>
      </div>

      <Tabs activeTab={activeTab} />
      <Search activeTab={activeTab} />
      <GroupsList groups={groups} activeTab={activeTab} />
    </div>
  );
}
