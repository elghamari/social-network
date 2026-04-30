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

  const activeTab = (searchParams.get("tab") as GroupTab) || "discover";
  const query = searchParams.get("query") || "";

  const { groups, loading, actions } = useGroups(activeTab, query);
  const [showModal, setShowModal] = useState(false);

  function handleCreated(group: Group) {
    actions.addGroup(group);
    setShowModal(false);
  }

  return (
    <div className="groups-page">
      <div className="groups-page__header">
        <h1 className="groups-page__title">Groups</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <PlusIcon size={15} />
          Create Group
        </button>
      </div>

      <GroupTabs />
      <GroupSearch />
      <GroupList
        groups={groups}
        loading={loading}
        onRequest={actions.rmGroup}
      />

      {showModal && (
        <GroupFormModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
