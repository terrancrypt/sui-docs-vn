---
title: Phát Triển DApp Trên Sui
description: Hướng dẫn chi tiết về phát triển DApp trên Sui blockchain
---

## 🎯 Mục Tiêu Học Tập

Sau khi hoàn thành tài liệu này, bạn sẽ nắm vững:
- Kiến trúc và nguyên lý hoạt động của Sui blockchain
- Cách phát triển DApp (Decentralized Application) trên Sui
- Tích hợp Sui SDK và dApp Kit vào ứng dụng frontend
- Thực hiện các transaction blockchain từ giao diện người dùng
- Best practices trong phát triển DApp hiện đại

## 🏗️ Kiến Trúc Tổng Quan

### 1. DApp Architecture Stack
```
Frontend Framework: React + TypeScript + Vite
UI Library: Tailwind CSS
Blockchain Layer: Sui Network (Testnet/Mainnet)
Blockchain SDK: @mysten/dapp-kit + @mysten/sui
State Management: React Query + React Hooks
Wallet Integration: Multi-wallet support via dApp Kit
```

### 2. DApp Project Structure
```
src/
├── App.tsx              # Main DApp component
├── main.tsx             # DApp entry point với blockchain providers
├── index.css            # Global DApp styles
└── components/
    ├── RandomMemoryNFT.tsx      # NFT minting component (template-based)
    ├── SelfIntroductionNFT.tsx  # NFT minting component (custom data)
    └── TransactionResult.tsx    # Blockchain transaction feedback
```

## 🔧 Khái Niệm DApp Cơ Bản

### 1. Sui Blockchain Fundamentals
- **Sui Network**: Blockchain Layer 1 hiệu năng cao với kiến trúc object-centric
- **Move Language**: Ngôn ngữ smart contract an toàn và hiệu quả
- **Object Model**: Mọi thứ trên Sui đều là object có thể sở hữu và chuyển nhượng
- **Parallel Execution**: Xử lý transaction song song để tăng throughput
- **Gas Model**: Cơ chế phí transaction linh hoạt và dự đoán được

### 2. DApp Development Concepts
- **Decentralized Application (DApp)**: Ứng dụng chạy trên blockchain, không có single point of failure
- **Frontend-Blockchain Integration**: Kết nối giao diện người dùng với smart contracts
- **Wallet-as-a-Service**: Wallet làm cầu nối giữa user và blockchain
- **Transaction Flow**: Quy trình từ user action đến blockchain state change
- **Event-Driven Architecture**: Lắng nghe và phản hồi với blockchain events

### 3. Sui DApp Ecosystem
- **dApp Kit**: Bộ công cụ chính thức để xây dựng DApp trên Sui
- **Multi-Wallet Support**: Hỗ trợ nhiều loại wallet (Sui Wallet, Suiet, etc.)
- **Network Flexibility**: Dễ dàng switch giữa testnet và mainnet
- **Developer Tools**: Explorer, faucet, và debugging tools

## 📋 DApp Implementation Chi Tiết

Github Repo: https://github.com/terrancrypt/simple-sui-app

### 1. DApp Foundation Setup (main.tsx)

```typescript
// Cấu hình network cho DApp - hỗ trợ cả testnet và mainnet
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

// DApp Provider Architecture:
// 1. QueryClientProvider - Quản lý data caching và synchronization
// 2. SuiClientProvider - Kết nối với Sui blockchain network
// 3. WalletProvider - Quản lý wallet connections và authentication
```

**Giải thích**: Provider architecture là nền tảng của DApp, tạo ra một context layer để chia sẻ blockchain state và functions across toàn bộ ứng dụng mà không cần prop drilling.

### 2. DApp Wallet Integration

```typescript
// Hook để lấy thông tin blockchain account của user
const account = useCurrentAccount();

// Hook để lấy danh sách các wallet đã connect
const wallets = useWallets();

// Component UI sẵn có cho wallet connection flow
<ConnectButton />
```

**Giải thích**: Wallet integration là cốt lõi của DApp UX. `useCurrentAccount` cung cấp thông tin về địa chỉ blockchain của user, trong khi `ConnectButton` handle toàn bộ flow connect/disconnect với multiple wallet providers.

### 3. Blockchain Transaction Flow

#### A. Programmable Transaction Blocks (PTBs)
```typescript
// Khởi tạo một Programmable Transaction Block
const tx = new Transaction();

// Thực hiện Move call đến smart contract function
tx.moveCall({
  target: `${PACKAGE_ID}::module_name::function_name`,
  arguments: [tx.object(objectId)], // Object references
});

// Ký và broadcast transaction lên Sui network
const result = await signAndExecuteTransaction.mutateAsync({
  transaction: tx,
});
```

**Giải thích**: 
- `Transaction()`: Tạo Programmable Transaction Block - đặc trưng của Sui cho phép gộp nhiều operations
- `moveCall()`: Invoke smart contract functions được viết bằng Move language  
- `tx.object()`: Reference đến on-chain objects theo object-centric model của Sui
- `signAndExecuteTransaction`: Hook xử lý cryptographic signing và network broadcast

#### B. Dynamic Data Transactions
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::module_name::mint_with_data`,
  arguments: [
    tx.pure.string(name),        // Pure value arguments
    tx.pure.string(description), 
    tx.pure.string(imageUrl),
    tx.pure.string(slogan),
  ],
});
```

**Giải thích**: 
- `tx.pure.*()`: Tạo pure value arguments - data không tồn tại trên blockchain trước đó
- Type-safe arguments: SDK đảm bảo type matching với Move function parameters
- Dynamic content: Cho phép user tạo unique on-chain data thông qua DApp interface

### 4. DApp State Management

```typescript
// DApp UI state - phản ánh blockchain operations
const [transactionResult, setTransactionResult] = useState<any>(null);
const [isProcessing, setIsProcessing] = useState(false);

// Blockchain state - được sync từ network
const account = useCurrentAccount();
const { data: balance } = useSuiClientQuery('getBalance', { 
  owner: account?.address 
});

// State sharing pattern trong DApp architecture
<MintingComponent 
  isProcessing={isProcessing}
  setIsProcessing={setIsProcessing}
  transactionResult={transactionResult}
  setTransactionResult={setTransactionResult}
/>
```

**Giải thích**: DApp state bao gồm cả UI state (loading, errors) và blockchain state (account, balances, objects). State lifting pattern giúp synchronize giữa multiple components và blockchain operations.

### 5. Error Handling

```typescript
try {
  const resData = await signAndExecuteTransaction.mutateAsync({
    transaction: tx,
  });
  setMintResult(resData); // Success case
} catch (e) {
  setMintResult({ error: e }); // Error case
} finally {
  setIsLoading(false); // Cleanup
}
```

**Giải thích**: Sử dụng try-catch để handle cả success và error cases, finally để cleanup state.

## 🎨 UI/UX Patterns

### 1. Loading States
```typescript
{isLoading && (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-blue-700 font-medium">Minting...</span>
  </div>
)}
```

**Giải thích**: Hiển thị spinner và message khi đang thực hiện transaction để user biết app đang hoạt động.

### 2. Conditional Rendering
```typescript
<button
  disabled={!account || isLoading}
  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
>
  {isLoading
    ? "Minting..."
    : account
    ? "Mint NFT"
    : "Connect Wallet First"}
</button>
```

**Giải thích**: Button text và state thay đổi dựa trên điều kiện hiện tại.

### 3. Form Validation
```typescript
if (!name || !description || !imageUrl || !slogan) {
  alert("Please fill in all fields");
  return;
}
```

**Giải thích**: Kiểm tra input trước khi submit để tránh transaction lỗi.

## 🔍 Smart Contract Interaction

### 1. Package và Object IDs
```typescript
// Constants để dễ dàng thay đổi
const PACKAGE_ID = "0x489563cb7a99e87528b871f6f5df62100e96374d7cfc9432af7907f119049151";
const MEMORY_STORE_ID = "0x0b8391f4a847b3c9b1ec9a4820939906c8520714dcf5f1b4b503f8ab3c33f4c0";
```

**Giải thích**: Sử dụng constants để dễ maintain và update khi cần thiết.

### 2. Function Targets
```typescript
// Format: package_id::module_name::function_name
target: `${packageObjectId}::my_nft_collection::mint_random_memory_nft`
```

**Giải thích**: Target string định nghĩa chính xác function nào sẽ được gọi trong smart contract.

## 🚀 Best Practices

### 1. Component Separation
- **Single Responsibility**: Mỗi component chỉ làm một việc
- **Props Interface**: Định nghĩa rõ ràng props với TypeScript
- **Reusability**: Component có thể tái sử dụng

### 2. Error Handling
- **User-friendly Messages**: Hiển thị lỗi dễ hiểu cho user
- **Graceful Degradation**: App vẫn hoạt động khi có lỗi
- **Loading States**: Luôn có feedback khi đang xử lý

### 3. State Management
- **Lift State Up**: Share state ở component cha
- **Minimal State**: Chỉ store state cần thiết
- **Immutable Updates**: Không mutate state trực tiếp

### 4. Performance
- **Conditional Rendering**: Chỉ render khi cần thiết
- **Event Handler Optimization**: Tránh re-create functions không cần thiết
- **Bundle Size**: Chỉ import những gì cần dùng

## 🔗 Key Concepts Summary

1. **Providers**: Wrap app với các provider để chia sẻ functionality
2. **Hooks**: Sử dụng hooks để tương tác với Sui network và wallet
3. **Transactions**: Tạo và execute transaction để tương tác với smart contract
4. **State Management**: Quản lý UI state cho loading, success, error states
5. **Component Architecture**: Chia nhỏ UI thành các component có thể tái sử dụng

## 📖 Tài Liệu Tham Khảo

- [Sui Documentation](https://docs.sui.io/)
- [dApp Kit Documentation](https://sdk.mystenlabs.com/dapp-kit)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**💡 Tip**: Hãy đọc code trong từng component để hiểu rõ hơn về cách implementation hoạt động! 