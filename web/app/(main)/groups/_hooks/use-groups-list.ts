"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Group, GroupTab } from "@/app/lib/types/group";
import { getGroups } from "@/app/lib/services/group";
import { showToast } from "@/app/ui/layout/toast-store";

export function useGroupList(activeTab: GroupTab, query: string) {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getGroups(activeTab, query)
      .then((resp) => {
        switch (resp.status) {
          case 401:
            router.push("/login");
            break;

          case 400:
            showToast(resp.error);
            break;

          case 500:
            showToast("Something went wrong. Try again later.");
            break;

          default:
            setGroups(resp.groups);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query, activeTab]);

  return { groups, loading };
}
