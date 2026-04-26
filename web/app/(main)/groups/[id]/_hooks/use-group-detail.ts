"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { showToast } from "@/app/ui/layout/toast-store";

import { getGroup } from "@/app/lib/services/group";
import { Group } from "@/app/lib/types/group";

export function useGroupDetail(id: string) {
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getGroup(id)
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
            setGroup(resp.group);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { group, loading };
}
