---
title: Phát triển DApp trên Sui
description: Hướng dẫn xây dựng ứng dụng phi tập trung (DApp) trên Sui blockchain
---

# Phát triển DApp trên Sui

Phát triển DApp (Decentralized Application) trên Sui bao gồm hai phần chính: smart contracts được viết bằng Move và frontend sử dụng TypeScript SDK.

## Kiến trúc DApp

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │────│   Sui Network   │────│ Move Contracts  │
│   (React/Vue)   │    │   (Blockchain)  │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Thiết lập môi trường

### 1. Cài đặt dependencies

```bash
# Tạo project React
npx create-react-app sui-dapp --template typescript
cd sui-dapp

# Cài đặt Sui SDK
npm install @mysten/sui.js
npm install @mysten/dapp-kit
npm install @tanstack/react-query
```

### 2. Thiết lập wallet connection

```tsx
// App.tsx
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <div className="App">
            <WalletConnection />
            <GameInterface />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

### 3. Component kết nối ví

```tsx
// components/WalletConnection.tsx
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export function WalletConnection() {
  const currentAccount = useCurrentAccount();

  return (
    <div>
      <ConnectButton />
      {currentAccount && (
        <div>
          <p>Địa chỉ: {currentAccount.address}</p>
        </div>
      )}
    </div>
  );
}
```

## Ví dụ: Game DApp

### 1. Smart Contract (Move)

```move
// sources/game.move
module game::rock_paper_scissors {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // Game states
    const ROCK: u8 = 1;
    const PAPER: u8 = 2;
    const SCISSORS: u8 = 3;

    // Errors
    const EInvalidMove: u64 = 1;
    const EGameNotFinished: u64 = 2;

    public struct Game has key {
        id: UID,
        player1: address,
        player2: Option<address>,
        player1_move: Option<u8>,
        player2_move: Option<u8>,
        stake: u64,
        winner: Option<address>,
    }

    public struct GameCreated has copy, drop {
        game_id: ID,
        creator: address,
        stake: u64,
    }

    public struct GameFinished has copy, drop {
        game_id: ID,
        winner: Option<address>,
        player1_move: u8,
        player2_move: u8,
    }

    public entry fun create_game(
        stake: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let game_id = object::new(ctx);
        let id_copy = object::uid_to_inner(&game_id);
        
        let game = Game {
            id: game_id,
            player1: tx_context::sender(ctx),
            player2: option::none(),
            player1_move: option::none(),
            player2_move: option::none(),
            stake: coin::value(&stake),
            winner: option::none(),
        };

        event::emit(GameCreated {
            game_id: id_copy,
            creator: tx_context::sender(ctx),
            stake: coin::value(&stake),
        });

        transfer::transfer(stake, @game);
        transfer::share_object(game);
    }

    public entry fun join_game(
        game: &mut Game,
        stake: Coin<SUI>,
        ctx: &TxContext
    ) {
        assert!(option::is_none(&game.player2), EGameNotFinished);
        assert!(coin::value(&stake) == game.stake, EInvalidMove);
        
        game.player2 = option::some(tx_context::sender(ctx));
        transfer::transfer(stake, @game);
    }

    public entry fun make_move(
        game: &mut Game,
        player_move: u8,
        ctx: &TxContext
    ) {
        assert!(player_move >= 1 && player_move <= 3, EInvalidMove);
        
        let sender = tx_context::sender(ctx);
        
        if (sender == game.player1) {
            game.player1_move = option::some(player_move);
        } else if (option::contains(&game.player2, &sender)) {
            game.player2_move = option::some(player_move);
        };

        // Check if both players made moves
        if (option::is_some(&game.player1_move) && 
            option::is_some(&game.player2_move)) {
            determine_winner(game);
        }
    }

    fun determine_winner(game: &mut Game) {
        let move1 = *option::borrow(&game.player1_move);
        let move2 = *option::borrow(&game.player2_move);
        
        let winner = if (move1 == move2) {
            option::none() // Tie
        } else if (
            (move1 == ROCK && move2 == SCISSORS) ||
            (move1 == PAPER && move2 == ROCK) ||
            (move1 == SCISSORS && move2 == PAPER)
        ) {
            option::some(game.player1)
        } else {
            game.player2
        };

        game.winner = winner;

        event::emit(GameFinished {
            game_id: object::uid_to_inner(&game.id),
            winner,
            player1_move: move1,
            player2_move: move2,
        });
    }
}
```

### 2. Frontend Integration

```tsx
// hooks/useGame.ts
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useQuery, useMutation } from '@tanstack/react-query';

const PACKAGE_ID = "0x..."; // Your deployed package ID

export function useCreateGame() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async (stake: number) => {
      if (!currentAccount) throw new Error('Wallet not connected');

      const txb = new TransactionBlock();
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(stake)]);
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rock_paper_scissors::create_game`,
        arguments: [coin],
      });

      return suiClient.signAndExecuteTransactionBlock({
        signer: currentAccount,
        transactionBlock: txb,
      });
    },
  });
}

export function useJoinGame() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({ gameId, stake }: { gameId: string; stake: number }) => {
      if (!currentAccount) throw new Error('Wallet not connected');

      const txb = new TransactionBlock();
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(stake)]);
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rock_paper_scissors::join_game`,
        arguments: [txb.object(gameId), coin],
      });

      return suiClient.signAndExecuteTransactionBlock({
        signer: currentAccount,
        transactionBlock: txb,
      });
    },
  });
}

export function useMakeMove() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({ gameId, move }: { gameId: string; move: number }) => {
      if (!currentAccount) throw new Error('Wallet not connected');

      const txb = new TransactionBlock();
      
      txb.moveCall({
        target: `${PACKAGE_ID}::rock_paper_scissors::make_move`,
        arguments: [txb.object(gameId), txb.pure(move)],
      });

      return suiClient.signAndExecuteTransactionBlock({
        signer: currentAccount,
        transactionBlock: txb,
      });
    },
  });
}
```

### 3. Game Interface Component

```tsx
// components/GameInterface.tsx
import React, { useState } from 'react';
import { useCreateGame, useJoinGame, useMakeMove } from '../hooks/useGame';

export function GameInterface() {
  const [gameId, setGameId] = useState('');
  const [stake, setStake] = useState(1000000000); // 1 SUI

  const createGame = useCreateGame();
  const joinGame = useJoinGame();
  const makeMove = useMakeMove();

  const handleCreateGame = async () => {
    try {
      const result = await createGame.mutateAsync(stake);
      console.log('Game created:', result);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleJoinGame = async () => {
    try {
      const result = await joinGame.mutateAsync({ gameId, stake });
      console.log('Joined game:', result);
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleMove = async (move: number) => {
    try {
      const result = await makeMove.mutateAsync({ gameId, move });
      console.log('Move made:', result);
    } catch (error) {
      console.error('Error making move:', error);
    }
  };

  return (
    <div className="game-interface">
      <h2>Rock Paper Scissors</h2>
      
      <div className="create-game">
        <h3>Tạo game mới</h3>
        <input
          type="number"
          value={stake}
          onChange={(e) => setStake(Number(e.target.value))}
          placeholder="Stake amount"
        />
        <button onClick={handleCreateGame} disabled={createGame.isPending}>
          {createGame.isPending ? 'Creating...' : 'Create Game'}
        </button>
      </div>

      <div className="join-game">
        <h3>Tham gia game</h3>
        <input
          type="text"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          placeholder="Game ID"
        />
        <button onClick={handleJoinGame} disabled={joinGame.isPending}>
          {joinGame.isPending ? 'Joining...' : 'Join Game'}
        </button>
      </div>

      <div className="make-move">
        <h3>Chọn nước đi</h3>
        <button onClick={() => handleMove(1)}>🪨 Rock</button>
        <button onClick={() => handleMove(2)}>📄 Paper</button>
        <button onClick={() => handleMove(3)}>✂️ Scissors</button>
      </div>
    </div>
  );
}
```

## Event Listening

```tsx
// hooks/useGameEvents.ts
import { useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

export function useGameEvents() {
  const suiClient = useSuiClient();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const subscription = suiClient.subscribeEvent({
      filter: {
        Package: PACKAGE_ID,
      },
      onMessage: (event) => {
        setEvents(prev => [...prev, event]);
      },
    });

    return () => {
      subscription.then(unsub => unsub());
    };
  }, [suiClient]);

  return events;
}
```

## Deployment

### 1. Deploy Smart Contract

```bash
sui client publish --gas-budget 20000000
```

### 2. Build Frontend

```bash
npm run build
```

### 3. Deploy to hosting service

```bash
# Example with Vercel
npm install -g vercel
vercel --prod
```

## Best Practices

1. **Error Handling**: Luôn xử lý lỗi từ blockchain
2. **Loading States**: Hiển thị trạng thái loading cho user
3. **Transaction Confirmation**: Đợi transaction được confirm
4. **Gas Optimization**: Tối ưu hóa gas fees
5. **Security**: Validate tất cả inputs
6. **User Experience**: Cung cấp feedback rõ ràng

## Testing

```tsx
// __tests__/Game.test.tsx
import { render, screen } from '@testing-library/react';
import { GameInterface } from '../components/GameInterface';

test('renders game interface', () => {
  render(<GameInterface />);
  expect(screen.getByText('Rock Paper Scissors')).toBeInTheDocument();
});
```

Phát triển DApp trên Sui mang lại trải nghiệm mượt mà với tốc độ giao dịch nhanh và chi phí thấp. Hãy bắt đầu với các ví dụ đơn giản và dần dần xây dựng các ứng dụng phức tạp hơn! 