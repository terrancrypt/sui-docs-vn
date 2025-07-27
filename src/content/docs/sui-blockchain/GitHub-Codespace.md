---
title: GitHub Codespace - Setup Move Dev Environment
---

# Hướng dẫn từng bước giúp bạn setup môi trường phát triển Move (trên Sui blockchain) 
- hoàn toàn online, không cần cài đặt cục bộ.

---

## Mục tiêu

- Sử dụng GitHub Codespace để code Move trực tiếp trên web
- Chạy Docker container chứa `sui` CLI từ MystenLabs
- Gắn kết mã nguồn với container để quản lý contract dễ dàng

---

## Yêu cầu

- Tài khoản GitHub
- Docker đã được cài sẵn trong Codespace (mặc định có)
- Sử dụng image chính thức: `mysten/sui-tools:testnet`

---

## Bước 1: Tạo repository mới trên GitHub

1. Đăng nhập vào [GitHub](https://github.com/)
2. Nhấn nút **New** (hoặc dấu + > New repository)
3. Đặt tên repo, ví dụ: `My-Firts-Sui-Dapp`
4. **Tick chọn "Add a README file"** để repo có sẵn file README.md
5. Nhấn **Create repository**

> **Bạn có thể đặt repo tên khác, nhưng phải nhớ để vào đúng thư mục repo đó khi chạy các bước tiếp theo.**

---

## Bước 2: Mở Codespace

1. Vào repo GitHub vừa tạo
2. Nhấn nút `<> Code` → Chọn `Codespaces` → `Create codespace on main`
3. Đợi 1-2 phút để môi trường khởi động

---

## Bước 3: Mở Terminal

- Trong Codespace → nhấn `Terminal > New Terminal`
- Bạn sẽ thấy đang ở thư mục:

    ```
    /workspaces/My-Firts-Sui-Dapp
    ```

> **Lưu ý:** Nếu bạn đặt tên repo khác, đường dẫn thư mục này cũng sẽ khác theo tên repo bạn chọn.

---

## Bước 4: Kéo Docker image của Sui

![Kéo Docker image minh hoạ](/img/step4.png)

```bash
docker pull mysten/sui-tools:testnet
```

---

## Bước 5: Chạy container và mount thư mục mã nguồn

![Chạy container minh hoạ](/img/step5.png)

```bash
docker run --name suidevcontainer -it -v /workspaces/My-Firts-Sui-Dapp:/project mysten/sui-tools:testnet
```

> Lưu ý:
> - `suidevcontainer`: tên container
> - `/workspaces/My-Firts-Sui-Dapp`: thư mục Codespace
> - `/project`: thư mục gắn vào container
> - **Nếu tên repo của bạn khác, hãy thay đổi đường dẫn `/workspaces/My-Firts-Sui-Dapp` cho đúng với tên repo bạn đã tạo.**

---

## Bước 6: Làm việc trong container

Sau khi chạy xong, bạn sẽ ở trong container với prompt dạng:

```
root@xxxxx:/sui#
```

### Di chuyển vào thư mục mã nguồn:

![Di chuyển vào thư mục mã nguồn minh hoạ](/img/step6-2.png)

```bash
cd /project
```

### Tạo dự án Move:

![Tạo dự án Move minh hoạ](/img/step6-3.png)

```bash
sui move new firts_project
```

### Di chuyển vào dự án:

![di chuyển vào dự án đã tạo minh hoạ](/img/step6-4.png)

```bash
cd firts_project
``` 

### Thêm module Hello World vào dự án

1. Trong thư mục `firts_project/sources/`, tạo file mới tên là `hello_world.move`.
2. Copy đoạn code sau vào file:

    ```move
    module hello_world::hello_world {

        use std::string;
        use sui::object::{Self, UID};
        use sui::tx_context::{Self, TxContext};
        use sui::transfer;

        /// An object that contains an arbitrary string
        public struct HelloWorldObject has key, store {
            id: UID,
            /// A string contained in the object
            text: string::String
        }

        #[lint_allow(self_transfer)]
        public entry fun hello_world(ctx: &mut TxContext) {
            let object = HelloWorldObject {
                id: object::new(ctx),
                text: string::utf8(b"Hello World!")
            };
            transfer::public_transfer(object, tx_context::sender(ctx));
        }

    }
    ```

    > Thay `hello_world` bằng địa chỉ package của bạn nếu khác (xem trong file `Move.toml`).

3. Chạy lệnh build:

    ```bash
    sui move build
    ```

4. Nếu build thành công, bạn sẽ thấy kết quả:

    ```
    UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git
    INCLUDING DEPENDENCY Sui
    INCLUDING DEPENDENCY MoveStdlib
    BUILDING hello_world
    ```

    ![Kết quả build thành công minh hoạ](/img/step6-5.png)

### Tạo ví và môi trường testnet

```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
```
Nhập `y` khi được hỏi kết nối với Sui node. Sau đó chọn key kiểu `0` (ed25519).
> **Lưu ý:** Bạn cũng sẽ được hỏi để nhập URL cho môi trường testnet, hãy nhập `https://fullnode.testnet.sui.io:443` nếu cần.

![Kết quả tạo ví và môi trường testnet](/img/step6-6.png)

### Thêm 1 address mới

```bash
sui client new-address <scheme>
```
Ví dụ:

```bash
sui client new-address ed25519
```
> **Tip:** Bạn có thể nhập `recoveryPhrase` (cụm từ khôi phục) vào ví Slush hoặc các ví khác để sử dụng địa chỉ này trên giao diện ví.

![Kết quả tạo thêm ví khác](/img/step6-7.png)

> **Lưu ý:** Nếu bạn đã tạo và có hơn 2 ví, bạn có thể chuyển sang ví khác tùy theo nhu cầu sử dụng bằng lệnh `sui client switch --address <địa_chỉ_ví_của_bạn>`

Ví dụ: `sui client switch --address 0x0a7b8caa26fb1c7c3b84c1f8dd51d8416b232c3e7e48b5eb0254ed2a83170c79`

### Faucet coins cho address

Để nhận SUI token testnet miễn phí cho địa chỉ ví của bạn:
1. Truy cập [Discord của Sui](https://discord.com/invite/sui).
2. Vào kênh `testnet-faucet`.
3. Nhập lệnh theo cú pháp:
   ```
   !faucet <địa_chỉ_ví_của_bạn>
   ```
   Ví dụ:
   ```
   !faucet 0x0a7b8caa26fb1c7c3b84c1f8dd51d8416b232c3e7e48b5eb0254ed2a83170c79
   ```
   Thay `<địa_chỉ_ví_của_bạn>` bằng địa chỉ ví Sui bạn muốn nhận coin.

![Hướng dẫn Faucet coins](/img/step6-10.png)

### Kiểm tra số dư

```bash
sui client balance
```

![Kết quả kiểm tra số dư](/img/step6-8.png)

### Publish Module

```bash
sui client publish --gas-budget 100000000
```

---

![Kết quả build thành công minh hoạ](/img/step6-9.png)

---

## Bước 7: Đẩy code lên GitHub

**1: Thêm thư mục vào danh sách an toàn của Git (nếu có cảnh báo)**

```bash
git config --global --add safe.directory /project
```

**2: Thiết lập tên và email Git cá nhân**

```bash
git config --global user.name "Your Name Here"          # THAY bằng tên thật hoặc GitHub username của bạn
git config --global user.email "your@email.com"         # THAY bằng email đã dùng để đăng ký GitHub
```

Ví dụ:

```bash
git config --global user.name "Huc06"
git config --global user.email "phuc92147@gmail.com"
```

**3: Add & Commit code**

```bash
git add .
git commit -m "your commit message"                     # THAY bằng nội dung commit phù hợp
```

Ví dụ:

```bash
git commit -m "init move project"
```

**4: Tạo Personal Access Token (PAT)**

- Truy cập: https://github.com/settings/tokens
- Chọn "Generate new token (classic)"
- Cấu hình:
    - Note: push-from-docker
    - Expiration: 30 days hoặc No expiration
    - Scope: tick vào repo
- Nhấn Generate token
- SAO CHÉP token, ví dụ:

```text
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                # TOKEN NÀY CỰC KỲ QUAN TRỌNG!
```

**5: Push code lên GitHub**

```bash
git push origin main
```

Khi được hỏi:
- Username: your_github_username # THAY bằng username GitHub thật
- Password: paste_your_token_here # DÁN token đã tạo ở Bước 4

Ví dụ:

```
Username: Huc06
Password: ghp_abcDEF1234567890TOKENdemoONLY
```

**Tuỳ chọn: Lưu token để không cần nhập lại**

```bash
git config --global credential.helper store
```

**KẾT QUẢ THÀNH CÔNG**

```bash
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Compressing objects: 100% (10/10), done.
Writing objects: 100% (11/11), done.
To https://github.com/<your_username>/<your_repo>
   0d5227b..f91641c  main -> main
```

---

## Bước 8: Thoát container (nếu cần)

```bash
exit
```

**Nếu đã thoát container và muốn vào lại:**

```bash
docker start suidevcontainer
docker exec -it suidevcontainer bash
```

---

## Bước 9: Xóa container cũ nếu muốn tạo lại

```bash
docker rm -f suidevcontainer
```

<!-- Chèn hình minh hoạ tại đây nếu muốn -->
