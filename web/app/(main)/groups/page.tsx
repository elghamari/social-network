import "./page.css";

import Link from "next/link";

import GroupTabs from "./_components/group-tabs";
import GroupSearch from "./_components/group-search";
import GroupList from "./_components/group-list";

import { PlusIcon } from "@/app/ui/icons";

export default function GroupsPage() {
  return (
    <div className="groups-page">
      <div className="groups-page__header">
        <h1 className="groups-page__title">Groups</h1>
        <Link href="/groups/create" className="btn-primary">
          <PlusIcon size={15} />
          Create Group
        </Link>
      </div>

      <GroupTabs />
      <GroupSearch />
      <GroupList />
    </div>
  );
}
