import Link from "next/link";
import "./page.css";

import { LeftArrowIcon } from "@/app/ui/icons";
import GroupForm from "@/app/(main)/groups/create/_components/group-form";

export default function Page() {
  return (
    <div className="create-group-page">
      <Link href="/groups" className="create-group-page__back">
        <LeftArrowIcon size={15} />
        Back
      </Link>

      <h1 className="create-group-page__title">Create Group</h1>

      <GroupForm />
    </div>
  );
}
