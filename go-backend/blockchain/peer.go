package blockchain

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
)

var peers = []string{} // List of peer nodes
var peersMutex = &sync.Mutex{}

func IsChainValid(chain []Block) bool {
	for i := 1; i < len(chain); i++ {
		if !IsBlockValid(chain[i], chain[i-1]) {
			return false
		}
	}
	return true
}

// AddPeer adds a new peer to the list
func AddPeer(peer string) {
	peersMutex.Lock()
	defer peersMutex.Unlock()

	// Validate the peer URL
	if _, err := url.ParseRequestURI(peer); err != nil {
		return // Invalid URL, do not add
	}

	for _, p := range peers {
		if p == peer {
			return // Peer already exists
		}
	}
	peers = append(peers, peer)
}

// GetPeers returns the list of peers
func GetPeers() []string {
	peersMutex.Lock()
	defer peersMutex.Unlock()
	return peers
}

// BroadcastBlock sends the new block to all peers
func BroadcastBlock(block Block) {
	peersMutex.Lock()
	defer peersMutex.Unlock()

	for _, peer := range peers {
		go func(peer string) {
			data, _ := json.Marshal(block)
			log.Printf("Broadcasting block to peer: %s", peer) // Add this log
			resp, err := http.Post("http://"+peer+"/api/receive-block", "application/json", strings.NewReader(string(data)))
			if err != nil {
				log.Printf("Failed to send block to peer %s: %v", peer, err)
				return
			}
			defer resp.Body.Close()
		}(peer)
	}
}
