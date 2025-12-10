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

#### Option 1: Using Deployment Script (Recommended)

1. **Set up your environment variables**:
   ```bash
   # The .env file is already created, just fill in your secret key
   # Edit .env and add your mainnet secret key:
   DEPLOYER_SECRET_KEY=your_64_character_hex_secret_key_here
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy-mainnet.sh
   ```

   The script will:
   - Validate your configuration
   - Check contract syntax
   - Generate deployment plan
   - Deploy to mainnet

#### Option 2: Manual Deployment

1. **Add your secret key to `settings/Mainnet.toml`**:
   ```toml
   [accounts.deployer]
   secret_key = "your_64_character_hex_secret_key_here"
   ```

2. **Generate and apply deployment**:
   ```bash
   clarinet deployments generate --mainnet
   clarinet deployments apply --mainnet
   ```

**Important Notes**:
- Your secret key should be 64 hexadecimal characters (without 0x prefix)
- Make sure you have sufficient STX in your wallet to cover deployment fees (~0.006 STX)
- Never commit your `.env` file or secret keys to version control
- The `.env` file is already in `.gitignore` for your safety

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

