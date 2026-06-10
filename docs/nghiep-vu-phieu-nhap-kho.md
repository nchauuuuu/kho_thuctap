# Nghiệp vụ Phiếu nhập kho

Tài liệu này mô tả nghiệp vụ Phiếu nhập kho vừa bổ sung cho dự án QuanLyKhoCafe.

## 1. Mục tiêu

Module Phiếu nhập kho dùng để ghi nhận việc nhận nguyên vật liệu từ nhà cung cấp. Phiếu mới tạo không làm thay đổi tồn kho ngay. Tồn kho chỉ tăng sau khi Quản lý tiệm duyệt phiếu.

## 2. Vai trò tham gia

| Vai trò | Quyền |
| --- | --- |
| QuanLyTiem | Xem, thêm, sửa phiếu Chờ duyệt, xóa phiếu Chờ duyệt, duyệt phiếu |
| NhanVienKho | Xem, thêm phiếu, sửa/xóa phiếu mình tạo nếu còn Chờ duyệt |
| NhanVienPhaChe | Không thao tác Phiếu nhập kho |

Frontend đã ẩn menu Phiếu nhập với NhanVienPhaChe theo phân quyền sidebar hiện có.

## 3. Trạng thái phiếu

| Mã trạng thái | Hiển thị | Ý nghĩa |
| --- | --- | --- |
| ChoDuyet | Chờ duyệt | Phiếu mới tạo, chưa cộng tồn kho |
| DaDuyet | Đã duyệt | Đã cộng tồn kho, không được sửa/xóa/duyệt lại |
| DaHuy | Đã hủy | Phiếu đã hủy, không được duyệt |

## 4. Luồng nghiệp vụ chuẩn

1. Nhân viên kho hoặc Quản lý tiệm tạo phiếu nhập.
2. Backend validate dữ liệu và lưu phiếu với trạng thái `ChoDuyet`.
3. Khi phiếu ở trạng thái `ChoDuyet`, hệ thống chưa cộng tồn kho.
4. Quản lý tiệm bấm `Duyệt`.
5. Backend kiểm tra phiếu còn `ChoDuyet`.
6. Backend cộng số lượng nhập vào `NguyenVatLieu.TonHienTai`.
7. Backend ghi `LichSuTonKho` với `LoaiGiaoDich = NhapKho`.
8. Backend cập nhật phiếu sang `DaDuyet`.

## 5. Rule validate backend

Khi tạo hoặc sửa phiếu, backend bắt buộc kiểm tra:

- Phải chọn nhà cung cấp.
- Phải có người lập phiếu.
- Ngày nhập không được rỗng.
- Phiếu phải có ít nhất một dòng chi tiết.
- Mỗi dòng chi tiết phải có nguyên vật liệu hợp lệ.
- Số lượng nhập phải lớn hơn 0.
- Đơn giá nhập không được âm.
- Không cho trùng cùng một nguyên vật liệu trong cùng một phiếu.
- Nguyên vật liệu phải tồn tại trong database.
- Nguyên vật liệu ngừng sử dụng không được nhập.
- Tổng tiền không tin từ frontend, backend tính bằng `SoLuongNhap * DonGia`.

## 6. Rule sửa phiếu

- Chỉ được sửa phiếu có trạng thái `ChoDuyet`.
- Không được sửa phiếu `DaDuyet`.
- Sửa phiếu không làm thay đổi tồn kho.
- Khi sửa chi tiết, backend xóa chi tiết cũ và ghi lại danh sách chi tiết mới sau khi validate hợp lệ.

## 7. Rule duyệt phiếu

Khi duyệt phiếu:

- Phiếu phải tồn tại.
- Phiếu phải đang ở trạng thái `ChoDuyet`.
- Phiếu phải có chi tiết nhập kho.
- Mỗi dòng chi tiết phải có số lượng nhập lớn hơn 0.
- Người duyệt phải tồn tại.
- Người duyệt phải có vai trò `QuanLyTiem`.
- Mỗi nguyên vật liệu được cộng vào `NguyenVatLieu.TonHienTai`.
- Ghi lịch sử tồn kho:
  - `LoaiGiaoDich = NhapKho`
  - `BangLienQuan = PhieuNhapKho`
  - `BanGhiLienQuanId = PhieuNhapKhoId`
  - `SoLuongThayDoi` là số dương
  - `TonTruoc` và `TonSau` được ghi theo từng dòng chi tiết
- Sau khi xử lý thành công mới đổi trạng thái sang `DaDuyet`.
- Không cho duyệt lại phiếu đã duyệt.

## 8. Rule xóa phiếu

- Chỉ được xóa phiếu đang `ChoDuyet`.
- Không cho xóa phiếu `DaDuyet`.
- Phiếu đã duyệt cần giữ lại để tránh mất chứng từ và sai tồn kho.

## 9. Hiển thị frontend

Màn hình `PhieuNhapKho` đã cập nhật:

- Format ngày dạng `dd/MM/yyyy`.
- Format tiền dạng `1.140.000 đ`.
- Trạng thái hiển thị thân thiện:
  - `ChoDuyet` -> `Chờ duyệt`
  - `DaDuyet` -> `Đã duyệt`
  - `DaHuy` hoặc `TuChoi` -> `Đã hủy`
- Nút `Duyệt` chỉ hiện với phiếu `ChoDuyet` và user `QuanLyTiem`.
- Nút `Sửa` chỉ hiện với phiếu `ChoDuyet` và đúng quyền.
- Nút `Xóa` chỉ hiện với phiếu `ChoDuyet` và đúng quyền.
- Phiếu `DaDuyet` chỉ còn nút `Xem`.
- Form thêm/sửa có:
  - Nhà cung cấp
  - Người lập, tự chọn theo user đang đăng nhập nếu xác định được
  - Ngày nhập, mặc định là ngày hiện tại
  - Số chứng từ/hóa đơn, không bắt buộc
  - Lý do nhập:
    - Nhập bổ sung tồn kho
    - Nhập đầu kỳ/đầu tuần
    - Nhà cung cấp giao hàng
    - Nhập bù hàng thiếu
    - Khác
  - Ghi chú chung, không bắt buộc
  - Khu vực thêm nguyên vật liệu nhập kho:
    - Chỉ chọn được nguyên vật liệu đang sử dụng
    - Hiển thị đơn vị tính sau khi chọn nguyên vật liệu
    - Nhập số lượng, đơn giá và tự tính thành tiền
    - Chọn tình trạng hàng: Đạt, Bao bì rách nhẹ, Giao thiếu, Sai loại, Gần hết hạn, Khác
    - Ghi chú dòng hàng, không bắt buộc
  - Danh sách nguyên vật liệu trong phiếu:
    - STT
    - Mã nguyên vật liệu
    - Tên nguyên vật liệu
    - Đơn vị tính
    - Số lượng
    - Đơn giá
    - Thành tiền
    - Tình trạng
    - Ghi chú
    - Thao tác xóa dòng
  - Cho phép sửa nhanh số lượng và đơn giá trực tiếp trong bảng chi tiết khi phiếu chưa duyệt.
  - Tổng tiền tự tính và hiển thị nổi bật ở cuối modal.
  - Khi chưa có dòng chi tiết, màn hình hiển thị trạng thái rỗng thay vì bảng trống.
  - Các thông tin bổ sung như lý do nhập, số chứng từ và tình trạng hàng được lưu ghép vào `GhiChu` để không cần thay đổi cấu trúc database hiện tại.

## 10. API liên quan

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| GET | `/api/PhieuNhapKho` | Lấy danh sách phiếu |
| GET | `/api/PhieuNhapKho/{id}` | Lấy chi tiết phiếu |
| POST | `/api/PhieuNhapKho` | Tạo phiếu mới |
| PUT | `/api/PhieuNhapKho/{id}` | Sửa phiếu Chờ duyệt |
| PUT | `/api/PhieuNhapKho/{id}/duyet` | Duyệt phiếu |
| DELETE | `/api/PhieuNhapKho/{id}` | Xóa phiếu Chờ duyệt |

## 11. Payload mẫu

### Tạo phiếu nhập hợp lệ

```json
{
  "nhaCungCapId": 1,
  "nguoiLapId": 1,
  "ngayNhap": "2026-06-10",
  "ghiChu": "Lý do nhập: Nhà cung cấp giao hàng | Số chứng từ: HD001 | Ghi chú: Nhập hàng đầu tuần",
  "chiTiet": [
    {
      "nguyenVatLieuId": 1,
      "soLuongNhap": 10,
      "donGia": 85000,
      "ghiChu": "Tình trạng: Đạt | Ghi chú: Robusta"
    }
  ]
}
```

### Duyệt phiếu

```json
{
  "nguoiDuyetId": 1
}
```

## 12. Test case cần kiểm tra

### Swagger

1. Tạo phiếu không có chi tiết
   - Gọi `POST /api/PhieuNhapKho` với `chiTiet: []`.
   - Kết quả mong đợi: báo lỗi `Phiếu nhập phải có ít nhất một nguyên vật liệu.`

2. Tạo phiếu số lượng bằng 0
   - Gửi một dòng chi tiết có `soLuongNhap: 0`.
   - Kết quả mong đợi: báo lỗi `Số lượng nhập phải lớn hơn 0.`

3. Tạo phiếu đơn giá âm
   - Gửi một dòng chi tiết có `donGia: -1`.
   - Kết quả mong đợi: báo lỗi `Đơn giá nhập không được âm.`

4. Tạo phiếu trùng nguyên vật liệu
   - Gửi hai dòng có cùng `nguyenVatLieuId`.
   - Kết quả mong đợi: báo lỗi `Nguyên vật liệu bị trùng trong phiếu nhập.`

5. Tạo phiếu hợp lệ
   - Kết quả mong đợi: phiếu có `TrangThai = ChoDuyet`.
   - Kiểm tra `NguyenVatLieu.TonHienTai` chưa tăng.

6. Duyệt phiếu
   - Gọi `PUT /api/PhieuNhapKho/{id}/duyet`.
   - Kết quả mong đợi: phiếu thành `DaDuyet`, tồn kho tăng đúng số lượng.
   - Có dòng mới trong `LichSuTonKho`.

7. Duyệt lại phiếu đã duyệt
   - Kết quả mong đợi: báo lỗi `Phiếu nhập kho đã được duyệt trước đó.`

8. Sửa phiếu đã duyệt
   - Gọi `PUT /api/PhieuNhapKho/{id}` với phiếu `DaDuyet`.
   - Kết quả mong đợi: báo lỗi `Phiếu đã duyệt không thể sửa.`

9. Xóa phiếu đã duyệt
   - Gọi `DELETE /api/PhieuNhapKho/{id}` với phiếu `DaDuyet`.
   - Kết quả mong đợi: báo lỗi `Phiếu đã duyệt không thể xóa.`

### Frontend

1. Đăng nhập bằng user `QuanLyTiem`.
2. Vào `/admin/phieu-nhap-kho`.
3. Bấm `Thêm phiếu nhập`.
4. Trong phần `Thông tin phiếu nhập`, chọn nhà cung cấp, kiểm tra người lập, ngày nhập, nhập số chứng từ nếu có, chọn lý do nhập và ghi chú chung.
5. Trong phần `Thêm nguyên vật liệu nhập kho`, chọn nguyên vật liệu đang sử dụng.
6. Kiểm tra đơn vị tính tự hiển thị.
7. Nhập số lượng lớn hơn 0 và đơn giá không âm.
8. Chọn tình trạng hàng và nhập ghi chú dòng hàng nếu có.
9. Bấm `Thêm dòng`.
10. Kiểm tra dòng vừa thêm xuất hiện trong `Danh sách nguyên vật liệu trong phiếu`.
11. Sửa nhanh số lượng hoặc đơn giá trong bảng chi tiết nếu cần.
12. Kiểm tra thành tiền từng dòng và tổng tiền tự cập nhật.
13. Bấm `Lưu phiếu`.
14. Kiểm tra phiếu mới có trạng thái `Chờ duyệt`.
15. Bấm `Duyệt`.
16. Kiểm tra trạng thái thành `Đã duyệt`, nút `Sửa/Xóa/Duyệt` biến mất, chỉ còn `Xem`.

### Validate frontend

1. Bấm `Lưu phiếu` khi chưa chọn nhà cung cấp.
   - Kết quả mong đợi: hệ thống hiển thị toast báo phải chọn nhà cung cấp.

2. Bấm `Lưu phiếu` khi chưa có dòng chi tiết.
   - Kết quả mong đợi: hệ thống hiển thị toast báo phiếu nhập phải có ít nhất một nguyên vật liệu.

3. Thêm dòng với số lượng bằng 0.
   - Kết quả mong đợi: hệ thống hiển thị toast báo số lượng nhập phải lớn hơn 0.

4. Thêm dòng với đơn giá âm.
   - Kết quả mong đợi: hệ thống hiển thị toast báo đơn giá nhập không được âm.

5. Thêm trùng nguyên vật liệu đã có trong bảng chi tiết.
   - Kết quả mong đợi: hệ thống hiển thị toast báo nguyên vật liệu bị trùng trong phiếu nhập.

## 13. Ghi chú thiết kế

Dự án hiện không có model/bảng `TonKho` riêng trong code. Tồn kho hiện tại được quản lý trực tiếp bằng field `NguyenVatLieu.TonHienTai`, nên nghiệp vụ duyệt phiếu nhập cộng trực tiếp vào field này. Hệ thống vẫn ghi lịch sử vào `LichSuTonKho` để truy vết biến động tồn.
