---
title: Tổng quan về Walrus
description: Giới thiệu về Walrus - giao thức lưu trữ phi tập trung trên Sui
---

# Tổng quan về Walrus

Walrus là một **giao thức lưu trữ phi tập trung** được xây dựng trên Sui blockchain, được thiết kế để cung cấp giải pháp lưu trữ dữ liệu có khả năng mở rộng, bền vững và tiết kiệm chi phí cho Web3.

## Walrus là gì?

Walrus giải quyết bài toán lưu trữ dữ liệu lớn trong Web3 bằng cách:
- **Phân tán dữ liệu** trên mạng lưới các storage nodes
- **Đảm bảo tính khả dụng** thông qua redundancy và erasure coding
- **Tích hợp chặt chẽ** với Sui blockchain cho metadata và payments
- **Tối ưu chi phí** so với việc lưu trữ trực tiếp trên blockchain

## Đặc điểm nổi bật

### 🗄️ Lưu trữ phi tập trung
- **Không có single point of failure**
- **Dữ liệu được mã hóa** và phân tán
- **Tự động recovery** khi nodes offline
- **Incentive mechanism** cho storage providers

### ⚡ Hiệu suất cao
- **Parallel upload/download**
- **Content-addressed storage**
- **Efficient erasure coding**
- **CDN-like performance**

### 💰 Chi phí thấp
- **Cheaper than on-chain storage**
- **Pay-per-use model**
- **Competitive with Web2 solutions**
- **No hidden fees**

### 🔗 Tích hợp Sui
- **Smart contract integration**
- **On-chain metadata**
- **Programmable storage**
- **Atomic transactions**

## Kiến trúc Walrus

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │  Walrus Sites   │    │   Publishers    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ├───────────────────────┼───────────────────────┤
         │                   Walrus API                   │
         ├─────────────────────────────────────────────────┤
         │              Aggregator Layer                   │
         ├─────────────────────────────────────────────────┤
         │             Storage Nodes                       │
         ├─────────────────────────────────────────────────┤
         │               Sui Blockchain                    │
         └─────────────────────────────────────────────────┘
```

### Storage Nodes
- **Lưu trữ dữ liệu**: Chunks được mã hóa bằng erasure coding
- **Proof of storage**: Chứng minh dữ liệu được lưu trữ đúng cách
- **Availability guarantees**: Cam kết uptime và performance
- **Slashing conditions**: Bị phạt nếu vi phạm cam kết

### Aggregator Layer
- **Load balancing**: Phân tải requests
- **Health monitoring**: Theo dõi trạng thái nodes
- **Routing optimization**: Tối ưu đường truyền
- **Caching layer**: Cache dữ liệu thường dùng

## Cách thức hoạt động

### 1. Data Upload Process
```
1. Client uploads blob → Aggregator
2. Aggregator splits blob → Erasure coded chunks
3. Chunks distributed → Storage nodes
4. Metadata recorded → Sui blockchain
5. Blob ID returned → Client
```

### 2. Data Retrieval Process
```
1. Client requests blob by ID
2. Aggregator locates chunks
3. Retrieves minimum required chunks
4. Reconstructs original blob
5. Returns data to client
```

### 3. Erasure Coding
- **N chunks total**, cần **K chunks** để reconstruct
- **Fault tolerance**: Có thể mất N-K chunks
- **Storage efficiency**: Overhead chỉ (N-K)/K
- **Typical configuration**: N=200, K=133 (50% overhead)

## Use Cases

### 🌐 Walrus Sites
Static websites được host hoàn toàn trên Walrus:
```bash
# Deploy website lên Walrus
walrus-sites publish ./my-website

# Truy cập qua Walrus gateway
https://blobid.walrus.site
```

### 🎮 Game Assets
Lưu trữ game assets như textures, models, audio:
```move
public struct GameAsset has key, store {
    id: UID,
    name: String,
    walrus_blob_id: String,
    size: u64,
}
```

### 📱 NFT Metadata
Lưu trữ metadata và media cho NFTs:
```move
public struct NFT has key, store {
    id: UID,
    name: String,
    image_blob_id: String, // Walrus blob ID
    metadata_blob_id: String,
}
```

### 📊 Data Archives
Lưu trữ dữ liệu lịch sử, logs, backups:
- **Transaction logs**
- **Event data**
- **Historical snapshots**
- **Audit trails**

## Developer Integration

### 1. Walrus CLI
```bash
# Store file
walrus store myfile.jpg
# Returns: blob_id

# Retrieve file
walrus blob-id <BLOB_ID>

# Check status
walrus blob-status <BLOB_ID>
```

### 2. HTTP API
```javascript
// Upload blob
const response = await fetch('https://aggregator.walrus.space/v1/store', {
  method: 'PUT',
  body: fileData,
  headers: {
    'Content-Type': 'application/octet-stream'
  }
});

const { blobId } = await response.json();

// Retrieve blob
const blob = await fetch(`https://aggregator.walrus.space/v1/blob/${blobId}`);
```

### 3. Sui Integration
```move
use walrus::blob_store;

public fun store_nft_image(
    image_data: vector<u8>,
    ctx: &mut TxContext
) {
    let blob_id = blob_store::store_blob(image_data, ctx);
    
    let nft = NFT {
        id: object::new(ctx),
        image_blob_id: blob_id,
    };
    
    transfer::transfer(nft, tx_context::sender(ctx));
}
```

### 4. JavaScript SDK
```javascript
import { WalrusClient } from '@walrus/sdk';

const client = new WalrusClient({
  aggregatorUrl: 'https://aggregator.walrus.space'
});

// Store blob
const result = await client.store(fileBuffer);
console.log('Blob ID:', result.blobId);

// Retrieve blob
const data = await client.retrieve(blobId);
```

## Walrus Sites

### Tạo Static Website
```bash
# Khởi tạo project
walrus-sites init my-site
cd my-site

# Build website
npm run build

# Publish lên Walrus
walrus-sites publish ./dist
```

### Cấu hình Domain
```json
// walrus-site.json
{
  "package": "0x...",
  "module": "site",
  "function": "new_site",
  "domain": "mysite.walrus.space"
}
```

### Dynamic Content
```move
// Smart contract cho dynamic sites
public struct Site has key {
    id: UID,
    name: String,
    content_blob_id: String,
    owner: address,
}

public fun update_site(
    site: &mut Site,
    new_content_blob_id: String,
    ctx: &TxContext
) {
    assert!(site.owner == tx_context::sender(ctx), 0);
    site.content_blob_id = new_content_blob_id;
}
```

## Pricing Model

### Storage Costs
- **Per GB per epoch**: ~$0.01 USD
- **Minimum storage period**: 1 epoch (~24 hours)
- **Maximum storage period**: 200 epochs (~200 days)
- **Renewal**: Có thể gia hạn trước khi hết hạn

### Retrieval Costs
- **Free for normal usage**
- **Rate limiting** để tránh abuse
- **Premium tiers** cho high-bandwidth usage

## Roadmap

### Current (Testnet)
- ✅ Basic storage and retrieval
- ✅ Walrus Sites
- ✅ CLI tools
- ✅ HTTP API

### Near Term
- 🔄 Mainnet launch
- 🔄 Enhanced SDKs
- 🔄 Monitoring dashboard
- 🔄 Performance optimizations

### Future
- 🔮 Cross-chain integration
- 🔮 Advanced encryption
- 🔮 Streaming protocols
- 🔮 AI/ML model storage

## Best Practices

### 1. Data Organization
- **Chunk large files** for better performance
- **Use content addressing** for deduplication
- **Implement versioning** for mutable data
- **Compress data** before storing

### 2. Cost Optimization
- **Batch uploads** để giảm transaction fees
- **Monitor storage periods** và renew khi cần
- **Use appropriate redundancy** levels
- **Implement data lifecycle** management

### 3. Security
- **Encrypt sensitive data** before upload
- **Verify blob integrity** after retrieval
- **Use access controls** trong smart contracts
- **Regular backup** critical data

## Tài nguyên

### Chính thức
- [Walrus Documentation](https://docs.walrus.space)
- [Walrus GitHub](https://github.com/MystenLabs/walrus)
- [Walrus Sites Tutorial](https://docs.walrus.space/walrus-sites)

### Tools
- [Walrus CLI](https://github.com/MystenLabs/walrus/releases)
- [Walrus Explorer](https://walruscan.com)
- [Developer Portal](https://dev.walrus.space)

Walrus mở ra kỷ nguyên mới cho lưu trữ phi tập trung, kết hợp tính bền vững của blockchain với hiệu suất và chi phí của Web2! 