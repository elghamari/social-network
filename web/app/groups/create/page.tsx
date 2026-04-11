import Link from "next/link";
import "./page.css";

import { LeftArrowIcon } from "@/app/ui/icons";
import Form from "@/app/ui/groups/group-form";

export default function Page() {
  return (
    <div className="create-group-page">
      <Link href="/groups" className="create-group-page__back">
        <LeftArrowIcon />
        Back
      </Link>

      <h1 className="create-group-page__title">Create Group</h1>

      <Form />
    </div>
  );
}
