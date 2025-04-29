package main

import (
	"os"

	"github.com/Kami0rn/golang-blockchain/cli"
	"github.com/Kami0rn/golang-blockchain/wallet" // Explicitly import wallet
)

func main() {
	// Ensure the wallet package is initialized
	_ = wallet.MakeWallet() // Dummy call to ensure the package is loaded

	defer os.Exit(0)
	cli := cli.CommandLine{}
	cli.Run()
}
