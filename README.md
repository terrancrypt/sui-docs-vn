# Sui Docs Tiếng Việt 🇻🇳

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Tài liệu Sui blockchain bằng tiếng Việt được xây dựng với Astro Starlight.

## 🚀 Hướng dẫn thêm tài liệu mới

### 1. Cấu trúc thư mục

```
src/content/docs/
├── index.mdx                 # Trang chủ
├── sui-blockchain/           # Docs về Sui blockchain
│   ├── overview.md
│   ├── getting-started.md
│   └── sui-objects.md
├── move-lang/               # Docs về Move language
│   ├── overview.md
│   └── move-basics.md
├── frontend-on-sui/         # Docs về frontend development
│   ├── overview.md
│   ├── dapp-development.md
│   ├── typescript-sdk.md
│   └── indexer.md
├── walrus/                  # Docs về Walrus storage
│   └── overview.md
└── resources/               # Tài nguyên khác
    ├── showcase.md
    └── community.md
```

### 2. Tạo file tài liệu mới

#### Bước 1: Tạo file Markdown
Tạo file `.md` hoặc `.mdx` trong thư mục phù hợp:

```bash
# Ví dụ: Thêm docs về Sui tokenomics
touch src/content/docs/sui-blockchain/tokenomics.md
```

#### Bước 2: Thêm frontmatter
Mỗi file docs phải có frontmatter ở đầu file:

```markdown
---
title: Tiêu đề trang
description: Mô tả ngắn gọn về nội dung trang
---

Nội dung tài liệu ở đây...
```

**Ví dụ hoàn chỉnh:**

```markdown
---
title: Tokenomics của Sui
description: Tìm hiểu về tokenomics và cơ chế kinh tế của Sui blockchain
---

# Tokenomics của Sui

Sui có token native là SUI, được sử dụng để...

## SUI Token

SUI token có các chức năng chính:
- Thanh toán gas fees
- Staking để bảo mật mạng lưới
- Governance voting

### Gas Fees

Sui sử dụng một cơ chế gas độc đáo...
```

### 3. Cập nhật sidebar navigation

Sau khi tạo file mới, cần thêm vào sidebar trong `astro.config.mjs`:

```javascript
// astro.config.mjs
sidebar: [
  {
    label: "Sui Blockchain",
    items: [
      { label: "Tổng quan", slug: "sui-blockchain/overview" },
      { label: "Bắt đầu với Sui", slug: "sui-blockchain/getting-started" },
      { label: "Sui Objects", slug: "sui-blockchain/sui-objects" },
      { label: "Tokenomics", slug: "sui-blockchain/tokenomics" }, // ← File mới
    ],
  },
  // ... các sections khác
]
```

### 4. Quy tắc viết docs

#### Frontmatter bắt buộc
```yaml
---
title: Tiêu đề (bắt buộc)
description: Mô tả (bắt buộc)
---
```

#### Frontmatter tùy chọn
```yaml
---
title: Tiêu đề
description: Mô tả
sidebar:
  order: 1           # Thứ tự trong sidebar
  label: Tên khác    # Tên hiển thị khác với title
  hidden: false      # Ẩn khỏi sidebar
editUrl: false       # Tắt link "Edit this page"
lastUpdated: false   # Tắt hiển thị "Last updated"
next: false          # Tắt navigation "Next page"
prev: false          # Tắt navigation "Previous page"
---
```

#### Cú pháp Markdown được hỗ trợ

##### 1. Headings
```markdown
# H1 - Tiêu đề chính
## H2 - Tiêu đề phụ
### H3 - Tiêu đề con
```

##### 2. Code blocks
```markdown
\`\`\`move
module hello_world {
    use std::debug;
    
    fun main() {
        debug::print(&b"Hello, Sui!");
    }
}
\`\`\`
```

##### 3. Callouts/Admonitions
```markdown
:::note
Đây là ghi chú quan trọng.
:::

:::tip
Mẹo hữu ích cho developers.
:::

:::caution
Cảnh báo cần chú ý.
:::

:::danger
Cảnh báo nghiêm trọng!
:::
```

##### 4. Components (chỉ trong .mdx)
```jsx
import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid stagger>
  <Card title="Card 1" icon="rocket">
    Nội dung card 1
  </Card>
  <Card title="Card 2" icon="puzzle">
    Nội dung card 2
  </Card>
</CardGrid>
```

### 5. Thêm hình ảnh

#### Bước 1: Đặt hình ảnh vào thư mục assets
```bash
# Đặt hình ảnh vào src/assets/
cp image.png src/assets/
```

#### Bước 2: Sử dụng trong docs
```markdown
![Alt text](../../assets/image.png)

# Hoặc với kích thước tùy chỉnh
<img src="../../assets/image.png" alt="Alt text" width="500" />
```

### 6. Tạo section mới

#### Bước 1: Tạo thư mục mới
```bash
mkdir src/content/docs/new-section
```

#### Bước 2: Tạo file overview
```bash
touch src/content/docs/new-section/overview.md
```

#### Bước 3: Thêm vào sidebar
```javascript
// astro.config.mjs
sidebar: [
  // ... sections khác
  {
    label: "Section Mới",
    items: [
      { label: "Tổng quan", slug: "new-section/overview" },
    ],
  },
]
```

### 7. Development workflow

#### Cài đặt dependencies
```bash
pnpm install
```

#### Chạy dev server
```bash
pnpm dev
# Mở http://localhost:4321
```

#### Build production
```bash
pnpm build
```

#### Preview build
```bash
pnpm preview
```

### 8. Best practices

#### ✅ Nên làm
- Sử dụng tiêu đề có thứ bậc rõ ràng (H1 → H2 → H3)
- Viết mô tả ngắn gọn và súc tích
- Sử dụng code examples thực tế
- Thêm callouts cho thông tin quan trọng
- Kiểm tra links hoạt động

#### ❌ Không nên làm
- Sử dụng H1 nhiều lần trong một trang
- Viết mô tả quá dài (>160 ký tự)
- Đặt hình ảnh quá lớn (>1MB)
- Quên cập nhật sidebar navigation
- Sử dụng link tuyệt đối cho internal links

### 9. Ví dụ hoàn chỉnh

**File: `src/content/docs/move-lang/functions.md`**

```markdown
---
title: Functions trong Move
description: Hướng dẫn cách khai báo và sử dụng functions trong Move language
sidebar:
  order: 3
---

# Functions trong Move

Functions là khối xây dựng cơ bản của Move programs.

## Khai báo function

\`\`\`move
module my_module {
    // Public function
    public fun add(a: u64, b: u64): u64 {
        a + b
    }
    
    // Private function
    fun subtract(a: u64, b: u64): u64 {
        a - b
    }
}
\`\`\`

:::tip
Sử dụng từ khóa `public` để function có thể được gọi từ bên ngoài module.
:::

## Entry functions

Entry functions có thể được gọi trực tiếp từ transactions:

\`\`\`move
public entry fun transfer(to: address, amount: u64) {
    // Logic transfer
}
\`\`\`

:::note
Entry functions không thể return values.
:::
```

**Sau đó thêm vào `astro.config.mjs`:**

```javascript
{
  label: "Move Language",
  items: [
    { label: "Tổng quan Move", slug: "move-lang/overview" },
    { label: "Move Programming Cơ bản", slug: "move-lang/move-basics" },
    { label: "Functions trong Move", slug: "move-lang/functions" }, // ← Thêm dòng này
  ],
}
```

## 📝 Đóng góp

1. Fork repo này
2. Tạo branch mới: `git checkout -b feature/new-docs`
3. Thêm tài liệu theo hướng dẫn trên
4. Commit changes: `git commit -m "Add new docs"`
5. Push branch: `git push origin feature/new-docs`
6. Tạo Pull Request

## 🔗 Links hữu ích

- [Astro Starlight Docs](https://starlight.astro.build/)
- [Sui Official Docs](https://docs.sui.io)
- [Move Language Reference](https://move-language.github.io/move/)
- [Sui Developer Portal](https://sui.io/developers)

## 📞 Liên hệ

- Discord: [Sui Discord](https://discord.gg/sui)
- Twitter: [@SuiNetwork](https://twitter.com/SuiNetwork)
- GitHub: [MystenLabs/sui](https://github.com/MystenLabs/sui)
