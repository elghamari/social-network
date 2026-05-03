<<<<<<< HEAD
"use client";

import "./page.css";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { useGroups } from "./_hooks/use-groups";

import GroupTabs from "./_components/group-tabs";
import GroupSearch from "./_components/group-search";
import GroupList from "./_components/group-list";
import GroupFormModal from "./_components/group-form-modal";

import { PlusIcon } from "@/app/ui/icons";
import { Group, GroupTab } from "@/app/lib/types/group";

export default function GroupsPage() {
  const searchParams = useSearchParams();

  const tab = (searchParams.get("tab") as GroupTab) || "discover";
  const query = searchParams.get("query") || "";

  const { list, loading, markerRef, actions } = useGroups(tab, query);
  const [showModal, setShowModal] = useState(false);

  function handleCreated(group: Group) {
    actions.addGroup(group);
    setShowModal(false);
  }
=======
import "./page.css";

import Link from "next/link";

import Tabs from "@/app/ui/groups/tabs";
import Search from "@/app/ui/groups/search";
import GroupsList from "@/app/ui/groups/list";

import { Tab } from "@/app/lib/types/groups";
import { PlusIcon } from "@/app/ui/icons";
import { listGroups } from "@/app/lib/services/groups";
import { showToast } from "@/app/ui/layout/toast-store";

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
>>>>>>> origin/feed

  return (
    <div className="groups-page">
      <div className="groups-page__header">
        <h1 className="groups-page__title">Groups</h1>
<<<<<<< HEAD
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <PlusIcon size={15} />
          Create Group
        </button>
      </div>

      <GroupTabs />
      <GroupSearch />

      <GroupList
        groups={list}
        loading={loading}
        markerRef={markerRef}
        onRequest={actions.removeGroup}
      />

      {showModal && (
        <GroupFormModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
=======
        <Link href="/groups/create" className="btn-primary">
          <PlusIcon />
          Create
        </Link>
      </div>

      <Tabs activeTab={activeTab} />
      <Search activeTab={activeTab} />
      <GroupsList groups={groups} activeTab={activeTab} />
>>>>>>> origin/feed
    </div>
  );
}
