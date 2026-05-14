"use client";

import { Suspense, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import type { GroupTab } from "@/app/lib/types/group";

import { SearchIcon } from "@/app/ui/icons";

const DEBOUNCE_MS = 400;

function SearchContent() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = (searchParams.get("tab") as GroupTab) || "discover";
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleChange(value: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("tab", activeTab);

      const trimmed = value.trim();
      if (trimmed) params.set("query", trimmed);

      replace(`${pathname}?${params.toString()}`);
    }, DEBOUNCE_MS);
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
        onChange={(e) => handleChange(e.target.value)}
        defaultValue={searchParams.get("query") ?? ""}
      />
    </div>
  );
}

export default function GroupSearch() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
