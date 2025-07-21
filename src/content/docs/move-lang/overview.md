---
title: Tổng quan về Move Language
description: Giới thiệu về ngôn ngữ lập trình Move và ứng dụng trên Sui
---

# Tổng quan về Move Language

Move là ngôn ngữ lập trình được thiết kế đặc biệt cho blockchain, tập trung vào **an toàn**, **bảo mật** và **hiệu suất**. Được phát triển ban đầu tại Facebook (Meta) cho Diem, Move hiện được sử dụng trên nhiều blockchain khác nhau, bao gồm Sui.

## Tại sao Move?

### 🔒 Resource Safety
- **Linear types**: Tài nguyên không thể bị sao chép hoặc mất
- **Ownership model**: Kiểm soát chặt chẽ quyền sở hữu
- **No dangling pointers**: Không có con trỏ treo

### 🛡️ Security First
- **Formal verification**: Có thể chứng minh tính đúng đắn
- **Type safety**: Hệ thống type mạnh mẽ
- **Memory safety**: Không có buffer overflow

### ⚡ Performance
- **Compiled language**: Biên dịch thành bytecode
- **Efficient execution**: Tối ưu cho blockchain
- **Parallel execution**: Hỗ trợ xử lý song song

## Đặc điểm chính

### 1. Resource-Oriented Programming
```move
// Resource không thể copy hoặc drop
public struct Coin has key {
    id: UID,
    value: u64,
}

// Chỉ có thể transfer, không thể duplicate
public fun transfer_coin(coin: Coin, recipient: address) {
    transfer::transfer(coin, recipient);
}
```

### 2. Abilities System
Move sử dụng abilities để kiểm soát hành vi của types:

- **`copy`**: Có thể sao chép giá trị
- **`drop`**: Có thể hủy giá trị
- **`store`**: Có thể lưu trong global storage
- **`key`**: Có thể dùng làm key trong global storage

### 3. Global Storage
```move
// Struct với ability 'key' có thể lưu global
public struct GameState has key {
    id: UID,
    players: vector<address>,
    winner: Option<address>,
}

// Publish to global storage
public fun create_game(ctx: &mut TxContext) {
    let game = GameState {
        id: object::new(ctx),
        players: vector::empty(),
        winner: option::none(),
    };
    transfer::share_object(game);
}
```

## Move trên Sui vs Move gốc

### Sui Move Extensions

| Đặc điểm            | Move gốc       | Sui Move          |
| ------------------- | -------------- | ----------------- |
| **Storage Model**   | Global storage | Object-centric    |
| **Ownership**       | Account-based  | Object ownership  |
| **Concurrency**     | Sequential     | Parallel-friendly |
| **Entry Functions** | Public script  | Entry functions   |

### Sui-specific Features

#### 1. Object Model
```move
use sui::object::{Self, UID};
use sui::transfer;

public struct NFT has key, store {
    id: UID,
    name: String,
    image_url: String,
}

public fun mint_nft(
    name: String, 
    image_url: String, 
    ctx: &mut TxContext
) {
    let nft = NFT {
        id: object::new(ctx),
        name,
        image_url,
    };
    transfer::transfer(nft, tx_context::sender(ctx));
}
```

#### 2. Dynamic Fields
```move
use sui::dynamic_field;

public fun add_metadata(
    nft: &mut NFT, 
    key: String, 
    value: String
) {
    dynamic_field::add(&mut nft.id, key, value);
}
```

#### 3. Events
```move
use sui::event;

public struct MintEvent has copy, drop {
    nft_id: ID,
    creator: address,
    name: String,
}

public fun mint_with_event(name: String, ctx: &mut TxContext) {
    let nft = NFT {
        id: object::new(ctx),
        name,
        image_url: string::utf8(b""),
    };
    
    event::emit(MintEvent {
        nft_id: object::uid_to_inner(&nft.id),
        creator: tx_context::sender(ctx),
        name,
    });
    
    transfer::transfer(nft, tx_context::sender(ctx));
}
```

## Cấu trúc Package

### Package Layout
```
my_package/
├── Move.toml          # Package manifest
├── sources/           # Source code
│   ├── module1.move
│   └── module2.move
└── tests/            # Test files
    └── module1_tests.move
```

### Move.toml
```toml
[package]
name = "MyPackage"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
my_package = "0x0"
```

## Patterns phổ biến

### 1. Capability Pattern
```move
public struct AdminCap has key {
    id: UID,
}

public fun create_admin_cap(ctx: &mut TxContext) {
    transfer::transfer(AdminCap {
        id: object::new(ctx),
    }, tx_context::sender(ctx));
}

public fun admin_only_function(_cap: &AdminCap) {
    // Chỉ người có AdminCap mới gọi được
}
```

### 2. Witness Pattern
```move
public struct MY_TOKEN has drop {}

fun init(witness: MY_TOKEN, ctx: &mut TxContext) {
    // Chỉ được gọi một lần khi deploy
    let (treasury_cap, metadata) = coin::create_currency(
        witness, 
        9, 
        b"TOKEN", 
        b"My Token", 
        b"Description", 
        option::none(), 
        ctx
    );
    // Transfer capabilities...
}
```

### 3. Hot Potato Pattern
```move
public struct Request {
    // Struct không có abilities -> phải được xử lý
    value: u64,
}

public fun create_request(value: u64): Request {
    Request { value }
}

public fun handle_request(request: Request): u64 {
    let Request { value } = request; // Must destructure
    value
}
```

## Testing trong Move

### Unit Tests
```move
#[test_only]
module my_package::tests {
    use my_package::my_module;
    use sui::test_scenario;

    #[test]
    fun test_mint_nft() {
        let admin = @0xABCD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        {
            my_module::mint_nft(
                string::utf8(b"Test NFT"),
                string::utf8(b"https://example.com"),
                test_scenario::ctx(scenario)
            );
        };

        test_scenario::next_tx(scenario, admin);
        {
            let nft = test_scenario::take_from_sender<my_module::NFT>(scenario);
            // Verify NFT properties
            test_scenario::return_to_sender(scenario, nft);
        };

        test_scenario::end(scenario_val);
    }
}
```

## Best Practices

### 1. Security
- **Validate inputs**: Luôn kiểm tra đầu vào
- **Use assert!**: Kiểm tra điều kiện trước khi thực hiện
- **Handle errors**: Định nghĩa error codes rõ ràng

### 2. Performance
- **Minimize storage**: Giảm thiểu dữ liệu lưu trữ
- **Use references**: Tránh move values không cần thiết
- **Batch operations**: Gộp nhiều thao tác trong một transaction

### 3. Maintainability
- **Clear naming**: Đặt tên rõ ràng cho functions và variables
- **Document code**: Viết comments và documentation
- **Modular design**: Chia nhỏ code thành modules

## Công cụ phát triển

### 1. Sui CLI
```bash
# Tạo package mới
sui move new my_package

# Build package
sui move build

# Test package
sui move test

# Publish package
sui client publish --gas-budget 20000000
```

### 2. Move Analyzer (VS Code)
- Syntax highlighting
- Error checking
- Auto-completion
- Go to definition

### 3. Move Prover
```bash
# Formal verification
move prove sources/my_module.move
```

## Tài nguyên học tập

### Chính thức
- [Move Book](https://move-book.com/)
- [Sui Move Tutorial](https://docs.sui.io/guides/developer/first-app)
- [Move Examples](https://github.com/MystenLabs/sui/tree/main/examples/move)

### Cộng đồng
- [Move Language Discord](https://discord.gg/move-language)
- [Sui Developer Forums](https://forums.sui.io)
- [Move Language GitHub](https://github.com/move-language)

Move là nền tảng mạnh mẽ để xây dựng các ứng dụng blockchain an toàn và hiệu quả. Với thiết kế tập trung vào resource safety và formal verification, Move giúp developers tránh được nhiều lỗi phổ biến trong smart contract development! 