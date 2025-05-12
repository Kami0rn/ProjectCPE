// filepath: c:\ProjectCPE\next-frontend\src\types\blockchain.ts
export interface Transaction {
    sender: string;
    receiver: string;
    amount: number;
    image_hash: string;
  }
  
  export interface Block {
    index: number;
    timestamp: string;
    transactions: Transaction[] | null;
    prev_hash: string;
    hash: string;
    proof: string;
  }