package blockchain

import "github.com/dgraph-io/badger"

func (chain *BlockChain) Iterator() *BlockChainIterator {
	iter := &BlockChainIterator{chain.LastHash, chain.Database}

	return iter
}

func (iter *BlockChainIterator) Next() *Block {
	var block *Block
	err := iter.Database.View(func(txn *badger.Txn) error {
		item, err := txn.Get(iter.CurrentHash)
		if err != nil {
			return err
		}
		return item.Value(func(val []byte) error {
			block = Deserialize(val)
			return nil
		})
	})
	Handle(err)

	iter.CurrentHash = block.PrevHash

	return block
}