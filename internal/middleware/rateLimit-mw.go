package middleware

import (
	"net"
	"net/http"
	"soc-net/internal/utils"
	"sync"
	"time"
)

type Visitor struct {
	LastRefill time.Time
	Credits    int
}

type LimiterStore struct {
	Visitors map[string]*Visitor

	Mutex       sync.Mutex
	MaxVisits   int
	RefillRate  int
	CleanupTick time.Duration
}

func NewLimiterStore() *LimiterStore {
	ls := &LimiterStore{
		Visitors:    make(map[string]*Visitor),
		MaxVisits:   60,
		RefillRate:  10,
		CleanupTick: 30 * time.Minute,
	}

	go ls.cleanup()

	return ls
}

func (ls *LimiterStore) cleanup() {
	ticker := time.NewTicker(ls.CleanupTick)
	defer ticker.Stop()

	for range ticker.C {
		ls.Mutex.Lock()
		for key, visitor := range ls.Visitors {
			if time.Since(visitor.LastRefill).Hours() >= 1 {
				delete(ls.Visitors, key)
			}
		}
		ls.Mutex.Unlock()
	}
}

func (ls *LimiterStore) allow(key string) bool {
	ls.Mutex.Lock()
	defer ls.Mutex.Unlock()

	now := time.Now()

	visitor, exists := ls.Visitors[key]
	if !exists {
		ls.Visitors[key] = &Visitor{
			LastRefill: now,
			Credits:    ls.MaxVisits,
		}
		return true
	}

	elapsed := time.Since(visitor.LastRefill).Seconds()
	refill := int(elapsed * float64(ls.RefillRate))

	if refill > 0 {
		visitor.Credits += refill

		if visitor.Credits > ls.MaxVisits {
			visitor.Credits = ls.MaxVisits
		}

		visitor.LastRefill = now
	}

	if visitor.Credits <= 0 {
		return false
	}

	visitor.Credits--

	return true
}

func getVisitorKey(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = r.RemoteAddr
	}

	cookie, err := r.Cookie("sessionId")
	if err == nil {
		return cookie.Value
	}

	return host
}

func RateLimit(ls *LimiterStore, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		key := getVisitorKey(r)

		if !ls.allow(key) {
			utils.WriteJson(w, http.StatusTooManyRequests, map[string]any{
				"error": "too many requests",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}
