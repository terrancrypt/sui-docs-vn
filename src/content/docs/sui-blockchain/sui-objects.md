---
title: Sui Objects
description: Hiểu về hệ thống objects trong Sui blockchain
---

Sui sử dụng một mô hình dữ liệu dựa trên objects thay vì accounts như các blockchain khác. Điều này cho phép Sui xử lý song song các giao dịch và đạt được hiệu suất cao.

## Object là gì?

Trong Sui, mọi thứ đều là objects - từ SUI coins đến NFTs, smart contracts và dữ liệu ứng dụng. Mỗi object có:

- **Object ID**: Định danh duy nhất 32 bytes
- **Version**: Số phiên bản tăng dần với mỗi mutation
- **Owner**: Ai sở hữu hoặc kiểm soát object này
- **Type**: Kiểu dữ liệu của object (được định nghĩa bằng Move)

## Các loại Objects

### 1. Owned Objects
Objects thuộc sở hữu của một địa chỉ cụ thể:

```move
public struct Sword has key, store {
    id: UID,
    magic: u64,
    strength: u64,
}
```

### 2. Shared Objects
Objects có thể được truy cập bởi nhiều giao dịch đồng thời:

```move
public struct GameBoard has key {
    id: UID,
    players: vector<address>,
    winner: Option<address>,
}
```

### 3. Immutable Objects
Objects không thể thay đổi sau khi tạo:

```move
public struct GameConfig has key {
    id: UID,
    max_players: u64,
    entry_fee: u64,
}
```

## Object Ownership

### Single Owner
Object thuộc về một địa chỉ duy nhất:

```bash
sui client object [OBJECT_ID]
```

### Shared
Object có thể được sử dụng bởi nhiều giao dịch:

```move
use sui::transfer;

public fun share_object(game_board: GameBoard) {
    transfer::share_object(game_board);
}
```

### Immutable
Object không thể thay đổi:

```move
public fun freeze_config(config: GameConfig) {
    transfer::freeze_object(config);
}
```

## Object References

### Owned Reference
Tham chiếu đến object thuộc sở hữu:

```move
public fun upgrade_sword(sword: &mut Sword, amount: u64) {
    sword.strength = sword.strength + amount;
}
```

### Shared Reference
Tham chiếu đến shared object:

```move
public fun join_game(game: &mut GameBoard, player: address) {
    vector::push_back(&mut game.players, player);
}
```

### Immutable Reference
Tham chiếu chỉ đọc:

```move
public fun get_sword_strength(sword: &Sword): u64 {
    sword.strength
}
```

## Dynamic Fields

Sui cho phép thêm fields động vào objects:

```move
use sui::dynamic_field;

public struct Hero has key {
    id: UID,
    name: String,
}

public fun add_inventory(hero: &mut Hero, item_name: String, item: Item) {
    dynamic_field::add(&mut hero.id, item_name, item);
}

public fun get_item(hero: &Hero, item_name: String): &Item {
    dynamic_field::borrow(&hero.id, item_name)
}
```

## Object Wrapping

Objects có thể chứa các objects khác:

```move
public struct Sheath has key {
    id: UID,
    sword: Sword, // Wrapped object
}

public fun sheath_sword(sword: Sword, ctx: &mut TxContext): Sheath {
    Sheath {
        id: object::new(ctx),
        sword,
    }
}
```

## Lệnh CLI để làm việc với Objects

### Xem thông tin object
```bash
sui client object [OBJECT_ID]
```

### Liệt kê objects của địa chỉ
```bash
sui client objects [ADDRESS]
```

### Chuyển object
```bash
sui client transfer --to [RECIPIENT] --object-id [OBJECT_ID]
```

## Best Practices

1. **Sử dụng owned objects** cho dữ liệu cá nhân
2. **Sử dụng shared objects** cho tài nguyên chung
3. **Tối ưu hóa object structure** để giảm gas fees
4. **Sử dụng dynamic fields** cho dữ liệu linh hoạt
5. **Cẩn thận với object wrapping** để tránh khóa tài sản

## Ví dụ thực tế

```move
module game::inventory {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::dynamic_field;
    use std::string::String;

    public struct PlayerInventory has key {
        id: UID,
        owner: address,
        capacity: u64,
    }

    public struct Item has key, store {
        id: UID,
        name: String,
        rarity: u8,
    }

    public fun create_inventory(ctx: &mut TxContext): PlayerInventory {
        PlayerInventory {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            capacity: 10,
        }
    }

    public fun add_item(
        inventory: &mut PlayerInventory,
        item: Item,
        slot: u64
    ) {
        dynamic_field::add(&mut inventory.id, slot, item);
    }
}
```

Objects là nền tảng của Sui blockchain. Hiểu rõ cách chúng hoạt động sẽ giúp bạn xây dựng các ứng dụng hiệu quả và an toàn trên Sui. 