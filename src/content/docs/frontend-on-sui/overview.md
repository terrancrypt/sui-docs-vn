---
title: Tổng quan Frontend trên Sui
description: Hướng dẫn phát triển ứng dụng frontend tương tác với Sui blockchain
---

# Tổng quan Frontend trên Sui

Phát triển frontend trên Sui mang đến trải nghiệm mượt mà với các công cụ mạnh mẽ, SDK phong phú và hiệu suất cao. Sui cung cấp một ecosystem hoàn chỉnh để xây dựng các ứng dụng Web3 hiện đại.

## Tại sao chọn Sui cho Frontend?

### ⚡ Hiệu suất vượt trội
- **Giao dịch nhanh**: Xác nhận trong ~1 giây
- **Throughput cao**: Xử lý song song transactions
- **Gas fees thấp**: Chi phí giao dịch tối thiểu
- **Sponsored transactions**: Người khác có thể trả gas

### 🛠️ Developer Experience
- **Rich SDKs**: TypeScript, Rust, Python
- **Modern tooling**: React hooks, Vue composables
- **Comprehensive docs**: Hướng dẫn chi tiết
- **Active community**: Hỗ trợ từ cộng đồng

### 🔗 Tích hợp dễ dàng
- **Wallet integration**: Hỗ trợ nhiều loại ví
- **GraphQL API**: Query dữ liệu linh hoạt
- **Real-time events**: WebSocket subscriptions
- **Mobile-friendly**: SDK cho React Native

## Ecosystem Overview

### Core Libraries

#### 1. @mysten/sui.js
```bash
npm install @mysten/sui.js
```
- **SuiClient**: Tương tác với Sui RPC
- **Transaction building**: Tạo và ký transactions
- **Keypair management**: Quản lý keys và addresses
- **Utility functions**: Helper functions

#### 2. @mysten/dapp-kit
```bash
npm install @mysten/dapp-kit
```
- **Wallet connection**: Connect/disconnect wallets
- **React hooks**: useCurrentAccount, useBalance
- **Transaction execution**: signAndExecuteTransactionBlock
- **Network management**: Multi-network support

#### 3. @mysten/zklogin
```bash
npm install @mysten/zklogin
```
- **Social login**: Google, Facebook, Apple
- **Zero-knowledge proofs**: Privacy-preserving auth
- **Seamless UX**: Web2-like experience
- **No seed phrases**: User-friendly onboarding

## Frontend Architecture Patterns

### 1. Traditional Web3 DApp
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│  Wallet (Sui)   │────│  Sui Network    │
│                 │    │                 │    │                 │
│ • Components    │    │ • Private keys  │    │ • Smart         │
│ • State mgmt    │    │ • Sign txs      │    │   contracts     │
│ • UI/UX         │    │ • Store assets  │    │ • Objects       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. zkLogin DApp
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│  OAuth Provider │────│  Sui Network    │
│                 │    │  (Google/etc)   │    │                 │
│ • Social login  │    │ • JWT tokens    │    │ • ZK proofs     │
│ • No wallet UI  │    │ • User identity │    │ • Gasless txs   │
│ • Web2 UX       │    │ • Familiar flow │    │ • Objects       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3. Hybrid Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│    Sui SDK      │────│  Sui + Walrus   │
│                 │    │                 │    │                 │
│ • SSR/SSG       │    │ • Client/Server │    │ • Smart         │
│ • API routes    │    │ • Caching       │    │   contracts     │
│ • Walrus Sites  │    │ • Indexer       │    │ • File storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Wallet Integration

### Supported Wallets
- **Sui Wallet**: Official browser extension
- **Martian Wallet**: Multi-chain wallet
- **Suiet Wallet**: Community wallet
- **Ethos Wallet**: Mobile-first wallet
- **Nightly Wallet**: Developer-friendly

### Connection Flow
```typescript
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

function WalletConnection() {
  const currentAccount = useCurrentAccount();

  return (
    <div>
      <ConnectButton />
      {currentAccount && (
        <div>
          <p>Connected: {currentAccount.address}</p>
          <p>Chains: {currentAccount.chains}</p>
        </div>
      )}
    </div>
  );
}
```

## State Management Patterns

### 1. React Query + Sui Hooks
```typescript
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

function UserBalance() {
  const currentAccount = useCurrentAccount();
  
  const { data: balance, isLoading } = useSuiClientQuery(
    'getBalance',
    { owner: currentAccount?.address ?? '' },
    { enabled: !!currentAccount }
  );

  if (isLoading) return <div>Loading...</div>;
  
  return <div>Balance: {balance?.totalBalance} SUI</div>;
}
```

### 2. Zustand Store
```typescript
import { create } from 'zustand';

interface GameState {
  currentGame: Game | null;
  playerStats: PlayerStats;
  setCurrentGame: (game: Game) => void;
  updateStats: (stats: PlayerStats) => void;
}

const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  playerStats: { wins: 0, losses: 0 },
  setCurrentGame: (game) => set({ currentGame: game }),
  updateStats: (stats) => set({ playerStats: stats }),
}));
```

### 3. Redux Toolkit
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUserObjects = createAsyncThunk(
  'user/fetchObjects',
  async (address: string, { getState }) => {
    const client = new SuiClient({ url: getFullnodeUrl('testnet') });
    const objects = await client.getOwnedObjects({ owner: address });
    return objects.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { objects: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserObjects.fulfilled, (state, action) => {
      state.objects = action.payload;
      state.loading = false;
    });
  },
});
```

## UI Component Libraries

### 1. Sui dApp Kit Components
```typescript
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
} from '@mysten/dapp-kit';

// Pre-built components với Sui branding
<ConnectButton />
<AccountDropdown />
<NetworkSelector />
```

### 2. Custom Components với Headless UI
```typescript
import { Dialog } from '@headlessui/react';

function TransactionModal({ isOpen, onClose, transaction }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Panel>
        <Dialog.Title>Confirm Transaction</Dialog.Title>
        <TransactionPreview transaction={transaction} />
        <button onClick={handleConfirm}>Sign & Execute</button>
      </Dialog.Panel>
    </Dialog>
  );
}
```

### 3. Styling Solutions
```typescript
// Tailwind CSS
<div className="bg-blue-500 text-white p-4 rounded-lg">
  <h2 className="text-xl font-bold">My NFT</h2>
</div>

// Styled Components
const StyledCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  border-radius: 0.5rem;
  color: white;
`;

// CSS Modules
<div className={styles.nftCard}>
  <img src={nft.imageUrl} className={styles.nftImage} />
</div>
```

## Performance Optimization

### 1. Caching Strategies
```typescript
// React Query với stale time
const { data } = useSuiClientQuery(
  'getObject',
  { id: objectId },
  { 
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);

// SWR với revalidation
const { data } = useSWR(
  ['objects', address],
  () => fetchUserObjects(address),
  { revalidateOnFocus: false }
);
```

### 2. Code Splitting
```typescript
// Route-based splitting
const GamePage = lazy(() => import('./pages/GamePage'));
const NFTPage = lazy(() => import('./pages/NFTPage'));

// Component-based splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));
```

### 3. Bundle Optimization
```javascript
// Webpack bundle analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};

// Tree shaking
import { SuiClient } from '@mysten/sui.js/client';
// Instead of: import * as Sui from '@mysten/sui.js';
```

## Testing Strategies

### 1. Unit Testing
```typescript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import UserBalance from './UserBalance';

vi.mock('@mysten/dapp-kit', () => ({
  useCurrentAccount: () => ({ address: '0x123...' }),
  useSuiClientQuery: () => ({ 
    data: { totalBalance: '1000000000' },
    isLoading: false 
  }),
}));

test('displays user balance', () => {
  render(<UserBalance />);
  expect(screen.getByText('Balance: 1000000000 SUI')).toBeInTheDocument();
});
```

### 2. Integration Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGameLogic } from './useGameLogic';

test('game logic works correctly', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useGameLogic(), { wrapper });

  await waitFor(() => {
    expect(result.current.gameState).toBe('initialized');
  });
});
```

### 3. E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('user can connect wallet and play game', async ({ page }) => {
  await page.goto('/game');
  
  // Connect wallet
  await page.click('[data-testid="connect-wallet"]');
  await page.click('[data-testid="sui-wallet"]');
  
  // Start game
  await page.click('[data-testid="start-game"]');
  
  // Verify game started
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
});
```

## Deployment Options

### 1. Traditional Hosting
- **Vercel**: Optimal for Next.js apps
- **Netlify**: Great for static sites
- **AWS S3 + CloudFront**: Custom setup
- **GitHub Pages**: Free for open source

### 2. Walrus Sites
```bash
# Deploy completely on Sui + Walrus
walrus-sites publish ./dist

# Access via: https://blobid.walrus.site
```

### 3. IPFS + ENS
```bash
# Upload to IPFS
ipfs add -r ./dist

# Set ENS record
# myapp.eth → ipfs://QmHash...
```

## Best Practices

### 1. User Experience
- **Progressive loading**: Show skeleton states
- **Error boundaries**: Graceful error handling  
- **Offline support**: Cache critical data
- **Mobile responsive**: Touch-friendly design

### 2. Security
- **Input validation**: Sanitize all inputs
- **Transaction preview**: Show what user is signing
- **Rate limiting**: Prevent spam
- **Secure storage**: Don't store sensitive data

### 3. Performance
- **Lazy loading**: Load components on demand
- **Image optimization**: WebP, lazy loading
- **Bundle splitting**: Reduce initial load
- **CDN usage**: Serve assets globally

## Tài nguyên học tập

### Chính thức
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [Sui Examples](https://github.com/MystenLabs/sui/tree/main/examples)

### Templates
- [Create Sui dApp](https://github.com/MystenLabs/create-sui-dapp)
- [Sui dApp Starter](https://github.com/MystenLabs/sui-dapp-starter)
- [Next.js Sui Template](https://github.com/MystenLabs/sui-next-template)

Frontend development trên Sui mang đến những khả năng mới cho Web3, kết hợp hiệu suất cao với trải nghiệm người dùng tuyệt vời! 