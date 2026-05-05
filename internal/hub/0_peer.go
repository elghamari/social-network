package hub

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Peer struct {
	uid  string
	conn *websocket.Conn
	out  chan []byte
	hub  *Hub
	mu   sync.Mutex
}

func NewPeer(uid string, conn *websocket.Conn, h *Hub) *Peer {
	return &Peer{
		uid:  uid,
		conn: conn,
		out:  make(chan []byte, 256),
		hub:  h,
	}
}

func (p *Peer) ReadPump() {
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

func (p *Peer) WritePump() {
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
			log.Println("Peer.writePump:", err)
			break
		}
	}
}
