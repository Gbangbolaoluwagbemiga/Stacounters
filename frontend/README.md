# Stacks Counter Frontend

A React frontend application for interacting with the Stacks Counter smart contract.

## Features

- 🔗 Connect with Hiro Wallet or Xverse
- ➕ Increment counter
- ➖ Decrement counter
- 🔄 Reset counter
- 📊 View current counter value

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure contract address**:
   - Open `src/App.jsx`
   - Update `CONTRACT_ADDRESS` with your deployed contract address
   - Update `NETWORK` to `StacksMainnet()` or `StacksTestnet()` as needed

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Configuration

### Contract Address

Update the contract address in `src/App.jsx`:

```javascript
const CONTRACT_ADDRESS = 'SP2QNSNKR3NRDWNTX0Q7R4T8WGBJ8RE8RA516AKZP' // Your address
const CONTRACT_NAME = 'counter'
const NETWORK = new StacksMainnet() // or StacksTestnet()
```

## Usage

1. Open the app in your browser
2. Click "Connect Wallet" to connect with Hiro Wallet or Xverse
3. Use the buttons to interact with the counter contract:
   - **Increment**: Increases counter by 1
   - **Decrement**: Decreases counter by 1
   - **Reset**: Resets counter to 0
4. Confirm transactions in your wallet
5. The counter value will update automatically after transactions

## Technologies

- **React** - UI framework
- **Vite** - Build tool
- **@stacks/connect** - Wallet connection
- **@stacks/transactions** - Contract interactions

## Troubleshooting

- Make sure your wallet is connected
- Ensure you have sufficient STX for transaction fees
- Check that the contract address is correct
- Verify you're on the correct network (mainnet/testnet)

