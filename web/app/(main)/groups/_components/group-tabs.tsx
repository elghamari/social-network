"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { GroupTab } from "@/app/lib/types/group";

const TABS: GroupTab[] = ["discover", "joined", "requests", "invitations"];

export default function GroupTabs() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab = (searchParams.get("tab") as GroupTab) || "discover";

  function setActiveTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="groups-tabs">
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`groups-tabs__tab ${
            activeTab === tab ? "groups-tabs__tab--active" : ""
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
