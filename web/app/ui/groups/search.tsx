"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { SearchIcon } from "../icons";
import { useRef } from "react";
import {} from "next/navigation";

export default function Search({ tab }: { tab: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  let timeoutRef = useRef<NodeJS.Timeout | null>(null);
  function setSearch(value: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();

      params.set("tab", tab);
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
        <SearchIcon />
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
