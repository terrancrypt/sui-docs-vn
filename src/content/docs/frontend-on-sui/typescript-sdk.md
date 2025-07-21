---
title: Sui TypeScript SDK
description: Hướng dẫn sử dụng Sui TypeScript SDK để tương tác với Sui blockchain
---

Sui TypeScript SDK cung cấp các công cụ mạnh mẽ để tương tác với Sui blockchain từ các ứng dụng JavaScript/TypeScript.

## Cài đặt

```bash
npm install @mysten/sui.js
# Hoặc
yarn add @mysten/sui.js
```

## Khởi tạo Client

### SuiClient

```typescript
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

// Kết nối đến các mạng khác nhau
const client = new SuiClient({
  url: getFullnodeUrl('testnet'), // 'mainnet', 'testnet', 'devnet', 'localnet'
});

// Hoặc custom RPC endpoint
const customClient = new SuiClient({
  url: 'https://your-custom-rpc-endpoint.com',
});
```

### Kiểm tra kết nối

```typescript
async function checkConnection() {
  try {
    const chainId = await client.getChainIdentifier();
    console.log('Connected to chain:', chainId);
    
    const latestCheckpoint = await client.getLatestCheckpointSequenceNumber();
    console.log('Latest checkpoint:', latestCheckpoint);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

## Quản lý Keypairs và Addresses

### Tạo Keypair

```typescript
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui.js/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui.js/keypairs/secp256r1';

// Ed25519 (recommended)
const keypair = new Ed25519Keypair();

// Secp256k1
const secp256k1Keypair = new Secp256k1Keypair();

// Secp256r1
const secp256r1Keypair = new Secp256r1Keypair();

console.log('Address:', keypair.getPublicKey().toSuiAddress());
console.log('Private key:', keypair.getSecretKey());
```

### Import từ private key

```typescript
const privateKeyBytes = new Uint8Array([/* your private key bytes */]);
const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

// Hoặc từ base64
const privateKeyBase64 = 'your-private-key-base64';
const keypairFromBase64 = Ed25519Keypair.fromSecretKey(privateKeyBase64);
```

### Tạo từ mnemonic

```typescript
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { mnemonicToSeedHex } from '@mysten/sui.js/cryptography';

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const seedHex = mnemonicToSeedHex(mnemonic);
const keypair = Ed25519Keypair.deriveKeypair(seedHex);
```

## Làm việc với Objects

### Lấy Objects của address

```typescript
async function getOwnedObjects(address: string) {
  const objects = await client.getOwnedObjects({
    owner: address,
    options: {
      showType: true,
      showContent: true,
      showOwner: true,
    },
  });
  
  console.log('Owned objects:', objects.data);
  return objects.data;
}
```

### Lấy thông tin chi tiết Object

```typescript
async function getObjectDetails(objectId: string) {
  const object = await client.getObject({
    id: objectId,
    options: {
      showType: true,
      showContent: true,
      showOwner: true,
      showPreviousTransaction: true,
    },
  });
  
  console.log('Object details:', object);
  return object;
}
```

### Lọc Objects theo type

```typescript
async function getObjectsByType(address: string, objectType: string) {
  const objects = await client.getOwnedObjects({
    owner: address,
    filter: {
      StructType: objectType,
    },
    options: {
      showType: true,
      showContent: true,
    },
  });
  
  return objects.data;
}

// Ví dụ: Lấy tất cả Coin objects
const coins = await getObjectsByType(address, '0x2::coin::Coin<0x2::sui::SUI>');
```

## Giao dịch (Transactions)

### Transaction Block cơ bản

```typescript
import { TransactionBlock } from '@mysten/sui.js/transactions';

async function transferSui(
  senderKeypair: Ed25519Keypair,
  recipientAddress: string,
  amount: number
) {
  const txb = new TransactionBlock();
  
  // Tạo coin với số lượng cụ thể
  const [coin] = txb.splitCoins(txb.gas, [txb.pure(amount)]);
  
  // Transfer coin
  txb.transferObjects([coin], txb.pure(recipientAddress));
  
  // Thực hiện giao dịch
  const result = await client.signAndExecuteTransactionBlock({
    signer: senderKeypair,
    transactionBlock: txb,
    options: {
      showEffects: true,
      showEvents: true,
    },
  });
  
  console.log('Transaction result:', result);
  return result;
}
```

### Gọi Move function

```typescript
async function callMoveFunction(
  senderKeypair: Ed25519Keypair,
  packageId: string,
  moduleName: string,
  functionName: string,
  args: any[]
) {
  const txb = new TransactionBlock();
  
  txb.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: args.map(arg => txb.pure(arg)),
  });
  
  const result = await client.signAndExecuteTransactionBlock({
    signer: senderKeypair,
    transactionBlock: txb,
  });
  
  return result;
}

// Ví dụ sử dụng
const result = await callMoveFunction(
  keypair,
  '0x123...', // package ID
  'counter',
  'increment',
  [] // arguments
);
```

### Transaction với Objects

```typescript
async function interactWithObject(
  senderKeypair: Ed25519Keypair,
  objectId: string,
  packageId: string
) {
  const txb = new TransactionBlock();
  
  // Sử dụng object trong transaction
  txb.moveCall({
    target: `${packageId}::game::make_move`,
    arguments: [
      txb.object(objectId), // Object reference
      txb.pure(1), // Move: Rock
    ],
  });
  
  const result = await client.signAndExecuteTransactionBlock({
    signer: senderKeypair,
    transactionBlock: txb,
  });
  
  return result;
}
```

## Coins và Balance

### Lấy balance

```typescript
async function getBalance(address: string, coinType?: string) {
  const balance = await client.getBalance({
    owner: address,
    coinType: coinType || '0x2::sui::SUI', // Default to SUI
  });
  
  console.log(`Balance: ${balance.totalBalance}`);
  return balance;
}

// Lấy tất cả coin types
async function getAllBalances(address: string) {
  const balances = await client.getAllBalances({
    owner: address,
  });
  
  balances.forEach(balance => {
    console.log(`${balance.coinType}: ${balance.totalBalance}`);
  });
  
  return balances;
}
```

### Lấy Coins

```typescript
async function getCoins(address: string, coinType?: string) {
  const coins = await client.getCoins({
    owner: address,
    coinType: coinType || '0x2::sui::SUI',
  });
  
  return coins.data;
}

// Merge coins
async function mergeCoins(
  senderKeypair: Ed25519Keypair,
  primaryCoin: string,
  coinsToMerge: string[]
) {
  const txb = new TransactionBlock();
  
  txb.mergeCoins(
    txb.object(primaryCoin),
    coinsToMerge.map(coin => txb.object(coin))
  );
  
  const result = await client.signAndExecuteTransactionBlock({
    signer: senderKeypair,
    transactionBlock: txb,
  });
  
  return result;
}
```

## Events

### Subscribe to Events

```typescript
async function subscribeToEvents(packageId: string) {
  const subscription = await client.subscribeEvent({
    filter: {
      Package: packageId,
    },
    onMessage: (event) => {
      console.log('New event:', event);
      // Xử lý event
    },
  });
  
  // Unsubscribe sau 30 giây
  setTimeout(() => {
    subscription.then(unsub => unsub());
  }, 30000);
}
```

### Query Events

```typescript
async function queryEvents(packageId: string) {
  const events = await client.queryEvents({
    query: {
      Package: packageId,
    },
    limit: 10,
    order: 'descending',
  });
  
  console.log('Events:', events.data);
  return events.data;
}

// Query events by type
async function queryEventsByType(eventType: string) {
  const events = await client.queryEvents({
    query: {
      MoveEventType: eventType,
    },
    limit: 50,
  });
  
  return events.data;
}
```

## Transactions History

### Lấy transaction history

```typescript
async function getTransactionHistory(address: string) {
  const transactions = await client.queryTransactionBlocks({
    filter: {
      FromAddress: address,
    },
    options: {
      showEffects: true,
      showEvents: true,
      showInput: true,
    },
    limit: 10,
    order: 'descending',
  });
  
  return transactions.data;
}

// Lấy chi tiết transaction
async function getTransactionDetails(digest: string) {
  const transaction = await client.getTransactionBlock({
    digest: digest,
    options: {
      showEffects: true,
      showEvents: true,
      showInput: true,
      showObjectChanges: true,
    },
  });
  
  return transaction;
}
```

## Utility Functions

### Chuyển đổi địa chỉ

```typescript
import { normalizeSuiAddress, isValidSuiAddress } from '@mysten/sui.js/utils';

function validateAndNormalizeAddress(address: string) {
  if (!isValidSuiAddress(address)) {
    throw new Error('Invalid Sui address');
  }
  
  return normalizeSuiAddress(address);
}
```

### Format numbers

```typescript
import { formatDigest } from '@mysten/sui.js/utils';

// Format transaction digest
const shortDigest = formatDigest(transactionDigest);

// Format balance
function formatBalance(balance: string, decimals: number = 9) {
  const balanceNumber = parseInt(balance) / Math.pow(10, decimals);
  return balanceNumber.toFixed(4);
}
```

## Error Handling

```typescript
import { SuiError } from '@mysten/sui.js/errors';

async function handleTransactionWithErrorHandling() {
  try {
    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: txb,
    });
    
    return result;
  } catch (error) {
    if (error instanceof SuiError) {
      console.error('Sui error:', error.message);
      console.error('Error code:', error.code);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
```

## Best Practices

1. **Connection Management**: Sử dụng connection pooling cho production
2. **Error Handling**: Luôn xử lý lỗi từ network và blockchain
3. **Gas Management**: Kiểm tra gas price trước khi gửi transaction
4. **Retry Logic**: Implement retry cho failed transactions
5. **Rate Limiting**: Tôn trọng rate limits của RPC endpoints
6. **Security**: Không expose private keys trong client-side code

## Ví dụ hoàn chỉnh: NFT Marketplace

```typescript
class NFTMarketplace {
  private client: SuiClient;
  private packageId: string;

  constructor(rpcUrl: string, packageId: string) {
    this.client = new SuiClient({ url: rpcUrl });
    this.packageId = packageId;
  }

  async listNFT(
    seller: Ed25519Keypair,
    nftId: string,
    price: number
  ) {
    const txb = new TransactionBlock();
    
    txb.moveCall({
      target: `${this.packageId}::marketplace::list_nft`,
      arguments: [
        txb.object(nftId),
        txb.pure(price),
      ],
    });

    return await this.client.signAndExecuteTransactionBlock({
      signer: seller,
      transactionBlock: txb,
    });
  }

  async buyNFT(
    buyer: Ed25519Keypair,
    listingId: string,
    price: number
  ) {
    const txb = new TransactionBlock();
    
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(price)]);
    
    txb.moveCall({
      target: `${this.packageId}::marketplace::buy_nft`,
      arguments: [
        txb.object(listingId),
        coin,
      ],
    });

    return await this.client.signAndExecuteTransactionBlock({
      signer: buyer,
      transactionBlock: txb,
    });
  }

  async getListings() {
    const events = await this.client.queryEvents({
      query: {
        MoveEventType: `${this.packageId}::marketplace::NFTListed`,
      },
      limit: 100,
    });

    return events.data;
  }
}
```

Sui TypeScript SDK cung cấp tất cả các công cụ cần thiết để xây dựng các ứng dụng blockchain mạnh mẽ và hiệu quả! 