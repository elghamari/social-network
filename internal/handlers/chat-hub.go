package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"soc-net/internal/services"
	"soc-net/internal/types"

	"github.com/gorilla/websocket"
)

type Hub struct {
	peers       map[string]map[*Peer]bool
	join        chan *Peer
	leave       chan *Peer
	disconnect  chan string
	query       chan StatusQuery
	events      chan Event
	chatService *services.ChatService
}

type Peer struct {
	uid  string
	conn *websocket.Conn
	out  chan []byte
	hub  *Hub
	mu   sync.Mutex
}

type StatusQuery struct {
	uid   string
	reply chan bool
}

type Event struct {
	Kind    string          `json:"type"`
	OwnerID string          `json:"-"`
	Payload json.RawMessage `json:"data"`
}

type Signal struct {
	Kind string `json:"type"`
	Data any    `json:"data"`
}

func NewHub(chatSvc *services.ChatService) *Hub {
	return &Hub{
		peers:       make(map[string]map[*Peer]bool),
		join:        make(chan *Peer),
		leave:       make(chan *Peer),
		disconnect:  make(chan string),
		query:       make(chan StatusQuery),
		events:      make(chan Event),
		chatService: chatSvc,
	}
}

func (h *Hub) Start() {
	for {
		select {
		case p := <-h.join:
			if err := h.onJoin(p); err != nil {
				log.Println("Hub.onJoin:", err)
			}

		case evt := <-h.events:
			switch evt.Kind {
			case "new_user":
				if err := h.onNewUser(evt.Payload); err != nil {
					log.Println("Hub.onNewUser:", err)
				}
			case "send_message":
				if err := h.onMessage(evt.OwnerID, evt.Payload); err != nil {
					log.Println("Hub.onMessage:", err)
				}

			case "mark_as_read":
				var senderId string
				json.Unmarshal(evt.Payload, &senderId)

				raw, _ := json.Marshal(Signal{
					Kind: "messages_read",
					Data: map[string]string{"senderId": senderId},
				})
				h.sendToUser(evt.OwnerID, raw)
			case "mark_group_as_read":
				var data map[string]int
				json.Unmarshal(evt.Payload, &data)

				raw, _ := json.Marshal(Signal{
					Kind: "group_messages_read",
					Data: data, 
				})
				h.sendToUser(evt.OwnerID, raw)
			}

		case p := <-h.leave:
			if err := h.onLeave(p); err != nil {
				log.Println("Hub.onLeave:", err)
			}

		case uid := <-h.disconnect:
			h.onForceDisconnect(uid)

		case sq := <-h.query:
			conns, exists := h.peers[sq.uid]
			sq.reply <- (exists && len(conns) > 0)
		}
		
	}
}


func (h *Hub) onJoin(p *Peer) error {
	wasOffline := len(h.peers[p.uid]) == 0
	if h.peers[p.uid] == nil {
		h.peers[p.uid] = make(map[*Peer]bool)
	}
	h.peers[p.uid][p] = true

	if !wasOffline {
		return nil
	}
	raw, err := json.Marshal(Signal{
		Kind: "user_status_change",
		Data: map[string]any{"user_id": p.uid, "status": true},
	})
	if err != nil {
		return fmt.Errorf("Hub.onJoin: marshal: %w", err)
	}
	h.broadcast(raw, p.uid)
	return nil
}

func (h *Hub) onLeave(p *Peer) error {
	conns, exists := h.peers[p.uid]
	if !exists {
		return nil
	}
	delete(conns, p)
	close(p.out)
	if len(conns) > 0 {
		return nil
	}
	delete(h.peers, p.uid)
	raw, err := json.Marshal(Signal{
		Kind: "user_status_change",
		Data: map[string]any{"user_id": p.uid, "status": false},
	})
	if err != nil {
		return fmt.Errorf("Hub.onLeave: marshal: %w", err)
	}
	h.broadcast(raw, p.uid)
	return nil
}

func (h *Hub) onForceDisconnect(uid string) {
	conns, exists := h.peers[uid]
	if !exists {
		return
	}

	for p := range conns {
		close(p.out)
		p.conn.Close()
	}
	delete(h.peers, uid)

	raw, _ := json.Marshal(Signal{
		Kind: "user_status_change",
		Data: map[string]any{"user_id": uid, "status": false},
	})
	h.broadcast(raw, uid)
}


func (h *Hub) onMessage(senderID string, payload []byte) error {
	var in types.IncomingMessage

	if err := json.Unmarshal(payload, &in); err != nil {
		h.sendError(senderID, http.StatusBadRequest, "Invalid request body")
		return nil
	}

	if senderID == in.ReceiverID {
		h.sendError(senderID, http.StatusBadRequest, "CANT_MESSAGE_SELF")
		return nil
	}


	if in.GroupId != nil {
		savedMsg, members, err := h.chatService.ProcessGroupMessage(senderID, *in.GroupId, in)
		if err != nil {
			h.sendError(senderID, http.StatusBadRequest, err.Error())
			return nil
		}

		raw, _ := json.Marshal(Signal{
			Kind: "new_message",
			Data: savedMsg,
		})

		for _, memberID := range members {
			h.sendToUser(memberID, raw)
		}
		return nil
	}

	savedMsg, err := h.chatService.ProcessPrivateMessage(senderID, in)
	if err != nil {
		h.sendError(senderID, http.StatusBadRequest, err.Error())
		return nil
	}

	raw, _ := json.Marshal(Signal{
		Kind: "new_message",
		Data: savedMsg,
	})

	canReceive, err := h.chatService.CanReceiveLive(in.ReceiverID, senderID)
	if err != nil {
		log.Println("Error checking live receive permission:", err)
	} else if canReceive {
		h.sendToUser(in.ReceiverID, raw)
	}

	h.sendToUser(senderID, raw)
	return nil
}

func (h *Hub) onNewUser(payload []byte) error {
	raw, err := json.Marshal(Signal{
		Kind: "new_user_available",
		Data: json.RawMessage(payload),
	})
	if err != nil {
		return err
	}

	h.broadcast(raw, "")
	return nil
}


func (h *Hub) sendError(userID string, status int, errMsg string) {
	raw, _ := json.Marshal(map[string]any{
		"type":   "error",
		"status": status,
		"error":  errMsg,
	})
	h.sendToUser(userID, raw)
}

func (h *Hub) broadcast(raw []byte, excludeUID string) {
	for id, conns := range h.peers {
		if id != excludeUID {
			for p := range conns {
				select {
				case p.out <- raw:
				default:
				}
			}
		}
	}
}

func (h *Hub) sendToUser(userID string, raw []byte) {
	for p := range h.peers[userID] {
		select {
		case p.out <- raw:
		default:
		}
	}
}

func (h *Hub) IsUserOnline(userID string) bool {
	conns, exists := h.peers[userID]
	return exists && len(conns) > 0
}


func (p *Peer) readPump() {
	defer func() {
		p.conn.Close()
		p.hub.leave <- p
	}()

	for {
		_, data, err := p.conn.ReadMessage()
		if err != nil {
			break
		}
		evt := Event{}
		if err := json.Unmarshal(data, &evt); err != nil {
			continue
		}
		evt.OwnerID = p.uid
		p.hub.events <- evt
	}
}

func (p *Peer) writePump() {
	defer func() {
		p.mu.Lock()
		p.conn.Close()
		p.mu.Unlock()
	}()

	for data := range p.out {
		p.mu.Lock()
		err := p.conn.WriteMessage(websocket.TextMessage, data)
		p.mu.Unlock()
		if err != nil {
			log.Println("Hub.writePump:", err)
			break
		}
	}
}