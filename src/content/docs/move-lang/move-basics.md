---
title: Move Programming Cơ bản
description: Học các khái niệm cơ bản của ngôn ngữ lập trình Move trên Sui
---

# Move Programming Cơ bản

Move là ngôn ngữ lập trình được thiết kế đặc biệt cho blockchain, tập trung vào an toàn và bảo mật. Trên Sui, Move được sử dụng để viết smart contracts.

## Cấu trúc Project

### Tạo project mới

```bash
sui move new my_first_package
cd my_first_package
```

### Cấu trúc thư mục

```
my_first_package/
├── Move.toml          # Package manifest
├── sources/           # Source code
│   └── hello.move
└── tests/            # Test files
    └── hello_tests.move
```

### Move.toml

```toml
[package]
name = "MyFirstPackage"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
hello = "0x0"
```

## Cú pháp cơ bản

### Module Declaration

```move
module hello::world {
    // Module content
}
```

### Import và Use

```move
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use std::string::{Self, String};
```

### Struct Definition

```move
public struct HelloWorld has key {
    id: UID,
    text: String,
}
```

## Abilities trong Move

Move sử dụng hệ thống "abilities" để kiểm soát cách structs có thể được sử dụng:

### Key
Cho phép struct được lưu trữ như một object:

```move
public struct MyObject has key {
    id: UID,
    value: u64,
}
```

### Store
Cho phép struct được lưu trữ bên trong structs khác:

```move
public struct Item has store {
    name: String,
    value: u64,
}

public struct Container has key {
    id: UID,
    items: vector<Item>, // Item cần có ability 'store'
}
```

### Copy
Cho phép struct được sao chép:

```move
public struct Point has copy {
    x: u64,
    y: u64,
}
```

### Drop
Cho phép struct được hủy tự động:

```move
public struct Temporary has drop {
    data: vector<u8>,
}
```

## Functions

### Public Functions

```move
public fun create_hello_world(ctx: &mut TxContext) {
    let hello_world = HelloWorld {
        id: object::new(ctx),
        text: string::utf8(b"Hello World!"),
    };
    transfer::transfer(hello_world, tx_context::sender(ctx));
}
```

### Entry Functions

```move
public entry fun say_hello(ctx: &mut TxContext) {
    create_hello_world(ctx);
}
```

### Private Functions

```move
fun internal_logic(value: u64): u64 {
    value * 2
}
```

## Kiểu dữ liệu

### Primitive Types

```move
let number: u64 = 42;
let flag: bool = true;
let byte_value: u8 = 255;
let address_val: address = @0x1;
```

### Vectors

```move
let numbers: vector<u64> = vector::empty();
vector::push_back(&mut numbers, 1);
vector::push_back(&mut numbers, 2);
vector::push_back(&mut numbers, 3);

let first = vector::borrow(&numbers, 0);
let length = vector::length(&numbers);
```

### Strings

```move
let text = string::utf8(b"Hello Sui!");
let empty_string = string::empty();
```

### Options

```move
use std::option::{Self, Option};

let maybe_value: Option<u64> = option::some(42);
let empty_option: Option<u64> = option::none();

if (option::is_some(&maybe_value)) {
    let value = option::extract(&mut maybe_value);
    // Sử dụng value
};
```

## Control Flow

### If-else

```move
fun check_value(value: u64): String {
    if (value > 100) {
        string::utf8(b"High")
    } else if (value > 50) {
        string::utf8(b"Medium")
    } else {
        string::utf8(b"Low")
    }
}
```

### While Loop

```move
fun sum_to_n(n: u64): u64 {
    let sum = 0;
    let i = 1;
    while (i <= n) {
        sum = sum + i;
        i = i + 1;
    };
    sum
}
```

### Loop với break

```move
fun find_first_even(numbers: &vector<u64>): Option<u64> {
    let i = 0;
    let len = vector::length(numbers);
    
    loop {
        if (i >= len) break;
        
        let value = *vector::borrow(numbers, i);
        if (value % 2 == 0) {
            return option::some(value)
        };
        
        i = i + 1;
    };
    
    option::none()
}
```

## Error Handling

```move
const EInvalidValue: u64 = 1;
const ENotOwner: u64 = 2;

public fun update_value(obj: &mut MyObject, new_value: u64) {
    assert!(new_value > 0, EInvalidValue);
    obj.value = new_value;
}
```

## Testing

```move
#[test_only]
module hello::world_tests {
    use hello::world;
    use sui::test_scenario;

    #[test]
    fun test_create_hello_world() {
        let admin = @0xABCD;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        {
            world::create_hello_world(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, admin);
        {
            let hello_world = test_scenario::take_from_sender<world::HelloWorld>(scenario);
            // Kiểm tra logic
            test_scenario::return_to_sender(scenario, hello_world);
        };

        test_scenario::end(scenario_val);
    }
}
```

## Ví dụ hoàn chỉnh: Counter Contract

```move
module hello::counter {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // Struct định nghĩa Counter object
    public struct Counter has key {
        id: UID,
        value: u64,
        owner: address,
    }

    // Error codes
    const ENotOwner: u64 = 1;

    // Tạo counter mới
    public entry fun create_counter(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0,
            owner: tx_context::sender(ctx),
        };
        transfer::transfer(counter, tx_context::sender(ctx));
    }

    // Tăng giá trị counter
    public entry fun increment(counter: &mut Counter, ctx: &TxContext) {
        assert!(counter.owner == tx_context::sender(ctx), ENotOwner);
        counter.value = counter.value + 1;
    }

    // Lấy giá trị hiện tại
    public fun get_value(counter: &Counter): u64 {
        counter.value
    }

    // Reset counter về 0
    public entry fun reset(counter: &mut Counter, ctx: &TxContext) {
        assert!(counter.owner == tx_context::sender(ctx), ENotOwner);
        counter.value = 0;
    }
}
```

## Compile và Deploy

### Compile

```bash
sui move build
```

### Test

```bash
sui move test
```

### Deploy

```bash
sui client publish --gas-budget 20000000
```

## Best Practices

1. **Luôn sử dụng `assert!`** để kiểm tra điều kiện
2. **Định nghĩa error constants** rõ ràng
3. **Sử dụng abilities phù hợp** cho mỗi struct
4. **Viết tests đầy đủ** cho tất cả functions
5. **Tối ưu hóa gas** bằng cách giảm số lượng operations
6. **Sử dụng references** thay vì move values khi có thể
7. **Kiểm tra ownership** trước khi thực hiện operations

Move là ngôn ngữ mạnh mẽ nhưng cần thời gian để làm quen. Hãy bắt đầu với các ví dụ đơn giản và dần dần xây dựng các ứng dụng phức tạp hơn! 