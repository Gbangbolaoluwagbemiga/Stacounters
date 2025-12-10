import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';

Clarinet.test({
  name: "Counter can be incremented",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('counter', 'increment', [], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectInt(1);
    
    // Increment again
    block = chain.mineBlock([
      Tx.contractCall('counter', 'increment', [], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectInt(2);
  },
});

Clarinet.test({
  name: "Counter can be decremented",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Increment first
    chain.mineBlock([
      Tx.contractCall('counter', 'increment', [], deployer.address),
      Tx.contractCall('counter', 'increment', [], deployer.address)
    ]);
    
    // Then decrement
    let block = chain.mineBlock([
      Tx.contractCall('counter', 'decrement', [], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectInt(1);
  },
});

Clarinet.test({
  name: "Counter can be read",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Increment a few times
    chain.mineBlock([
      Tx.contractCall('counter', 'increment', [], deployer.address),
      Tx.contractCall('counter', 'increment', [], deployer.address),
      Tx.contractCall('counter', 'increment', [], deployer.address)
    ]);
    
    // Read the counter
    let block = chain.mineBlock([
      Tx.contractCall('counter', 'get-counter', [], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectInt(3);
  },
});

Clarinet.test({
  name: "Counter can be reset",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Increment a few times
    chain.mineBlock([
      Tx.contractCall('counter', 'increment', [], deployer.address),
      Tx.contractCall('counter', 'increment', [], deployer.address)
    ]);
    
    // Reset
    let block = chain.mineBlock([
      Tx.contractCall('counter', 'reset', [], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectInt(0);
    
    // Verify it's reset
    block = chain.mineBlock([
      Tx.contractCall('counter', 'get-counter', [], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectInt(0);
  },
});


