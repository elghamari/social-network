package hub

import (
	"encoding/json"
	"net/http"
	"soc-net/internal/types"
)

// Notify the invited user
func (h *Hub) onGroupInvite(senderId string, payload []byte) {
	var data struct {
		TargetUserId string      `json:"targetUserId"`
		Group        types.Group `json:"group"`
	}
	if err := json.Unmarshal(payload, &data); err != nil {
		h.sendError(senderId, http.StatusBadRequest, "")
	}

	raw, _ := json.Marshal(Signal{
		Kind: "group_invitation_received",
		Data: data,
	})

	h.sendToUser(data.TargetUserId, raw)
	return
}

// Notify group creator of a new join request
func (h *Hub) onJoinRequest(requesterID string, payload []byte) error {
	var data struct {
		CreatorID string `json:"creatorId"`
		GroupID   string `json:"groupId"`
		User      any    `json:"user"`
	}
	if err := json.Unmarshal(payload, &data); err != nil {
		return err
	}
	raw, _ := json.Marshal(Signal{
		Kind: "group_join_request",
		Data: data,
	})
	h.sendToUser(data.CreatorID, raw)
	return nil
}

// Notify inviter + new member when invite is accepted
func (h *Hub) onInviteAccepted(userID string, payload []byte) error {
	var data struct {
		GroupID string `json:"groupId"`
	}
	json.Unmarshal(payload, &data)
	raw, _ := json.Marshal(Signal{
		Kind: "group_invite_accepted",
		Data: map[string]any{"userId": userID, "groupId": data.GroupID},
	})
	h.broadcast(raw, "")
	return nil
}

// Notify requester that their request was approved
func (h *Hub) onRequestApproved(approverID string, payload []byte) error {
	var data struct {
		TargetUserID string `json:"targetUserId"`
		GroupID      string `json:"groupId"`
	}
	json.Unmarshal(payload, &data)
	raw, _ := json.Marshal(Signal{
		Kind: "join_request_approved",
		Data: map[string]string{"groupId": data.GroupID},
	})
	h.sendToUser(data.TargetUserID, raw)
	return nil
}

// Notify all group members of a new event
func (h *Hub) onNewGroupEvent(creatorID string, payload []byte) error {
	var data struct {
		MemberIDs []string `json:"memberIds"`
		Event     any      `json:"event"`
	}
	json.Unmarshal(payload, &data)
	raw, _ := json.Marshal(Signal{
		Kind: "new_group_event",
		Data: data.Event,
	})
	for _, memberID := range data.MemberIDs {
		if memberID != creatorID {
			h.sendToUser(memberID, raw)
		}
	}
	return nil
}

// Notify group creator when someone RSVPs (optional/bonus)
func (h *Hub) onEventResponse(userID string, payload []byte) error {
	var data struct {
		CreatorID string `json:"creatorId"`
		EventID   string `json:"eventId"`
		Response  string `json:"response"`
	}
	json.Unmarshal(payload, &data)
	raw, _ := json.Marshal(Signal{
		Kind: "event_rsvp_update",
		Data: map[string]string{
			"userId":   userID,
			"eventId":  data.EventID,
			"response": data.Response,
		},
	})
	h.sendToUser(data.CreatorID, raw)
	return nil
}
