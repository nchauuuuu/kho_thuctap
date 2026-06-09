import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function PhieuNhapKho() {
  const [dsPhieuNhapKho, setDsPhieuNhapKho] = useState([]);
  const [dsNhaCungCap, setDsNhaCungCap] = useState([]);
  const [dsNguoiDung, setDsNguoiDung] = useState([]);
  const [dsNguyenVatLieu, setDsNguyenVatLieu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    maPhieuNhapKho: "",
    nhaCungCapId: "",
    nguoiLapId: "",
    ngayNhap: "",
    tongTien: 0,
    trangThai: "ChoDuyet",
    ghiChu: "",
  });

  const [chiTietForm, setChiTietForm] = useState({
    nguyenVatLieuId: "",
    soLuongNhap: 1,
    donGiaNhap: 0,
    ghiChu: "",
  });

  const [chiTietPhieuNhap, setChiTietPhieuNhap] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);

    try {
      const [
        resPhieuNhap,
        resNhaCungCap,
        resNguoiDung,
        resNguyenVatLieu,
      ] = await Promise.all([
        axiosClient.get("/PhieuNhapKho"),
        axiosClient.get("/NhaCungCap"),
        axiosClient.get("/NguoiDung"),
        axiosClient.get("/NguyenVatLieu"),
      ]);

      console.log("Phiếu nhập kho:", resPhieuNhap.data);
      console.log("Nhà cung cấp:", resNhaCungCap.data);
      console.log("Người dùng:", resNguoiDung.data);
      console.log("Nguyên vật liệu:", resNguyenVatLieu.data);

      setDsPhieuNhapKho(resPhieuNhap.data);
      setDsNhaCungCap(resNhaCungCap.data);
      setDsNguoiDung(resNguoiDung.data);
      setDsNguyenVatLieu(resNguyenVatLieu.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu phiếu nhập kho:", error);
      alert("Không thể tải dữ liệu phiếu nhập kho");
    } finally {
      setLoading(false);
    }
  };

  const generateMaPhieuNhapKho = () => {
    const time = Date.now().toString().slice(-6);
    return `PNK${time}`;
  };

  const toInputDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  const formatDate = (date) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatMoney = (money) => {
    if (money === null || money === undefined) return "0";
    return Number(money).toLocaleString("vi-VN");
  };

  const tinhTongTien = (dsChiTiet) => {
    return dsChiTiet.reduce((total, item) => {
      const soLuong = Number(item.soLuongNhap || 0);
      const donGia = Number(item.donGiaNhap ?? item.donGia ?? 0);
      return total + soLuong * donGia;
    }, 0);
  };

  const resetChiTietForm = () => {
    setChiTietForm({
      nguyenVatLieuId: "",
      soLuongNhap: 1,
      donGiaNhap: 0,
      ghiChu: "",
    });
  };

  const resetForm = () => {
    setFormData({
      maPhieuNhapKho: "",
      nhaCungCapId: "",
      nguoiLapId: "",
      ngayNhap: "",
      tongTien: 0,
      trangThai: "ChoDuyet",
      ghiChu: "",
    });

    setChiTietPhieuNhap([]);
    resetChiTietForm();

    setSelectedId(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      maPhieuNhapKho: generateMaPhieuNhapKho(),
      nhaCungCapId: "",
      nguoiLapId: "",
      ngayNhap: new Date().toISOString().slice(0, 10),
      tongTien: 0,
      trangThai: "ChoDuyet",
      ghiChu: "",
    });

    setChiTietPhieuNhap([]);
    resetChiTietForm();

    setSelectedId(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setSelectedId(item.phieuNhapKhoId);
    setIsEditing(true);
    setShowForm(true);

    const dsChiTiet =
      item.chiTiet ||
      item.chiTietPhieuNhapKhos ||
      item.chiTietPhieuNhapKho ||
      item.chiTietPhieuNhaps ||
      item.chiTiets ||
      [];

    const chiTietDaMap = dsChiTiet.map((ct, index) => {
      const nguyenVatLieuId = ct.nguyenVatLieuId;
      const nvl = dsNguyenVatLieu.find(
        (itemNvl) => itemNvl.nguyenVatLieuId === nguyenVatLieuId
      );

      return {
        tempId: ct.chiTietPhieuNhapKhoId || `old-${index}`,
        nguyenVatLieuId,
        maNguyenVatLieu:
          ct.maNguyenVatLieu ||
          ct.nguyenVatLieu?.maNguyenVatLieu ||
          nvl?.maNguyenVatLieu ||
          `NVL${nguyenVatLieuId}`,
        tenNguyenVatLieu:
          ct.tenNguyenVatLieu ||
          ct.nguyenVatLieu?.tenNguyenVatLieu ||
          nvl?.tenNguyenVatLieu ||
          "Không có",
        soLuongNhap: ct.soLuongNhap || 1,
        donGiaNhap: ct.donGiaNhap ?? ct.donGia ?? 0,
        ghiChu: ct.ghiChu || "",
      };
    });

    setFormData({
      maPhieuNhapKho:
        item.maPhieuNhapKho || item.maPhieuNhap || item.maPhieu || "",
      nhaCungCapId: item.nhaCungCapId || "",
      nguoiLapId: item.nguoiLapId || item.nguoiDungId || "",
      ngayNhap: toInputDate(item.ngayNhap),
      tongTien: item.tongTien ?? tinhTongTien(chiTietDaMap),
      trangThai: item.trangThai || "ChoDuyet",
      ghiChu: item.ghiChu || "",
    });

    setChiTietPhieuNhap(chiTietDaMap);
    resetChiTietForm();
  };

  const handleAddChiTiet = () => {
    if (!chiTietForm.nguyenVatLieuId) {
      alert("Vui lòng chọn nguyên vật liệu");
      return;
    }

    if (Number(chiTietForm.soLuongNhap) <= 0) {
      alert("Số lượng nhập phải lớn hơn 0");
      return;
    }

    if (Number(chiTietForm.donGiaNhap) < 0) {
      alert("Đơn giá không được nhỏ hơn 0");
      return;
    }

    const nguyenVatLieuId = Number(chiTietForm.nguyenVatLieuId);

    const daTonTai = chiTietPhieuNhap.some(
      (item) => Number(item.nguyenVatLieuId) === nguyenVatLieuId
    );

    if (daTonTai) {
      alert("Nguyên vật liệu này đã có trong phiếu nhập");
      return;
    }

    const nguyenVatLieu = dsNguyenVatLieu.find(
      (item) => item.nguyenVatLieuId === nguyenVatLieuId
    );

    const chiTietMoi = {
      tempId: Date.now(),
      nguyenVatLieuId,
      maNguyenVatLieu:
        nguyenVatLieu?.maNguyenVatLieu ||
        nguyenVatLieu?.maNVL ||
        `NVL${nguyenVatLieuId}`,
      tenNguyenVatLieu: nguyenVatLieu?.tenNguyenVatLieu || "Không có",
      soLuongNhap: Number(chiTietForm.soLuongNhap),
      donGiaNhap: Number(chiTietForm.donGiaNhap),
      ghiChu: chiTietForm.ghiChu,
    };

    const dsMoi = [...chiTietPhieuNhap, chiTietMoi];
    const tongTienMoi = tinhTongTien(dsMoi);

    setChiTietPhieuNhap(dsMoi);
    setFormData({
      ...formData,
      tongTien: tongTienMoi,
    });

    resetChiTietForm();
  };

  const handleRemoveChiTiet = (tempId) => {
    const dsMoi = chiTietPhieuNhap.filter((item) => item.tempId !== tempId);
    const tongTienMoi = tinhTongTien(dsMoi);

    setChiTietPhieuNhap(dsMoi);
    setFormData({
      ...formData,
      tongTien: tongTienMoi,
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa phiếu nhập kho này không?"
    );

    if (!confirmDelete) return;

    try {
      const res = await axiosClient.delete(`/PhieuNhapKho/${id}`);

      alert(res.data?.message || "Xóa phiếu nhập kho thành công");

      loadAllData();
    } catch (error) {
      console.error("Lỗi xóa phiếu nhập kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      const data = error.response?.data;

      if (typeof data === "string") {
        alert(data);
      } else if (data?.innerError) {
        alert(data.innerError);
      } else if (data?.error) {
        alert(data.error);
      } else if (data?.message) {
        alert(data.message);
      } else if (data?.title) {
        alert(data.title);
      } else {
        alert("Không thể xóa phiếu nhập kho này");
      }
    }
  };

  const layThongBaoLoi = (error, fallback = "Có lỗi xảy ra.") => {
    const data = error.response?.data;

    if (typeof data === "string") return data;
    if (data?.innerError) return data.innerError;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.title) return data.title;

    if (data?.errors) {
      const firstError = Object.values(data.errors)?.[0]?.[0];
      return firstError || fallback;
    }

    return fallback;
  };

  const laLoiSaiKieuBodyDuyet = (error) => {
    const data = error.response?.data;
    const text = JSON.stringify(data || "").toLowerCase();

    return (
      error.response?.status === 400 &&
      (text.includes("system.int32") ||
        text.includes("could not be converted") ||
        text.includes("json value could not be converted") ||
        text.includes("the value could not be converted") ||
        text.includes("nguoiduyetid") ||
        text.includes("dto") ||
        text.includes("request body"))
    );
  };

  const handleDuyet = async (item) => {
    const trangThai = item.trangThai || "";

    if (trangThai === "DaDuyet") {
      alert("Phiếu nhập kho đã được duyệt trước đó.");
      return;
    }

    if (trangThai === "TuChoi") {
      alert("Không thể duyệt phiếu đã bị từ chối.");
      return;
    }

    if (dsNguoiDung.length === 0) {
      alert("Chưa có danh sách người dùng để chọn người duyệt.");
      return;
    }

    const danhSachNguoiDung = dsNguoiDung
      .map((user) => `${user.nguoiDungId} - ${user.hoTen || user.email}`)
      .join("\n");

    const nguoiDuyetMacDinh = dsNguoiDung[0]?.nguoiDungId || "";

    const nguoiDuyetIdNhap = window.prompt(
      `Nhập ID người duyệt, chỉ nhập số ID thôi nha:\n\n${danhSachNguoiDung}`,
      nguoiDuyetMacDinh
    );

    if (!nguoiDuyetIdNhap) return;

    const nguoiDuyetId = Number(nguoiDuyetIdNhap);

    if (!Number.isInteger(nguoiDuyetId) || nguoiDuyetId <= 0) {
      alert("ID người duyệt không hợp lệ. Chỉ nhập số, ví dụ: 1");
      return;
    }

    const nguoiDuyetTonTai = dsNguoiDung.some(
      (user) => Number(user.nguoiDungId) === nguoiDuyetId
    );

    if (!nguoiDuyetTonTai) {
      alert("ID người duyệt không tồn tại trong danh sách người dùng.");
      return;
    }

    const maPhieu =
      item.maPhieuNhapKho ||
      item.maPhieuNhap ||
      item.maPhieu ||
      `PNK${item.phieuNhapKhoId}`;

    const confirmDuyet = window.confirm(
      `Bạn có chắc muốn duyệt phiếu ${maPhieu} không?`
    );

    if (!confirmDuyet) return;

    const urlDuyet = `/PhieuNhapKho/${item.phieuNhapKhoId}/duyet`;

    console.log("URL DUYỆT:", urlDuyet);
    console.log("NGƯỜI DUYỆT ID:", nguoiDuyetId);

    try {
      /*
        Sửa lỗi 400 ở đây:
        Nếu controller đang khai báo dạng:
        DuyetPhieuNhapKho(int id, [FromBody] int nguoiDuyetId)

        Thì body phải gửi số trực tiếp: 1
        Không phải object: { nguoiDuyetId: 1 }
      */
      const res = await axiosClient.put(urlDuyet, nguoiDuyetId);

      alert(res.data?.message || "Duyệt phiếu nhập kho thành công.");

      loadAllData();
    } catch (error) {
      console.error("Lỗi duyệt phiếu nhập kho lần 1:", error);

      /*
        Nếu backend của bro lại dùng DTO:
        DuyetPhieuNhapKho(int id, [FromBody] DuyetPhieuNhapKhoDto dto)

        Thì thử lại bằng object.
      */
      if (laLoiSaiKieuBodyDuyet(error)) {
        try {
          const dataSendObject = {
            nguoiDuyetId: nguoiDuyetId,
          };

          console.log("THỬ DUYỆT LẦN 2 BẰNG OBJECT:", dataSendObject);

          const resThuLai = await axiosClient.put(urlDuyet, dataSendObject);

          alert(
            resThuLai.data?.message || "Duyệt phiếu nhập kho thành công."
          );

          loadAllData();
          return;
        } catch (errorThuLai) {
          console.error("Lỗi duyệt phiếu nhập kho lần 2:", errorThuLai);

          const dataThuLai = errorThuLai.response?.data;

          console.log("STATUS:", errorThuLai.response?.status);
          console.log("CHI TIẾT LỖI:", dataThuLai);
          console.log(
            "CHI TIẾT LỖI JSON:",
            JSON.stringify(dataThuLai, null, 2)
          );

          alert(
            layThongBaoLoi(
              errorThuLai,
              "Không thể duyệt phiếu nhập kho. Kiểm tra lại chi tiết phiếu hoặc trạng thái phiếu."
            )
          );
          return;
        }
      }

      const data = error.response?.data;

      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", data);
      console.log("CHI TIẾT LỖI JSON:", JSON.stringify(data, null, 2));

      alert(
        layThongBaoLoi(
          error,
          "Không thể duyệt phiếu nhập kho. Kiểm tra lại chi tiết phiếu hoặc trạng thái phiếu."
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nhaCungCapId) {
      alert("Vui lòng chọn nhà cung cấp");
      return;
    }

    if (!formData.nguoiLapId) {
      alert("Vui lòng chọn người lập");
      return;
    }

    if (chiTietPhieuNhap.length === 0) {
      alert("Phiếu nhập kho phải có ít nhất một nguyên vật liệu.");
      return;
    }

    const chiTietData = chiTietPhieuNhap.map((item) => ({
      nguyenVatLieuId: Number(item.nguyenVatLieuId),
      soLuongNhap: Number(item.soLuongNhap),
      donGiaNhap: Number(item.donGiaNhap),
      donGia: Number(item.donGiaNhap),
      ghiChu: item.ghiChu || "",
    }));

    const dataSend = {
      nhaCungCapId: Number(formData.nhaCungCapId),
      nguoiLapId: Number(formData.nguoiLapId),
      ghiChu: formData.ghiChu || "",
      chiTiet: chiTietData,
    };

    console.log("DATA GỬI LÊN:", dataSend);

    try {
      if (isEditing) {
        alert(
          "Controller hiện tại chưa có API PUT /PhieuNhapKho/{id}. Muốn cập nhật được thì cần bổ sung hàm Update bên BE."
        );
        return;
      } else {
        await axiosClient.post("/PhieuNhapKho", dataSend);
        alert("Thêm phiếu nhập kho thành công");
      }

      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Lỗi lưu phiếu nhập kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);
      console.log(
        "CHI TIẾT LỖI JSON:",
        JSON.stringify(error.response?.data, null, 2)
      );

      const data = error.response?.data;

      if (typeof data === "string") {
        alert(data);
      } else if (data?.innerError) {
        alert(data.innerError);
      } else if (data?.error) {
        alert(data.error);
      } else if (data?.message) {
        alert(data.message);
      } else if (data?.title) {
        alert(data.title);
      } else if (data?.errors) {
        const firstError = Object.values(data.errors)[0]?.[0];
        alert(firstError || "Dữ liệu chưa hợp lệ");
      } else {
        alert("Không thể lưu phiếu nhập kho");
      }
    }
  };

  const getTenNhaCungCap = (item) => {
    return (
      item.tenNhaCungCap ||
      item.nhaCungCap?.tenNhaCungCap ||
      "Không có"
    );
  };

  const getTenNguoiLap = (item) => {
    return (
      item.tenNguoiLap ||
      item.nguoiLap?.hoTen ||
      item.nguoiDung?.hoTen ||
      "Không có"
    );
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ddd",
    borderRadius: "6px",
  };

  const tableWrapperStyle = {
    width: "100%",
    overflowX: "auto",
  };

  const tableStyle = {
    minWidth: "1450px",
    width: "100%",
  };

  const stickyHeaderStyle = {
    position: "sticky",
    right: 0,
    background: "#1f2933",
    zIndex: 3,
  };

  const stickyCellStyle = {
    position: "sticky",
    right: 0,
    background: "#fff",
    zIndex: 2,
    display: "flex",
    gap: "8px",
    alignItems: "center",
    minHeight: "70px",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý phiếu nhập kho</h2>
          <p>Danh sách phiếu nhập nguyên vật liệu vào kho cà phê</p>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm phiếu nhập kho
        </button>
      </div>

      {showForm && (
        <div className="table-card" style={{ marginBottom: "20px" }}>
          <h3>
            {isEditing ? "Xem phiếu nhập kho" : "Thêm phiếu nhập kho"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Mã phiếu nhập kho</label>
              <input
                type="text"
                value={formData.maPhieuNhapKho}
                disabled
                placeholder="BE sẽ tự tạo mã phiếu"
                style={{
                  ...inputStyle,
                  backgroundColor: "#f3f4f6",
                  cursor: "not-allowed",
                }}
              />
              <small style={{ color: "#666" }}>
                Mã phiếu được backend tự tạo khi lưu.
              </small>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Nhà cung cấp</label>
              <select
                value={formData.nhaCungCapId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nhaCungCapId: e.target.value,
                  })
                }
                style={inputStyle}
                disabled={isEditing}
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {dsNhaCungCap.map((item) => (
                  <option key={item.nhaCungCapId} value={item.nhaCungCapId}>
                    {item.tenNhaCungCap}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Người lập</label>
              <select
                value={formData.nguoiLapId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nguoiLapId: e.target.value,
                  })
                }
                style={inputStyle}
                disabled={isEditing}
              >
                <option value="">-- Chọn người lập --</option>
                {dsNguoiDung.map((item) => (
                  <option key={item.nguoiDungId} value={item.nguoiDungId}>
                    {item.hoTen || item.tenNguoiDung || item.email}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Ngày nhập</label>
              <input
                type="date"
                value={formData.ngayNhap}
                disabled
                style={{
                  ...inputStyle,
                  backgroundColor: "#f3f4f6",
                  cursor: "not-allowed",
                }}
              />
              <small style={{ color: "#666" }}>
                Ngày nhập được backend tự lấy theo thời gian hiện tại.
              </small>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Trạng thái</label>
              <input
                type="text"
                value={formData.trangThai}
                disabled
                style={{
                  ...inputStyle,
                  backgroundColor: "#f3f4f6",
                  cursor: "not-allowed",
                }}
              />
              <small style={{ color: "#666" }}>
                Phiếu mới sẽ có trạng thái ChoDuyet.
              </small>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Ghi chú</label>
              <input
                type="text"
                value={formData.ghiChu}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ghiChu: e.target.value,
                  })
                }
                placeholder="Nhập ghi chú"
                style={inputStyle}
                disabled={isEditing}
              />
            </div>

            <hr style={{ margin: "24px 0" }} />

            <h3>Chi tiết phiếu nhập</h3>

            {!isEditing && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label>Nguyên vật liệu</label>
                  <select
                    value={chiTietForm.nguyenVatLieuId}
                    onChange={(e) =>
                      setChiTietForm({
                        ...chiTietForm,
                        nguyenVatLieuId: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="">-- Chọn nguyên vật liệu --</option>
                    {dsNguyenVatLieu.map((item) => (
                      <option
                        key={item.nguyenVatLieuId}
                        value={item.nguyenVatLieuId}
                      >
                        {item.maNguyenVatLieu || `NVL${item.nguyenVatLieuId}`} -{" "}
                        {item.tenNguyenVatLieu}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Số lượng nhập</label>
                  <input
                    type="number"
                    value={chiTietForm.soLuongNhap}
                    onChange={(e) =>
                      setChiTietForm({
                        ...chiTietForm,
                        soLuongNhap: e.target.value,
                      })
                    }
                    min="1"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Đơn giá nhập</label>
                  <input
                    type="number"
                    value={chiTietForm.donGiaNhap}
                    onChange={(e) =>
                      setChiTietForm({
                        ...chiTietForm,
                        donGiaNhap: e.target.value,
                      })
                    }
                    min="0"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Ghi chú chi tiết</label>
                  <input
                    type="text"
                    value={chiTietForm.ghiChu}
                    onChange={(e) =>
                      setChiTietForm({
                        ...chiTietForm,
                        ghiChu: e.target.value,
                      })
                    }
                    placeholder="Nhập ghi chú chi tiết"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="button"
                  className="btn-add"
                  onClick={handleAddChiTiet}
                  style={{ marginBottom: "16px" }}
                >
                  Thêm nguyên vật liệu vào phiếu
                </button>
              </>
            )}

            <div style={tableWrapperStyle}>
              <table className="data-table" style={{ minWidth: "900px" }}>
                <thead>
                  <tr>
                    <th>Mã NVL</th>
                    <th>Tên nguyên vật liệu</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Ghi chú</th>
                    {!isEditing && <th>Thao tác</th>}
                  </tr>
                </thead>

                <tbody>
                  {chiTietPhieuNhap.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isEditing ? "6" : "7"}
                        className="text-center"
                      >
                        Chưa có nguyên vật liệu trong phiếu
                      </td>
                    </tr>
                  ) : (
                    chiTietPhieuNhap.map((item) => (
                      <tr key={item.tempId}>
                        <td>{item.maNguyenVatLieu}</td>
                        <td>{item.tenNguyenVatLieu}</td>
                        <td>{item.soLuongNhap}</td>
                        <td>{formatMoney(item.donGiaNhap)} đ</td>
                        <td>
                          {formatMoney(
                            Number(item.soLuongNhap) * Number(item.donGiaNhap)
                          )}{" "}
                          đ
                        </td>
                        <td>{item.ghiChu || "Không có"}</td>
                        {!isEditing && (
                          <td>
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => handleRemoveChiTiet(item.tempId)}
                            >
                              Xóa
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ margin: "16px 0", fontWeight: "bold" }}>
              Tổng tiền: {formatMoney(tinhTongTien(chiTietPhieuNhap))} đ
            </div>

            <div>
              {!isEditing && (
                <button type="submit" className="btn-add">
                  Lưu
                </button>
              )}

              <button
                type="button"
                className="btn-delete"
                onClick={resetForm}
                style={{ marginLeft: isEditing ? "0" : "10px" }}
              >
                Đóng
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={tableWrapperStyle}>
            <table className="data-table" style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã phiếu</th>
                  <th>Nhà cung cấp</th>
                  <th>Người lập</th>
                  <th>Ngày nhập</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th style={stickyHeaderStyle}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {dsPhieuNhapKho.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  dsPhieuNhapKho.map((item) => (
                    <tr key={item.phieuNhapKhoId}>
                      <td>{item.phieuNhapKhoId}</td>

                      <td>
                        {item.maPhieuNhapKho ||
                          item.maPhieuNhap ||
                          item.maPhieu ||
                          `PNK${item.phieuNhapKhoId}`}
                      </td>

                      <td>{getTenNhaCungCap(item)}</td>

                      <td>{getTenNguoiLap(item)}</td>

                      <td>{formatDate(item.ngayNhap)}</td>

                      <td>{formatMoney(item.tongTien)} đ</td>

                      <td>{item.trangThai || "Không có"}</td>

                      <td>{item.ghiChu || "Không có"}</td>

                      <td style={stickyCellStyle}>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          Xem
                        </button>

                        {item.trangThai === "ChoDuyet" && (
                          <button
                            className="btn-add"
                            onClick={() => handleDuyet(item)}
                          >
                            Duyệt
                          </button>
                        )}

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item.phieuNhapKhoId)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhieuNhapKho;