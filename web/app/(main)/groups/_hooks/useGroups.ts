"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Group, Tab } from "@/app/lib/types/groups";
import { listGroups } from "@/app/lib/services/groups";
import { showToast } from "@/app/ui/layout/toast-store";

export function useGroups(activeTab: Tab, query: string) {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    listGroups(activeTab, query)
      .then((resp) => {
        switch (resp.status) {
          case 401:
            router.push("/login");
            break;

          case 400:
            showToast(resp.error);
            break;

          case 500:
            showToast("Somthing went wrong. try again later");
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
