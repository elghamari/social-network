"use client";

import GroupUserRow from "./group-user-row";
import type { JoinRequestState } from "../_hooks/use-join-request-list";

type Props = {
  requests: JoinRequestState;
  onApprove: (uid: string) => void;
};

const SKELETON_COUNT = 5;

export default function GroupJoinRequestList({ requests, onApprove }: Props) {
  const isEmpty = !requests.loading && requests.list.length === 0;

  return (
    <section className="gd-manage__panel">
      <div className="gd-manage__panel-header">
        <h2 className="gd-manage__heading">Join Requests</h2>
        <p className="gd-manage__subtext">
          Approve or reject pending requests.
        </p>
      </div>

      <div className="gd-manage__list">
        {isEmpty ? (
          <div className="gd-empty">No pending requests.</div>
        ) : (
          <>
            {requests.list.map((user) => (
              <GroupUserRow key={user.id} user={user}>
                <div className="gd-manage__actions">
                  <button
                    type="button"
                    className="gd-manage__btn gd-manage__btn--approve"
                    disabled={requests.pendingId === user.id}
                    onClick={() => onApprove(user.id)}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="gd-manage__btn gd-manage__btn--reject"
                    disabled={requests.pendingId === user.id}
                    onClick={() => requests.reject(user.id)}
                  >
                    Reject
                  </button>
                </div>
              </GroupUserRow>
            ))}

            {requests.loading && <SkeletonRows />}
          </>
        )}

        <div ref={requests.markerRef} aria-hidden="true" />
      </div>
    </section>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <div key={i} className="gd-manage__row gd-manage__row--skeleton">
          <div className="skeleton gd-avatar" />
          <div className="gd-manage__user">
            <div className="skeleton" style={{ height: 14, width: "55%" }} />
            <div
              className="skeleton"
              style={{ height: 12, width: "30%", marginTop: 4 }}
            />
          </div>
          <div className="gd-manage__actions">
            <div
              className="skeleton"
              style={{
                height: 30,
                width: 65,
                borderRadius: "var(--radius-sm)",
              }}
            />
            <div
              className="skeleton"
              style={{
                height: 30,
                width: 65,
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
