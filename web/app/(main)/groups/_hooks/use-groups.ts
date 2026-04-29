"use client";

import { useEffect, useState } from "react";

import { getGroups } from "@/app/lib/services/group";
import type { Group, GroupTab } from "@/app/lib/types/group";

export function useGroups(activeTab: GroupTab, query: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const resp = await getGroups(activeTab, query);

      setLoading(false);
      setGroups(resp.groups ?? []);
    };

    fetchData();
  }, [query, activeTab]);

  function addGroup(group: Group) {
    if (activeTab !== "joined") return;

    setGroups((prev) => [...prev, group]);
  }

  function removeGroup(groupId: string) {
    if (activeTab === "joined") return;

    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }

  return {
    groups,
    loading,
    actions: {
      addGroup: addGroup,
      rmGroup: removeGroup,
    },
  };
}
