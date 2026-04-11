import { Dispatch, SetStateAction } from "react";
import { SearchIcon } from "../icons";

export default function GroupSearch({
  search,
  setSearch,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="groups-search">
      <span className="groups-search__icon">
        <SearchIcon />
      </span>
      <input
        type="text"
        className="groups-search__input"
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
