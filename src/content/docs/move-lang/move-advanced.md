---
title: Move Programming Nâng cao
description: Xây dựng Bộ sưu tập NFT cá nhân trên Sui
---

Chào mừng bạn đến với hướng dẫn xây dựng bộ sưu tập NFT cá nhân trên nền tảng Sui Blockchain. Trong phần này, chúng ta sẽ cùng nhau tạo ra một NFT độc đáo để giới thiệu bản thân, và sau đó phát triển một bộ sưu tập các NFT chứa đựng những kỷ niệm đáng nhớ của bạn, với khả năng đúc ngẫu nhiên!

Chúng ta sẽ đi qua từng bước một, từ việc định nghĩa cấu trúc dữ liệu cho NFT đến việc triển khai logic đúc NFT ngẫu nhiên. 

## 1. Chuẩn bị môi trường và Module Move

Đầu tiên, chúng ta cần tạo một module Move trong thư mục `sources` của dự án Sui Move của bạn. Nếu bạn chưa có dự án Move, hãy tạo một dự án mới:

```bash
sui move new my_nft_project
cd my_nft_project
```

Sau đó, mở tệp `sources/my_nft_project.move` (hoặc một tệp `.move` khác bạn muốn). Chúng ta sẽ xây dựng module này từng phần.

## 2. Định nghĩa các Struct

### 2.1 Cấu trúc của `MemoryNFT`

`MemoryNFT` là cấu trúc của NFT kỷ niệm, được định nghĩa với các trường cơ bản sau:

```move
struct MemoryNFT has key, store {
    id: UID,
    name: String,
    description: String,
    image_url: String,
    rarity: u8,
}
```

- `id`: Định danh duy nhất cho mỗi NFT, là một `UID` (Unique ID) được Sui cấp.
- `name`: Tên của sự kiện hoặc kỷ niệm mà NFT này đại diện.
- `description`: Mô tả chi tiết về sự kiện hoặc kỷ niệm.
- `image_url`: URL của hình ảnh đại diện cho NFT.
- `rarity`: Độ hiếm của NFT, có thể là một số nguyên từ 1-5 (ví dụ: 1-Phổ biến, 5-Huyền thoại).

### 2.2 Cấu trúc của `MemoryTemplate`

`MemoryTemplate` là một cấu trúc dữ liệu dùng để lưu trữ thông tin của các mẫu NFT kỷ niệm. Các mẫu này sẽ được sử dụng để đúc ra các `MemoryNFT` ngẫu nhiên. Quan trọng là `MemoryTemplate` có khả năng `drop`.

```move
struct MemoryTemplate has store, drop {
    name: String,
    description: String,
    image_url: String,
    rarity: u8,
}
```

- `has drop`: Khả năng `drop` được thêm vào để cho phép các template có thể bị loại bỏ khỏi `Table` sau khi được sử dụng để mint NFT. Điều này giúp tránh lỗi "unconsumed" (không được sử dụng) đối với các tài nguyên tạm thời.
- Các trường của `MemoryTemplate` tương tự như `MemoryNFT` nhưng không có `id` vì nó chỉ là một mẫu, không phải là một đối tượng NFT có thể chuyển nhượng.

### 2.3 Cấu trúc của `MemoryTemplateStore`

`MemoryTemplateStore` là một Shared Object (đối tượng chia sẻ) dùng để lưu trữ tất cả các `MemoryTemplate`.

```move
struct MemoryTemplateStore has key, store {
    id: UID,
    templates: Table<u64, MemoryTemplate>,
    next_template_id: u64,
}
```

- `id`: Định danh duy nhất cho `MemoryTemplateStore`.
- `templates`: Một `Table` (bảng) dùng để lưu trữ các `MemoryTemplate`, với khóa là `u64` (định danh của template) và giá trị là `MemoryTemplate`.
- `next_template_id`: Một bộ đếm để gán ID duy nhất cho mỗi `MemoryTemplate` mới được thêm vào.

### 2.4 Event: `MemoryNFTCreated`

Khi một `MemoryNFT` được tạo ra, một sự kiện `MemoryNFTCreated` sẽ được phát ra. Điều này giúp các ứng dụng khác theo dõi và phản ứng với việc tạo NFT.

```move
struct MemoryNFTCreated has copy, drop {
    nft_id: address,
    creator: address,
    name: String,
    rarity: u8,
}
```

- `nft_id`: Địa chỉ của NFT vừa được tạo.
- `creator`: Địa chỉ của người đã tạo ra NFT.
- `name`: Tên của NFT.
- `rarity`: Độ hiếm của NFT.

## 3. Các hàm chính

### 3.1 Hàm `mint_random_memory_nft`

Hàm này cho phép bất kỳ ai cũng có thể mint một NFT kỷ niệm ngẫu nhiên từ các mẫu đã được thêm vào `MemoryTemplateStore`. Điểm đặc biệt là sau khi một mẫu được sử dụng, nó sẽ được loại bỏ khỏi kho lưu trữ để tránh việc đúc trùng lặp.

```move
public entry fun mint_random_memory_nft(
    store: &mut MemoryTemplateStore, // store giờ là mutable
    ctx: &mut TxContext
) {
    let sender_addr = sender(ctx);
    let num_templates = length(&store.templates);
    assert!(num_templates > 0, 1001);

    let seed = epoch_timestamp_ms(ctx);
    let idx = seed % num_templates;
    let last_index = store.next_template_id - 1;

    // Lấy mẫu được chọn từ Table
    let selected_template = remove(&mut store.templates, idx);

    // Nếu mẫu được chọn không phải là mẫu cuối cùng,
    // di chuyển mẫu cuối cùng vào vị trí của mẫu đã chọn
    if (idx != last_index) {
        let last_template = remove(&mut store.templates, last_index);
        add(&mut store.templates, idx, last_template);
    };
    // Cập nhật lại next_template_id
    store.next_template_id = last_index;

    let nft = MemoryNFT {
        id: new(ctx),
        name: selected_template.name,
        description: selected_template.description,
        image_url: selected_template.image_url,
        rarity: selected_template.rarity,
    };

    emit(MemoryNFTCreated {
        nft_id: id_to_address(&object_id(&nft)),
        creator: sender_addr,
        name: nft.name,
        rarity: nft.rarity,
    });

    transfer::transfer(nft, sender_addr);
}
```

**Giải thích logic:**

-   **`store: &mut MemoryTemplateStore`**: Tham số `store` giờ đây là một tham chiếu mutable (`&mut`), cho phép hàm thay đổi trạng thái của `MemoryTemplateStore` (cụ thể là xóa mẫu).
-   **`remove(&mut store.templates, idx)`**: Mẫu được chọn ngẫu nhiên sẽ bị xóa khỏi bảng `templates`.
-   **Logic `if (idx != last_index)`**: Để duy trì tính liên tục của các chỉ số trong `Table` và hiệu quả bộ nhớ, nếu mẫu được chọn không phải là mẫu cuối cùng, thì mẫu cuối cùng sẽ được lấy ra và chèn vào vị trí của mẫu đã bị xóa.
-   **`store.next_template_id = last_index`**: Sau khi một mẫu được sử dụng, `next_template_id` (đóng vai trò như kích thước hiện tại của bảng) sẽ được giảm đi 1.

### 3.2 Hàm `add_memory_template`

Hàm này cho phép thêm các mẫu NFT kỷ niệm mới vào `MemoryTemplateStore`.

```move
public entry fun add_memory_template(
    store: &mut MemoryTemplateStore,
    name: String,
    description: String,
    image_url: String,
    rarity: u8,
    _ctx: &mut TxContext
) {
    let new_template_id = store.next_template_id;
    store.next_template_id = store.next_template_id + 1;
    add(&mut store.templates, new_template_id, MemoryTemplate {
        name,
        description,
        image_url,
        rarity,
    });
}
```

### 3.3 Hàm `init`

Hàm `init` là hàm khởi tạo của module, được chạy một lần duy nhất khi module được triển khai lên Sui Blockchain. Nó tạo ra `MemoryTemplateStore` object và chia sẻ nó.

```move
fun init(ctx: &mut TxContext) {
    transfer::share_object(MemoryTemplateStore {
        id: new(ctx),
        templates: new_table(ctx),
        next_template_id: 0,
    });
}
```

## 4. Hướng dẫn sử dụng Module NFT của bạn

Sau khi đã có mã nguồn Move, chúng ta sẽ đi qua các bước để biên dịch, triển khai và tương tác với module NFT của bạn trên Sui Blockchain.

### Bước 4.1: Biên dịch (Build) Module Move

Đảm bảo bạn đang ở thư mục gốc của dự án Move (ví dụ: `my_nft_project`). Chạy lệnh sau để biên dịch code của bạn:

```bash
sui move build
```

Nếu không có lỗi, bạn sẽ thấy thông báo `Successfully built package`.

### Bước 4.2: Triển khai (Publish) Module Move

Sau khi biên dịch thành công, bạn cần triển khai module lên Sui Blockchain. Lệnh này sẽ tạo ra một package mới trên chuỗi và trả về `PACKAGE_ID` cùng với `OBJECT_ID` của `MemoryTemplateStore` (là một shared object).

```bash
sui client publish --gas-budget 1000000
```

**Lưu ý quan trọng:**
*   Giữ lại `PACKAGE_ID` và `MemoryTemplateStore_OBJECT_ID` từ output của lệnh này. Bạn sẽ cần chúng cho các bước tiếp theo.
*   `MemoryTemplateStore_OBJECT_ID` là ID của đối tượng `MemoryTemplateStore` mà hàm `init` đã tạo và chia sẻ.

### Bước 4.3: Thêm các mẫu kỷ niệm (Add Memory Templates)

Trước khi người dùng có thể mint NFT kỷ niệm ngẫu nhiên, bạn cần thêm các mẫu kỷ niệm vào `MemoryTemplateStore`. Bạn sẽ dùng `add_memory_template` cho việc này.

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module my_nft_collection \
  --function add_memory_template \
  --args <MemoryTemplateStore_OBJECT_ID> "<Tên của sự kiện>" "<Mô tả>" "<URL hình ảnh>" <Rarity> \
  --gas-budget 1000000
```

**Ví dụ:**

```bash
sui client call \
  --package 0x489563cb7a99e87528b871f6f5df62100e96374d7cfc9432af7907f119049151 \
  --module my_nft_collection \
  --function add_memory_template \
  --args 0x0b8391f4a847b3c9b1ec9a4820939906c8520714dcf5f1b4b503f8ab3c33f4c0 "Kỷ niệm gặp gỡ" "Lần đầu tiên chúng ta gặp nhau" "https://example.com/meet.png" 3 \
  --gas-budget 1000000

sui client call \
  --package 0x489563cb7a99e87528b871f6f5df62100e96374d7cfc9432af7907f119049151 \
  --module my_nft_collection \
  --function add_memory_template \
  --args 0x0b8391f4a847b3c9b1ec9a4820939906c8520714dcf5f1b4b503f8ab3c33f4c0 "Chuyến đi biển" "Một chuyến đi biển đầy nắng và gió" "https://example.com/beach.png" 2 \
  --gas-budget 1000000
```

Bạn có thể gọi lệnh này nhiều lần để thêm nhiều mẫu kỷ niệm khác nhau.

### Bước 4.4: Mint NFT Kỷ niệm ngẫu nhiên (Mint Random Memory NFT)

Bất kỳ người dùng nào cũng có thể gọi hàm này để mint một NFT kỷ niệm ngẫu nhiên từ các mẫu bạn đã cung cấp.

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module my_nft_collection \
  --function mint_random_memory_nft \
  --args <MemoryTemplateStore_OBJECT_ID> \
  --gas-budget 1000000
```

**Ví dụ:**

```bash
sui client call \
  --package 0x489563cb7a99e87528b871f6f5df62100e96374d7cfc9432af7907f119049151 \
  --module my_nft_collection \
  --function mint_random_memory_nft \
  --args 0x0b8391f4a847b3c9b1ec9a4820939906c8520714dcf5f1b4b503f8ab3c33f4c0 \
  --gas-budget 1000000
```

Sau khi chạy lệnh này, bạn sẽ nhận được một NFT kỷ niệm ngẫu nhiên dựa trên các mẫu đã được thêm vào store của bạn.

## 5. Mã nguồn Move hoàn chỉnh

Dưới đây là toàn bộ mã nguồn của module `my_nft_collection` sau khi đã tích hợp tất cả các thay đổi và giải thích:

```move
module nft::my_nft_collection {
    use sui::object::{UID, new, id as object_id, id_to_address};
    use sui::tx_context::{TxContext, sender, epoch_timestamp_ms};
    use sui::event::emit;
    use sui::transfer;
    use sui::table::{Table, add, remove, length, new as new_table};
    use std::string::String;

    /// NFT rút gọn với 4 trường cơ bản
    struct MemoryNFT has key, store {
        id: UID,
        name: String,
        description: String,
        image_url: String,
        rarity: u8,
    }

    /// Mẫu dữ liệu để tạo NFT
    ///  Thêm drop để tránh lỗi unconsumed
    struct MemoryTemplate has store, drop {
        name: String,
        description: String,
        image_url: String,
        rarity: u8,
    }

    /// Object lưu trữ danh sách mẫu NFT
    struct MemoryTemplateStore has key, store {
        id: UID,
        templates: Table<u64, MemoryTemplate>,
        next_template_id: u64,
    }

    /// Event khi tạo NFT
    struct MemoryNFTCreated has copy, drop {
        nft_id: address,
        creator: address,
        name: String,
        rarity: u8,
    }

    /// Mint NFT từ template ngẫu nhiên
    public entry fun mint_random_memory_nft(
        store: &mut MemoryTemplateStore,
        ctx: &mut TxContext
    ) {
        let sender_addr = sender(ctx);
        let num_templates = length(&store.templates);
        assert!(num_templates > 0, 1001);

        let seed = epoch_timestamp_ms(ctx);
        let idx = seed % num_templates;
        let last_index = store.next_template_id - 1;

        let selected_template = remove(&mut store.templates, idx);

        if (idx != last_index) {
            let last_template = remove(&mut store.templates, last_index);
            add(&mut store.templates, idx, last_template);
        };
        store.next_template_id = last_index;

        let nft = MemoryNFT {
            id: new(ctx),
            name: selected_template.name,
            description: selected_template.description,
            image_url: selected_template.image_url,
            rarity: selected_template.rarity,
        };

        emit(MemoryNFTCreated {
            nft_id: id_to_address(&object_id(&nft)),
            creator: sender_addr,
            name: nft.name,
            rarity: nft.rarity,
        });

        transfer::transfer(nft, sender_addr);
    }

    /// Thêm template mới
    public entry fun add_memory_template(
        store: &mut MemoryTemplateStore,
        name: String,
        description: String,
        image_url: String,
        rarity: u8,
        _ctx: &mut TxContext
    ) {
        let new_template_id = store.next_template_id;
        store.next_template_id = store.next_template_id + 1;
        add(&mut store.templates, new_template_id, MemoryTemplate {
            name,
            description,
            image_url,
            rarity,
        });
    }

    /// Khởi tạo object lưu templates
    fun init(ctx: &mut TxContext) {
        transfer::share_object(MemoryTemplateStore {
            id: new(ctx),
            templates: new_table(ctx),
            next_template_id: 0,
        });
    }
}```
