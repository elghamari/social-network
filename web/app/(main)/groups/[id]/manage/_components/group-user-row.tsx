import { InvitableUser, JoinRequestUser } from "@/app/lib/types/group";

type Props = {
  user: InvitableUser | JoinRequestUser;
  children: React.ReactNode;
};

export default function GroupUserRow({ user, children }: Props) {
  const initials =
    user.firstName.charAt(0).toUpperCase() +
    user.lastName.charAt(0).toUpperCase();

  return (
    <div className="gd-manage__row">
      <div className="gd-avatar">
        {user.avatarPath ? <img src={user.avatarPath} alt="" /> : initials}
      </div>

      <div className="gd-manage__user">
        <span className="gd-manage__name">
          {user.firstName} {user.lastName}
        </span>
      </div>

      {children}
    </div>
  );
}
