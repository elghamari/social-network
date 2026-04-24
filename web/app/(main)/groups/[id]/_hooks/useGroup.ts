"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Group } from "@/app/lib/types/groups";
import { getGroupById } from "@/app/lib/services/groups";
import { showToast } from "@/app/ui/layout/toast-store";

export function useGroup(id: string) {
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getGroupById(id)
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
            setGroup(resp.group);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { group, loading };
}
