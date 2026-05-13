import GroupChatWindow from "@/app/(main)/groups/[id]/chat/_components/GroupChatWindow";

export default function GroupChatPage() {
  return (
    <div
      style={{
        maxHeight: "450px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <GroupChatWindow />
    </div>
  );
}
