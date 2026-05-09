package hub

import (
    "encoding/json"
    "log"
    "sync"

    "soc-net/internal/services"
    "soc-net/internal/types"

    "github.com/gorilla/websocket"
)

type Hub struct {
    Peers       map[string]map[*Peer]bool
    Join        chan *Peer
    Leave       chan *Peer
    Disconnect  chan string
    Query       chan StatusQuery
    Events      chan Event
    Notify      chan types.HubNotification
    ChatService *services.ChatService
}

type Peer struct {
    Uid  string
    Conn *websocket.Conn
    Out  chan []byte
    Hub  *Hub
    Mu   sync.Mutex
}

type StatusQuery struct {
    Uid   string
    Reply chan bool
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
        Peers:       make(map[string]map[*Peer]bool),
        Join:        make(chan *Peer),
        Leave:       make(chan *Peer),
        Disconnect:  make(chan string),
        Query:       make(chan StatusQuery),
        Events:      make(chan Event),
        Notify:      make(chan types.HubNotification),
        ChatService: chatSvc,
    }
}

func (h *Hub) Start() {
    for {
        select {
        case p := <-h.Join:
            if err := h.onJoin(p); err != nil {
                log.Println("Hub.onJoin:", err)
            }

        case evt := <-h.Events:
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

                raw, err := json.Marshal(Signal{
                    Kind: "messages_read",
                    Data: map[string]string{"senderId": senderId},
                })
                if err == nil {
                    h.sendToUser(evt.OwnerID, raw)
                }

            case "mark_group_as_read":
                var data map[string]int
                json.Unmarshal(evt.Payload, &data)

                raw, err := json.Marshal(Signal{
                    Kind: "group_messages_read",
                    Data: data,
                })
                if err == nil {
                    h.sendToUser(evt.OwnerID, raw)
                }
            }
        case notif := <-h.Notify:
            raw, err := json.Marshal(Signal{
                Kind: "new_notification",
                Data: notif.Payload,
            })
            if err == nil {
                for _, uid := range notif.ReceiverIDs {
                    h.sendToUser(uid, raw)
                }
            }

        case p := <-h.Leave:
            if err := h.onLeave(p); err != nil {
                log.Println("Hub.onLeave:", err)
            }

        case uid := <-h.Disconnect:
            h.onForceDisconnect(uid)

        case sq := <-h.Query:
            conns, exists := h.Peers[sq.Uid]
            sq.Reply <- (exists && len(conns) > 0)
        }
    }
}

func (h *Hub) onJoin(p *Peer) error {
    wasOffline := len(h.Peers[p.Uid]) == 0
    if h.Peers[p.Uid] == nil {
        h.Peers[p.Uid] = make(map[*Peer]bool)
    }
    h.Peers[p.Uid][p] = true

    if !wasOffline {
        return nil
    }
    raw, err := json.Marshal(Signal{
        Kind: "user_status_change",
        Data: map[string]any{"user_id": p.Uid, "status": true},
    })
    if err != nil {
        log.Printf("Error marshaling user status for %s on join: %v", p.Uid, err)
        return nil
    }

    h.broadcast(raw, p.Uid)
    return nil
}

func (h *Hub) onLeave(p *Peer) error {
    conns, exists := h.Peers[p.Uid]
    if !exists {
        return nil
    }
    delete(conns, p)
    close(p.Out)

    if len(conns) > 0 {
        return nil
    }
    delete(h.Peers, p.Uid)

    raw, err := json.Marshal(Signal{
        Kind: "user_status_change",
        Data: map[string]any{"user_id": p.Uid, "status": false},
    })
    if err != nil {
        log.Printf("Error marshaling user status for %s on leave: %v", p.Uid, err)
        return nil
    }

    h.broadcast(raw, p.Uid)
    return nil
}

func (h *Hub) onForceDisconnect(uid string) {
    conns, exists := h.Peers[uid]
    if !exists {
        return
    }

    for p := range conns {
        close(p.Out)
        p.Conn.Close()
    }
    delete(h.Peers, uid)

    raw, err := json.Marshal(Signal{
        Kind: "user_status_change",
        Data: map[string]any{"user_id": uid, "status": false},
    })
    if err != nil {
        log.Printf("Error marshaling user status for %s on force disconnect: %v", uid, err)
        return
    }
    h.broadcast(raw, uid)
}

func (h *Hub) onMessage(senderID string, payload []byte) error {
    var in types.IncomingMessage

    if err := json.Unmarshal(payload, &in); err != nil {
        statusCode, errMsg := HandleError(types.NewActionError("Invalid request body"))
        h.sendError(senderID, statusCode, errMsg)
        return nil
    }

    if in.GroupId != nil {
        savedMsg, members, err := h.ChatService.ProcessGroupMessage(senderID, *in.GroupId, in)
        if err != nil {
            statusCode, errMsg := HandleError(err)
            h.sendError(senderID, statusCode, errMsg)
            return nil
        }

        raw, err := json.Marshal(Signal{
            Kind: "new_message",
            Data: savedMsg,
        })
        if err != nil {
            log.Printf("Hub.onMessage (Group Marshal): %v", err)
            return nil
        }

        for _, memberID := range members {
            h.sendToUser(memberID, raw)
        }
        return nil
    }

    savedMsg, err := h.ChatService.ProcessPrivateMessage(senderID, in)
    if err != nil {
        statusCode, errMsg := HandleError(err)
        h.sendError(senderID, statusCode, errMsg)
        return nil
    }

    raw, err := json.Marshal(Signal{
        Kind: "new_message",
        Data: savedMsg,
    })
    if err != nil {
        log.Printf("Hub.onMessage (Private Marshal): %v", err)
        return nil
    }

    canReceive, err := h.ChatService.CanReceiveLive(in.ReceiverID, senderID)
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
    raw, err := json.Marshal(map[string]any{
        "type":   "error",
        "status": status,
        "error":  errMsg,
    })
    if err == nil {
        h.sendToUser(userID, raw)
    }
}

func (h *Hub) broadcast(raw []byte, excludeUID string) {
    for id, conns := range h.Peers {
        if id != excludeUID {
            for p := range conns {
                select {
                case p.Out <- raw:
                default:
                }
            }
        }
    }
}

func (h *Hub) sendToUser(userID string, raw []byte) {
    for p := range h.Peers[userID] {
        select {
        case p.Out <- raw:
        default:
        }
    }
}

func (h *Hub) IsUserOnline(userID string) bool {
    replyChan := make(chan bool)
    h.Query <- StatusQuery{
        Uid:   userID,
        Reply: replyChan,
    }
    isOnline := <-replyChan
    close(replyChan)

    return isOnline
}

func (p *Peer) ReadPump() {
    defer func() {
        p.Conn.Close()
        p.Hub.Leave <- p
    }()

    for {
        _, data, err := p.Conn.ReadMessage()
        if err != nil {
            break
        }
        evt := Event{}
        if err := json.Unmarshal(data, &evt); err != nil {
            continue
        }
        evt.OwnerID = p.Uid
        p.Hub.Events <- evt
    }
}

func (p *Peer) WritePump() {
    defer func() {
        p.Mu.Lock()
        p.Conn.Close()
        p.Mu.Unlock()
    }()

    for data := range p.Out {
        p.Mu.Lock()
        err := p.Conn.WriteMessage(websocket.TextMessage, data)
        p.Mu.Unlock()
        if err != nil {
            log.Println("Hub.writePump:", err)
            break
        }
    }
}

func (h *Hub) PushNotification(receiverIDs []string, payload any) {
    h.Notify <- types.HubNotification{
        ReceiverIDs: receiverIDs,
        Payload:     payload,
    }
}