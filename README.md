# Hướng dẫn cài đặt & thiết lập tự động sync campaign từ Group Collector -> Mautic -> Discord sử dụng n8n

n8n là một open source platform giúp quản lý và đơn giản hoá việc automate data workflow. Nó đóng vai trò trái tim đối với việc Sync dữ liệu từ GC về Mautic và đẩy sang Discord theo mô hình sau:

```
Facebook --(GC)--> Google Sheet --(Webhook)--> n8n --(API)--> Mautic --(Webhook)--> n8n --(Webhook)--> Discord
```


## 1. Cấu hình n8n
Đầu tiên, clone repository này về máy:
```
git clone https://github.com/nhatminhbeo/tvg-n8n
```

Để cấu hình n8n, ta mở file [.env](.env) và cấu hình theo hướng dẫn trong file. Một số cấu hình cần lưu ý:
- `DOMAIN_NAME` và `SUBDOMAIN` kết hợp để tạo ra tên miền trang chính của n8n theo dạng `SUBDOMAIN`.`DOMAIN_NAME`. Mặc định đang là area.tranvugroup.com
- `N8N_BASIC_AUTH_USER` và `N8N_BASIC_AUTH_PASSWORD` là user/password để truy cập vào n8n. Mặc định là `tvg/tvg`

## 2. Cài đặt & chạy n8n
Sau khi đã cấu hình xong, chỉ cần chạy lệnh
```
sudo docker-compose up -d
```
để tự động download image n8n về và chạy theo cấu hình bên trên. Cụ thể cấu hình về việc chạy docker tham khảo trong file [docker-compose.yml](docker-compose.yml)

Sau khi chạy thành công n8n container, có thể truy cập vào [area.tranvugroup.com](area.tranvugroup.com) nhập user mật khẩu `tvg/tvg` để bắt đầu sử dụng n8n.

## 3. Thiết lập API key Mautics vào n8n.
Trước khi thiết lập Workflow để sync dữ liệu, ta cần phải thiết lập API key của Mautics để cấp quyền đẩy dữ liệu lên Mautic. Việc này chỉ cần làm 1 lần đầu tiên và không phải lặp lại khi setup campaign mới.

- Đầu tiên, trong giao diện Dashboard của n8n, mở menu `Credentials` bên tay trái và chọn `New`, sau đó tìm kiếm và chọn `Mautic OAuth2 API`, copy ô `OAuth Redirect URL` vào clipboard.

- Sau đó, vào https://dev2.mautic.tranvugroup.com/s/credentials, chọn `new`, nhập tên, paste clipboard vào ô `Redirect URI` rồi nhấn `apply`.

- Khi Mautic đã generate `Client ID` và `Client Secret` thì copy ngược về bên n8n, nhập domain của mautic (ví dụ https://dev2.mautic.tranvugroup.com) rồi connect để hoàn thành thiết lập API key. Lưu ý bỏ dấu `/` ở cuối domain mautic và thử connect lại nếu gặp lỗi.

## 4. Thiết lập sync cho một campaign mới
Với mỗi một Campaign mới thì ta cần thiết lập một workflow mới riêng biệt.

### 4.1 Tạo workflow mới
- Đầu tiên tạo 1 workflow mới: ở thanh menu bên trái chọn `Workflow` rồi `New`.
- Sau đó import mẫu workflow từ file [Template_Sync_GC_Mautic_Discord_Workflow.json](Template_Sync_GC_Mautic_Discord_Workflow.json) dc setup sẵn để Sync GC-Mautic-Discord. Để import mẫu này vào n8n thì ở thanh menu bên trái chọn `Workflow` rồi `Import from file`. Ngoài ra nếu đã có sẵn mẫu này trên n8n thì có thể chọn Duplicate từ một campaign cũ.

- (Optional) Rename workflow này (bên phải logo n8n.io)

- Sau khi import thì double click vào ô `Mautic Add Contact API`, rồi chọn đúng API key trong mục `Credential for Mautic OAuth2 API` rồi tắt đi, save workflow lại.

- Tiếp theo double click vào ô `GC Webhook Trigger`, gõ tên campaign và ô `Path` rồi tắt đi, save workflow lại. Lưu ý tên này ko dc lẫn với tên các campaign khác, nên đặt càng dài càng tốt :D

- Cuối cùng bật active workflow này lên (bên cạnh nút save) để nó bắt đầu chạy nhận dữ liệu.


### 4.2 Tạo trigger trong Google Sheet
- Mở Google Sheet lưu dữ liệu Group Collector của campaign đang thiết lập, chọn menu `Extension` -> `Apps Script`. Lưu ý cần thao tác khi đăng nhập tài khoản sở hữu Google Sheet này.

- Copy paste toàn bộ đoạn code trong file [GSheet.js](GSheet.js) vào trong code editor, rồi Ctrl+S lại.

- Quay trở lại tab Google Sheet của campaign, chọn 1 shell ở bên phải của bảng dữ liệu (chú ý né hết các cột dữ liệu ra), rồi paste lệnh 
```
=GC_MONITOR("Webhook URL", A:V)
```
Trong đó:
- Webhook URL là URL được sinh ra từ ô `GC Webhook Trigger` ở bước 4.1. Lưu ý ở đây phải lấy `URL Production`.
- range: là toàn bộ các ô dữ liệu, để là `A:V` để bao quát tất cả ô dữ liệu GC thu thập.

### 4.3 Test hoạt động
Trong màn hình Google Sheet, thêm mới dữ liệu 1 hàng bất kỳ trong khoảng A:V, rồi mở:
- n8n lên, ấn menu `Executions` bên tay trái để xem dữ liệu từ GSheet đã về n8n chưa.
- sau đó mở Mautic, check trong Contacts xem có dữ liệu mới về chưa
