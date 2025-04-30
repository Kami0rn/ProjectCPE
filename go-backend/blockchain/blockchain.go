package blockchain

import "time"

var Blockchain []Block

func InitGenesisBlock() Block {
	genesis := Block{
		Index:        0,
		Timestamp:    time.Now(),
		Transactions: nil,
		PrevHash:     "0",
		Hash:         "genesis_hash",
		Proof:        "GENESIS",
	}
	Blockchain = append(Blockchain, genesis)
	return genesis
}

func AddBlock(newBlock Block) {
	Blockchain = append(Blockchain, newBlock)
}

func GenerateBlock(prevBlock Block, transactions []Transaction, proof string) Block {
	newBlock := Block{
		Index:        prevBlock.Index + 1,
		Timestamp:    time.Now(),
		Transactions: transactions,
		PrevHash:     prevBlock.Hash,
		Proof:        proof,
	}

	newBlock.Hash = CalculateHash(newBlock)
	return newBlock
}
