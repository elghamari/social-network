"use client";

import { useState } from "react";

import GroupUserRow from "./group-user-row";

import type { JoinRequestState } from "../_hooks/use-join-request-list";

type Props = {
  requests: JoinRequestState;
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
};

export default function GroupJoinRequestList({
  requests,
  onApprove,
  onReject,
}: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isEmpty = !requests.loading && requests.list.length === 0;

  async function handleApprove(userId: string) {
    setPendingId(userId);
    await onApprove(userId);
    setPendingId(null);
  }

  async function handleReject(userId: string) {
    setPendingId(userId);
    await onReject(userId);
    setPendingId(null);
  }

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
                    disabled={pendingId === user.id}
                    onClick={() => handleApprove(user.id)}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="gd-manage__btn gd-manage__btn--reject"
                    disabled={pendingId === user.id}
                    onClick={() => handleReject(user.id)}
                  >
                    Reject
                  </button>
                </div>
              </GroupUserRow>
            ))}
          </>
        )}

        <div ref={requests.markerRef} aria-hidden="true" />
      </div>
    </section>
  );
}
