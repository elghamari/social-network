"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { showToast } from "@/app/ui/layout/toast-store";
import { listJoinRequests } from "@/app/lib/services/group";
import { JoinRequestItem } from "@/app/lib/types/group";

export function useJoinRequestList(groupId: string) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<JoinRequestItem[] | null>(null);

  useEffect(() => {
    listJoinRequests(groupId)
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

  function removeJoinRequest(userId: string) {
    setList((prev) => prev?.filter((r) => r.userId !== userId) ?? null);
  }

  return { list, loading, removeJoinRequest };
}
