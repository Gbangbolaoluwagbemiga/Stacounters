# Stacks Counter App

A simple counter smart contract built with Clarity for the Stacks blockchain.

## Features

- **Increment**: Increase the counter by 1
- **Decrement**: Decrease the counter by 1
- **Get Counter**: Read the current counter value
- **Reset**: Reset the counter to 0

## Prerequisites

1. **Install Clarinet** (Stacks development tool):
   ```bash
   # macOS
   brew install clarinet
   
   # Or using npm
   npm install -g @stacks/clarinet
   ```

2. **Install Deno** (for running tests):
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

## Project Structure

```
.
├── contracts/
│   └── counter.clar      # Main smart contract
├── tests/
│   └── counter_test.ts   # Contract tests
├── settings/
│   ├── Devnet.toml       # Local development network config
│   ├── Testnet.toml      # Testnet deployment config
│   └── Mainnet.toml      # Mainnet deployment config
├── Clarinet.toml         # Clarinet configuration
└── README.md
```

## Local Development

### 1. Start a local Stacks node

```bash
clarinet console
```

This starts a local REPL where you can interact with your contract.

### 2. Test the contract

```bash
clarinet test
```

This runs all tests in the `tests/` directory.

### 3. Interact with the contract in the console

Start the Clarinet console:
```bash
clarinet console
```

Once in the Clarinet console, you can call contract functions:

```clarity
;; Get the current counter value
(contract-call? .counter get-counter)

;; Increment the counter
(contract-call? .counter increment)

;; Decrement the counter
(contract-call? .counter decrement)

;; Reset the counter
(contract-call? .counter reset)
```

Or use the Clarinet REPL directly:
```bash
clarinet repl
```

## Deployment

### Deploy to Testnet

1. **Get a testnet wallet**:
   - Visit [Hiro Wallet](https://www.hiro.so/wallet) or [Xverse](https://www.xverse.app/)
   - Create a wallet and switch to Testnet

2. **Get testnet STX**:
   - Use the [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet)

3. **Deploy using Clarinet**:
   ```bash
   clarinet deploy --testnet
   ```

   Or use the Stacks CLI:
   ```bash
   stacks-cli deploy counter.clar --testnet
   ```

### Deploy to Mainnet

⚠️ **Warning**: Deploying to mainnet costs real STX tokens.

```bash
clarinet deploy --mainnet
```

Make sure you have sufficient STX to cover deployment fees.

## Contract Functions

### Public Functions

- `(increment)` - Increments the counter by 1, returns the new value
- `(decrement)` - Decrements the counter by 1, returns the new value
- `(reset)` - Resets the counter to 0, returns 0

### Read-Only Functions

- `(get-counter)` - Returns the current counter value

## Example Usage

```clarity
;; Initial state
(contract-call? .counter get-counter)  ;; Returns: (ok 0)

;; Increment
(contract-call? .counter increment)    ;; Returns: (ok 1)
(contract-call? .counter increment)    ;; Returns: (ok 2)

;; Decrement
(contract-call? .counter decrement)    ;; Returns: (ok 1)

;; Reset
(contract-call? .counter reset)        ;; Returns: (ok 0)
```

## Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/docs/clarity)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Stacks Explorer](https://explorer.stacks.co/)

## License

MIT

