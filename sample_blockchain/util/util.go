package main

import (
	"fmt"
	"log"

	"github.com/dgraph-io/badger"
)

// ReadFromBadger reads a value from BadgerDB by key
func ReadFromBadger(dbPath string, key string) {
	// Open the Badger database
	opts := badger.DefaultOptions(dbPath)
	db, err := badger.Open(opts)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Read the value for the given key
	err = db.View(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(key))
		if err != nil {
			if err == badger.ErrKeyNotFound {
				fmt.Printf("Key '%s' not found\n", key)
				return nil
			}
			return err
		}

		// Retrieve the value
		err = item.Value(func(val []byte) error {
			fmt.Printf("The value for '%s' is: %x\n", key, val) // Print as hex
			return nil
		})
		return err
	})

	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	// Specify the database path and key to read
	dbPath := "E:/CPE/Sandbox/GoBlockchain/project02/tmp/blocks"
	key := "lh" // Key for the last hash in the blockchain

	// Call the ReadFromBadger function
	ReadFromBadger(dbPath, key)
}
