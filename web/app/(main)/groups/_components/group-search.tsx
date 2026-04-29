"use client";

import { useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import type { GroupTab } from "@/app/lib/types/group";

import { SearchIcon } from "@/app/ui/icons";

export default function GroupSearch() {
  const { replace } = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as GroupTab) || "discover";

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  function setSearch(value: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();

      params.set("tab", activeTab);
      if (value) {
        params.set("query", value);
      } else {
        params.delete("query");
      }

      replace(`${pathname}?${params.toString()}`);
    }, 500);
  }

  return (
    <div className="groups-search">
      <span className="groups-search__icon">
        <SearchIcon size={14} />
      </span>
      <input
        type="text"
        className="groups-search__input"
        placeholder="Search groups..."
        onChange={(e) => setSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
    </div>
  );
}
