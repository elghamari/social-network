"use client";

import { useEffect, useState } from "react";

import { getGroup } from "@/app/lib/services/group";
import { Group, GroupRole } from "@/app/lib/types/group";

export function useGroupDetail(id: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getGroup(id)
      .then((resp) => {
        if (!resp) return;

        setGroup(resp.group);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function changeGroupRole(nextRole: GroupRole) {
    setGroup((prev) => {
      if (!prev) return prev;
      return { ...prev, role: nextRole };
    });
  }

  return { group, loading, changeGroupRole };
}
