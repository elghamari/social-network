import clientApi from "./clientApi";
import { Tab } from "./types/groups";

export async function fetchGroups(activeTab: Tab, query: string) {
  const params = new URLSearchParams({
    tab: activeTab,
    query: query,
  });

  const resp = await clientApi.get(`/groups?${params.toString()}`);
  return resp.groups || [];
}
