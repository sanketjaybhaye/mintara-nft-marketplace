<div align="center">
  <img src="client/src/assets/Logo.svg" alt="Mintara Logo" width="300" />
</div>

<h1 align="center">Mintara NFT Marketplace</h1>

<p align="center">
  <b>A state-of-the-art decentralized platform for discovering, creating, and trading irreplaceable digital assets on the Ethereum blockchain.</b>
</p>

## ✨ Features

- **Mint NFTs**: Upload your digital art and mint it securely as an ERC-721 token on the blockchain.
- **Buy, Sell & Bid**: List your NFTs on the marketplace, set your price, and execute trades safely via robust smart contracts.
- **Wallet Integration**: Native integration with Web3 wallets like MetaMask for seamless and frictionless transactions.
- **Beautiful UI**: A highly responsive, glassmorphism-inspired design with perfect Light & Dark mode support.
- **Track Activity**: Built-in tracking for sales, minting, and activity logs.

---

## 🛠️ Technology Stack

**Frontend**
- React.js + React Router
- Material-UI (styled with custom themes and custom typography)
- Redux for global state
- Web3.js / Ethers.js integration

**Backend & Storage**
- Node.js & Express
- IPFS (InterPlanetary File System) for decentralized metadata

**Blockchain & Smart Contracts**
- Solidity (Ethereum)
- Truffle Suite & OpenZeppelin Contracts
- Local Net: Ganache CLI

---

## 🚀 Getting Started

Follow these instructions to set up **Mintara** locally for development and testing.

### Prerequisites

Make sure you have the following software installed:
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [Truffle](https://trufflesuite.com/): `npm install -g truffle`
- [Ganache CLI](https://github.com/trufflesuite/ganache-cli): `npm install -g ganache-cli`
- [MetaMask](https://metamask.io/) browser extension

### 1. Start the Local Blockchain

Open your **first terminal** and start the local Ganache network using the predefined testing mnemonic:
```bash
ganache-cli --port 8545 --gasLimit 12000000 --networkId 1337 --db ".ganache-data" --mnemonic "into sphere siege maple peanut nice elegant trophy lawsuit floor track battle"
```
> *Tip: Import this mnemonic phrase into MetaMask to access the generated test accounts (which are preloaded with fake ETH).*

### 2. Compile & Deploy Smart Contracts

Open a **second terminal** in the root directory. Install the dependencies and migrate the contracts:
```bash
npm install
truffle compile
truffle migrate --reset
```

### 3. Start the Backend Server

Using that same second terminal (or a new one), navigate to the backend directory:
```bash
cd backend
npm install
node server.js
```

### 4. Start the Frontend Client

Open a **third terminal**, navigate to the client folder, and start the React application:
```bash
cd client
npm install
npm start
```
*The app should now be running at [http://localhost:3000](http://localhost:3000).*

### 5. Configure MetaMask Network

To connect your browser to your local Ganache network, configure it as follows:
- **Network Name**: Localhost 8545
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `1337`
- **Currency Symbol**: `ETH`

---

## 📄 License

This project is licensed under the MIT License. Feel free to fork, expand upon, and use this codebase as a learning resource or robust starting template for your Web3 initiatives.
