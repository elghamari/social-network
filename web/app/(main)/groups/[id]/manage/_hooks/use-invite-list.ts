"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { showToast } from "@/app/ui/layout/toast-store";

import { getInvitableUsers } from "@/app/lib/services/group";
import { InvitableUser } from "@/app/lib/types/group";

export function useInviteList(groupId: string) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<InvitableUser[] | null>(null);

  useEffect(() => {
    getInvitableUsers(groupId)
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
            setList(resp.list);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return list;

    return (
      list?.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(q);
      }) || null
    );
  }, [query, list]);

  function setInvite(userId: string, isInvited: boolean) {
    setList(
      (prev) =>
        prev?.map((user) =>
          user.id === userId ? { ...user, isInvited: isInvited } : user,
        ) ?? null,
    );
  }

  return {
    list: filtered,
    loading,
    search: {
      query,
      setQuery,
    },

    setInvite,
  };
}
