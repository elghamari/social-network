import "./page.css";

import Link from "next/link";

import { PlusIcon } from "@/app/ui/icons";

import Tabs from "./_components/tabs";
import Search from "./_components/search";
import GroupsList from "./_components/groups-list";

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

      <Tabs />
      <Search />
      <GroupsList />
    </div>
  );
}
