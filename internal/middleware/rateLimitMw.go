package middleware

import (
	"net/http"
	"soc-net/internal/utils"
	"sync"
	"time"
)

type Visitor struct {
	LastReq   time.Time
	ReqCredit int
}

type LimiterStore struct {
	Visitores map[string]*Visitor
	Mutx      sync.RWMutex

	MaxVisites      int
	RefillRate      int
	CleanupTickTime time.Duration
}

func NewLimiterStore() *LimiterStore {
	ls := &LimiterStore{
		Visitores:       make(map[string]*Visitor),
		Mutx:            sync.RWMutex{},
		MaxVisites:      60,
		RefillRate:      10,
		CleanupTickTime: 30 * time.Minute,
	}

	go ls.Cleanup()

	return ls
}

func (ls *LimiterStore) Cleanup() {
	ticker := time.NewTicker(ls.CleanupTickTime)
	defer ticker.Stop()

	for range ticker.C {
		ls.Mutx.Lock()
		for key, userReq := range ls.Visitores {
			lastReq := userReq.LastReq
			if time.Since(lastReq).Hours() >= 1 {
				delete(ls.Visitores, key)
			}
		}
		ls.Mutx.Unlock()
	}
}

func RateLimit(ls *LimiterStore, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		key := GetVisitorKey(r)

		if !ls.Allow(key) {
			utils.WriteJson(w, map[string]any{
				"status": http.StatusTooManyRequests,
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (ls *LimiterStore) Allow(key string) bool {
	ls.Mutx.Lock()
	defer ls.Mutx.Unlock()

	visitor, exists := ls.Visitores[key]
	if !exists {
		ls.Visitores[key] = &Visitor{
			LastReq:   time.Now(),
			ReqCredit: ls.MaxVisites,
		}
		return true
	}

	elapsed := time.Since(visitor.LastReq).Seconds()
	refillAmount := int(elapsed * float64(ls.RefillRate))

	visitor.ReqCredit += refillAmount

	if visitor.ReqCredit > ls.MaxVisites {
		visitor.ReqCredit = ls.MaxVisites
	}

	visitor.LastReq = time.Now()

	if visitor.ReqCredit <= 0 {
		return false
	}

	visitor.ReqCredit--

	return true
}

func GetVisitorKey(r *http.Request) string {
	key := r.RemoteAddr

	cookie, err := r.Cookie("sessionId")
	if err == nil {
		key = cookie.Value
	}

	return key
}
