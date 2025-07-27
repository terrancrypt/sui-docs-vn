---
title: Bắt đầu với Sui
description: Hướng dẫn cài đặt và thiết lập môi trường phát triển Sui
---

Sui là một blockchain layer-1 hiệu suất cao được thiết kế để hỗ trợ các ứng dụng Web3 thế hệ tiếp theo. Trong hướng dẫn này, bạn sẽ học cách thiết lập môi trường phát triển Sui.

## Cài đặt Sui CLI

### Yêu cầu hệ thống

- **Operating System**: Linux, macOS, hoặc Windows (với WSL2)
- **Rust**: Phiên bản 1.75.0 trở lên
- **Git**: Để clone repository

### Cài đặt từ source

1. **Cài đặt Rust và Cargo**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

2. **Clone Sui repository**:
```bash
git clone https://github.com/MystenLabs/sui.git
cd sui
```

3. **Build Sui CLI**:
```bash
cargo build --release --bin sui
```

4. **Thêm vào PATH**:
```bash
export PATH="$PWD/target/release:$PATH"
```

### Cài đặt bằng Homebrew (macOS)

```bash
brew install sui
```

### Cài đặt bằng Chocolatey (window)

```bash
Choco install sui
```

### Cài đặt bằng Suiup (experimental)

```bash
suiup install sui@testnet
```

### Kiểm tra cài đặt

```bash
sui --version
```

## Tạo ví đầu tiên

1. **Khởi tạo Sui client**:
```bash
sui client
```

2. **Tạo địa chỉ mới**:
```bash
sui client new-address ed25519
```

3. **Xem danh sách địa chỉ**:
```bash
sui client addresses
```

4. **Chọn địa chỉ active**:
```bash
sui client switch --address [YOUR_ADDRESS]
```

## Kết nối với mạng

### Mainnet
```bash
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
sui client switch --env mainnet
```

### Testnet
```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
```

### Devnet
```bash
sui client new-env --alias devnet --rpc https://fullnode.devnet.sui.io:443
sui client switch --env devnet
```

## Nhận SUI token (Testnet/Devnet)

Để phát triển và test, bạn cần SUI token:

```bash
sui client faucet
```

Hoặc sử dụng Discord faucet tại: https://discord.gg/sui

## Kiểm tra số dư

```bash
sui client balance
```

## Bước tiếp theo

Bây giờ bạn đã thiết lập xong môi trường Sui! Tiếp theo, bạn có thể:

- [Tìm hiểu về Sui Objects](/guides/sui-objects/)
- [Học Move Programming](/guides/move-basics/)
- [Xây dựng ứng dụng đầu tiên](/guides/first-dapp/) 