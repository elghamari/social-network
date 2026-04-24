import "./page.css";

import Link from "next/link";

import { PlusIcon } from "@/app/ui/icons";

import GroupTabs from "./_components/group-tabs";
import GroupSearch from "./_components/group-search";
import GroupList from "./_components/group-list";

export default function Page() {
  return (
    <div className="groups-page">
      <div className="groups-page__header">
        <h1 className="groups-page__title">Groups</h1>
        <Link href="/groups/create" className="btn-primary">
          <PlusIcon size={16} />
          Create
        </Link>
      </div>

      <GroupTabs />
      <GroupSearch />
      <GroupList />
    </div>
  );
}
