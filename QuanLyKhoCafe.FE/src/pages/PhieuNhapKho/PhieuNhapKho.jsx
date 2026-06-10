import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { showToast } from "../../components/Toast";

const emptyDetail = {
  nguyenVatLieuId: "",
  soLuongNhap: 1,
  donGia: 0,
  tinhTrangHang: "Dat",
  ghiChu: "",
};

const emptyForm = {
  nhaCungCapId: "",
  nguoiLapId: "",
  ngayNhap: new Date().toISOString().slice(0, 10),
  soChungTu: "",
  lyDoNhap: "Nhà cung cấp giao hàng",
  ghiChu: "",
};

const lyDoNhapOptions = [
  "Nhập bổ sung tồn kho",
  "Nhập đầu kỳ/đầu tuần",
  "Nhà cung cấp giao hàng",
  "Nhập bù hàng thiếu",
  "Khác",
];

const tinhTrangHangOptions = [
  { value: "Dat", label: "Đạt" },
  { value: "BaoBiRachNhe", label: "Bao bì rách nhẹ" },
  { value: "GiaoThieu", label: "Giao thiếu" },
  { value: "SaiLoai", label: "Sai loại" },
  { value: "GanHetHan", label: "Gần hết hạn" },
  { value: "Khac", label: "Khác" },
];

function normalizeRole(role) {
  return String(role || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function getAuthUser() {
  const keys = ["user", "authUser", "currentUser", "nguoiDung"];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return null;
}

function PhieuNhapKho() {
  const [dsPhieuNhapKho, setDsPhieuNhapKho] = useState([]);
  const [dsNhaCungCap, setDsNhaCungCap] = useState([]);
  const [dsNguoiDung, setDsNguoiDung] = useState([]);
  const [dsNguyenVatLieu, setDsNguyenVatLieu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [detailInput, setDetailInput] = useState(emptyDetail);
  const [chiTietPhieuNhap, setChiTietPhieuNhap] = useState([]);

  const authUser = getAuthUser();
  const currentUserId = Number(
    localStorage.getItem("nguoiDungId") ||
      authUser?.nguoiDungId ||
      authUser?.nguoiDungID ||
      authUser?.id ||
      0
  );
  const role = normalizeRole(
    localStorage.getItem("tenVaiTro") ||
      localStorage.getItem("role") ||
      localStorage.getItem("vaiTro") ||
      authUser?.tenVaiTro
  );

  const isQuanLyTiem = role === "quanlytiem";
  const isNhanVienKho = role === "nhanvienkho";
  const canCreate = isQuanLyTiem || isNhanVienKho;

  const activeNguyenVatLieu = useMemo(
    () =>
      dsNguyenVatLieu.filter(
        (item) => (item.trangThaiNguyenVatLieu || item.trangThai || "DangSuDung") !== "NgungSuDung"
      ),
    [dsNguyenVatLieu]
  );

  useEffect(() => {
    loadAllData();
  }, []);

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.innerError) return data.innerError;
    if (data?.title) return data.title;
    if (data?.errors) {
      const firstError = Object.values(data.errors)?.[0]?.[0];
      if (firstError) return firstError;
    }
    return fallback;
  };

  const loadAllData = async () => {
    setLoading(true);

    try {
      const [resPhieuNhap, resNhaCungCap, resNguoiDung, resNguyenVatLieu] =
        await Promise.all([
          axiosClient.get("/PhieuNhapKho"),
          axiosClient.get("/NhaCungCap"),
          axiosClient.get("/NguoiDung"),
          axiosClient.get("/NguyenVatLieu"),
        ]);

      setDsPhieuNhapKho(normalizeArray(resPhieuNhap.data));
      setDsNhaCungCap(normalizeArray(resNhaCungCap.data));
      setDsNguoiDung(normalizeArray(resNguoiDung.data));
      setDsNguyenVatLieu(normalizeArray(resNguyenVatLieu.data));
    } catch (error) {
      console.error("Lỗi tải dữ liệu phiếu nhập kho:", error);
      showToast("Không thể tải dữ liệu phiếu nhập kho.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const toInputDate = (date) => {
    if (!date) return new Date().toISOString().slice(0, 10);
    return new Date(date).toISOString().slice(0, 10);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatMoney = (money) => {
    return `${Number(money || 0).toLocaleString("vi-VN")} đ`;
  };

  const getTinhTrangLabel = (value) => {
    return tinhTrangHangOptions.find((item) => item.value === value)?.label || value || "-";
  };

  const getTenDonVi = (item) =>
    item?.tenDonVi ||
    item?.tenDonViTinh ||
    item?.donViTinh?.tenDonVi ||
    item?.donViTinh?.tenDonViTinh ||
    "";

  const formatStatus = (status) => {
    const map = {
      ChoDuyet: "Chờ duyệt",
      DaDuyet: "Đã duyệt",
      DaHuy: "Đã hủy",
      TuChoi: "Đã hủy",
    };
    return map[status] || status || "-";
  };

  const statusClass = (status) => {
    if (status === "DaDuyet") return "status-badge active";
    if (status === "ChoDuyet") return "dash-pill warning";
    return "status-badge locked";
  };

  const tinhTongTien = (details) => {
    return details.reduce((total, item) => {
      return total + Number(item.soLuongNhap || 0) * Number(item.donGia || 0);
    }, 0);
  };

  const resetForm = () => {
    setModalMode(null);
    setSelectedId(null);
    setFormData(emptyForm);
    setDetailInput(emptyDetail);
    setChiTietPhieuNhap([]);
  };

  const mapChiTiet = (item) => {
    const dsChiTiet = normalizeArray(
      item.chiTiet ||
        item.chiTietPhieuNhapKhos ||
        item.chiTietPhieuNhapKho ||
        item.chiTietPhieuNhaps ||
        item.chiTiets
    );

    return dsChiTiet.map((ct, index) => {
      const nguyenVatLieuId = Number(ct.nguyenVatLieuId);
      const nvl = dsNguyenVatLieu.find((x) => x.nguyenVatLieuId === nguyenVatLieuId);

      return {
        tempId: ct.chiTietPhieuNhapKhoId || `old-${index}`,
        nguyenVatLieuId,
        maNguyenVatLieu:
          ct.maNguyenVatLieu || nvl?.maNguyenVatLieu || `NVL${nguyenVatLieuId}`,
        tenNguyenVatLieu:
          ct.tenNguyenVatLieu || nvl?.tenNguyenVatLieu || "Không có",
        tenDonVi: ct.tenDonVi || getTenDonVi(nvl),
        soLuongNhap: Number(ct.soLuongNhap || 0),
        donGia: Number(ct.donGiaNhap ?? ct.donGia ?? 0),
        tinhTrangHang: "Dat",
        ghiChu: ct.ghiChu || "",
      };
    });
  };

  const openAdd = () => {
    setSelectedId(null);
    setModalMode("add");
    setFormData({
      ...emptyForm,
      nguoiLapId: currentUserId || "",
      ngayNhap: new Date().toISOString().slice(0, 10),
    });
    setDetailInput(emptyDetail);
    setChiTietPhieuNhap([]);
  };

  const openView = (item) => {
    setSelectedId(item.phieuNhapKhoId);
    setModalMode("view");
    setFormData({
      nhaCungCapId: item.nhaCungCapId || "",
      nguoiLapId: item.nguoiLapId || "",
      ngayNhap: toInputDate(item.ngayNhap),
      soChungTu: "",
      lyDoNhap: "Nhà cung cấp giao hàng",
      ghiChu: item.ghiChu || "",
    });
    setChiTietPhieuNhap(mapChiTiet(item));
  };

  const openEdit = (item) => {
    setSelectedId(item.phieuNhapKhoId);
    setModalMode("edit");
    setFormData({
      nhaCungCapId: item.nhaCungCapId || "",
      nguoiLapId: item.nguoiLapId || "",
      ngayNhap: toInputDate(item.ngayNhap),
      soChungTu: "",
      lyDoNhap: "Nhà cung cấp giao hàng",
      ghiChu: item.ghiChu || "",
    });
    setChiTietPhieuNhap(mapChiTiet(item));
  };

  const canEdit = (item) => {
    if (item.trangThai !== "ChoDuyet") return false;
    if (isQuanLyTiem) return true;
    return isNhanVienKho && Number(item.nguoiLapId) === currentUserId;
  };

  const canDelete = (item) => item.trangThai === "ChoDuyet" && (isQuanLyTiem || Number(item.nguoiLapId) === currentUserId);
  const canApprove = (item) => isQuanLyTiem && item.trangThai === "ChoDuyet";

  const handleAddChiTiet = () => {
    if (!detailInput.nguyenVatLieuId) {
      showToast("Vui lòng chọn nguyên vật liệu.", "danger");
      return;
    }

    if (Number(detailInput.soLuongNhap) <= 0) {
      showToast("Số lượng nhập phải lớn hơn 0.", "danger");
      return;
    }

    if (Number(detailInput.donGia) < 0) {
      showToast("Đơn giá nhập không được âm.", "danger");
      return;
    }

    const nguyenVatLieuId = Number(detailInput.nguyenVatLieuId);

    if (chiTietPhieuNhap.some((item) => Number(item.nguyenVatLieuId) === nguyenVatLieuId)) {
      showToast("Nguyên vật liệu bị trùng trong phiếu nhập.", "danger");
      return;
    }

    const nvl = dsNguyenVatLieu.find((item) => item.nguyenVatLieuId === nguyenVatLieuId);

    setChiTietPhieuNhap((prev) => [
      ...prev,
      {
        tempId: Date.now(),
        nguyenVatLieuId,
        maNguyenVatLieu: nvl?.maNguyenVatLieu || `NVL${nguyenVatLieuId}`,
        tenNguyenVatLieu: nvl?.tenNguyenVatLieu || "Không có",
        tenDonVi: getTenDonVi(nvl),
        soLuongNhap: Number(detailInput.soLuongNhap),
        donGia: Number(detailInput.donGia),
        tinhTrangHang: detailInput.tinhTrangHang,
        ghiChu: detailInput.ghiChu || "",
      },
    ]);
    setDetailInput(emptyDetail);
  };

  const handleRemoveChiTiet = (tempId) => {
    setChiTietPhieuNhap((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const buildPayload = () => {
    const ghiChuChung = [
      formData.lyDoNhap ? `Lý do nhập: ${formData.lyDoNhap}` : "",
      formData.soChungTu ? `Số chứng từ: ${formData.soChungTu}` : "",
      formData.ghiChu ? `Ghi chú: ${formData.ghiChu}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      nhaCungCapId: Number(formData.nhaCungCapId),
      nguoiLapId: Number(formData.nguoiLapId),
      ngayNhap: formData.ngayNhap,
      ghiChu: ghiChuChung,
      chiTiet: chiTietPhieuNhap.map((item) => ({
        nguyenVatLieuId: Number(item.nguyenVatLieuId),
        soLuongNhap: Number(item.soLuongNhap),
        donGia: Number(item.donGia),
        ghiChu: [
          item.tinhTrangHang ? `Tình trạng: ${getTinhTrangLabel(item.tinhTrangHang)}` : "",
          item.ghiChu ? `Ghi chú: ${item.ghiChu}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      })),
    };
  };

  const validateBeforeSubmit = () => {
    if (!formData.nhaCungCapId) return "Vui lòng chọn nhà cung cấp.";
    if (!formData.nguoiLapId) return "Vui lòng chọn người lập phiếu.";
    if (!formData.ngayNhap) return "Ngày nhập không được rỗng.";
    if (chiTietPhieuNhap.length === 0) return "Phiếu nhập phải có ít nhất một nguyên vật liệu.";
    const seenIds = new Set();
    for (const item of chiTietPhieuNhap) {
      if (!item.nguyenVatLieuId) return "Vui long chon nguyen vat lieu.";
      if (Number(item.soLuongNhap) <= 0) return "So luong nhap phai lon hon 0.";
      if (Number(item.donGia) < 0) return "Don gia nhap khong duoc am.";

      const nguyenVatLieuId = Number(item.nguyenVatLieuId);
      if (seenIds.has(nguyenVatLieuId)) return "Nguyen vat lieu bi trung trong phieu nhap.";
      seenIds.add(nguyenVatLieuId);
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateBeforeSubmit();
    if (error) {
      showToast(error, "danger");
      return;
    }

    try {
      if (modalMode === "edit") {
        await axiosClient.put(`/PhieuNhapKho/${selectedId}`, buildPayload());
        showToast("Cập nhật phiếu nhập kho thành công.");
      } else {
        await axiosClient.post("/PhieuNhapKho", buildPayload());
        showToast("Thêm phiếu nhập kho thành công.");
      }

      resetForm();
      loadAllData();
    } catch (errorSubmit) {
      showToast(
        getErrorMessage(errorSubmit, "Không thể lưu phiếu nhập kho."),
        "danger"
      );
    }
  };

  const handleApprove = async (item) => {
    try {
      await axiosClient.put(`/PhieuNhapKho/${item.phieuNhapKhoId}/duyet`, {
        nguoiDuyetId: currentUserId,
      });
      showToast("Duyệt phiếu nhập kho thành công.");
      loadAllData();
    } catch (error) {
      showToast(getErrorMessage(error, "Không thể duyệt phiếu nhập kho."), "danger");
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa phiếu ${item.maPhieuNhap || item.maPhieuNhapKho || item.phieuNhapKhoId}?`
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/PhieuNhapKho/${item.phieuNhapKhoId}`);
      showToast("Xóa phiếu nhập kho thành công.");
      loadAllData();
    } catch (error) {
      showToast(getErrorMessage(error, "Không thể xóa phiếu nhập kho."), "danger");
    }
  };

  const getTenNhaCungCap = (item) => item.tenNhaCungCap || item.nhaCungCap?.tenNhaCungCap || "-";
  const getTenNguoiLap = (item) => item.tenNguoiLap || item.nguoiLap?.hoTen || item.nguoiDung?.hoTen || "-";

  const tongTien = useMemo(() => tinhTongTien(chiTietPhieuNhap), [chiTietPhieuNhap]);
  const isReadOnly = modalMode === "view";

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý phiếu nhập kho</h2>
          <p>Tiếp nhận nguyên vật liệu từ nhà cung cấp và chờ quản lý duyệt nhập kho.</p>
        </div>

        {canCreate && (
          <button className="btn-add" onClick={openAdd}>
            <i className="bi bi-plus-circle me-2"></i>
            Thêm phiếu nhập
          </button>
        )}
      </div>

      {modalMode && (
        <div className="table-card receipt-modal-card" style={{ marginBottom: "20px" }}>
          <h3>
            {modalMode === "view"
              ? "Chi tiết phiếu nhập kho"
              : modalMode === "edit"
                ? "Sửa phiếu nhập kho"
                : "Thêm phiếu nhập kho"}
          </h3>
          <p className="receipt-modal-description">
            Ghi nhận nguyên vật liệu được nhà cung cấp giao vào kho.
          </p>

          <form onSubmit={handleSubmit} className="receipt-form">
            <section className="receipt-section">
              <div className="receipt-section-heading">
                <div>
                  <span>01</span>
                  <h4>Thông tin phiếu nhập</h4>
                </div>
                <p>Thông tin chung của chứng từ nhập kho.</p>
              </div>

              <div className="receipt-info-grid">
                <div className="form-group">
                  <label>Nhà cung cấp</label>
                  <select
                    value={formData.nhaCungCapId}
                    onChange={(e) => setFormData({ ...formData, nhaCungCapId: e.target.value })}
                    disabled={isReadOnly}
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {dsNhaCungCap.map((item) => (
                      <option key={item.nhaCungCapId} value={item.nhaCungCapId}>
                        {item.tenNhaCungCap}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Người lập</label>
                  <select
                    value={formData.nguoiLapId}
                    onChange={(e) => setFormData({ ...formData, nguoiLapId: e.target.value })}
                    disabled={isReadOnly || !isQuanLyTiem}
                  >
                    <option value="">-- Chọn người lập --</option>
                    {dsNguoiDung.map((item) => (
                      <option key={item.nguoiDungId} value={item.nguoiDungId}>
                        {item.hoTen || item.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ngày nhập</label>
                  <input
                    type="date"
                    value={formData.ngayNhap}
                    onChange={(e) => setFormData({ ...formData, ngayNhap: e.target.value })}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="form-group">
                  <label>Số chứng từ / hóa đơn</label>
                  <input
                    type="text"
                    value={formData.soChungTu}
                    onChange={(e) => setFormData({ ...formData, soChungTu: e.target.value })}
                    placeholder="Không bắt buộc"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="form-group">
                  <label>Lý do nhập</label>
                  <select
                    value={formData.lyDoNhap}
                    onChange={(e) => setFormData({ ...formData, lyDoNhap: e.target.value })}
                    disabled={isReadOnly}
                  >
                    {lyDoNhapOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <input
                    type="text"
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    placeholder="Không bắt buộc"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </section>

            {!isReadOnly && (
              <section className="receipt-section">
                <div className="receipt-section-heading">
                  <div>
                    <span>02</span>
                    <h4>Thêm nguyên vật liệu nhập kho</h4>
                  </div>
                  <p>Chọn nguyên vật liệu, số lượng, đơn giá và tình trạng hàng.</p>
                </div>

                <div className="receipt-line-grid">
                  <div className="form-group">
                    <label>Nguyên vật liệu</label>
                    <select
                      value={detailInput.nguyenVatLieuId}
                      onChange={(e) => setDetailInput({ ...detailInput, nguyenVatLieuId: e.target.value })}
                    >
                      <option value="">-- Chọn nguyên vật liệu --</option>
                      {activeNguyenVatLieu.map((item) => (
                        <option key={item.nguyenVatLieuId} value={item.nguyenVatLieuId}>
                          {item.maNguyenVatLieu} - {item.tenNguyenVatLieu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Đơn vị tính</label>
                    <input
                      value={
                        getTenDonVi(
                          dsNguyenVatLieu.find(
                            (item) => item.nguyenVatLieuId === Number(detailInput.nguyenVatLieuId)
                          )
                        ) ||
                        "Tự hiển thị"
                      }
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label>Số lượng nhập</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detailInput.soLuongNhap}
                      onChange={(e) => setDetailInput({ ...detailInput, soLuongNhap: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Đơn giá</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={detailInput.donGia}
                      onChange={(e) => setDetailInput({ ...detailInput, donGia: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Thành tiền</label>
                    <input
                      value={formatMoney(Number(detailInput.soLuongNhap || 0) * Number(detailInput.donGia || 0))}
                      disabled
                    />
                  </div>

                  <div className="form-group">
                    <label>Tình trạng hàng</label>
                    <select
                      value={detailInput.tinhTrangHang}
                      onChange={(e) => setDetailInput({ ...detailInput, tinhTrangHang: e.target.value })}
                    >
                      {tinhTrangHangOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group receipt-line-note">
                    <label>Ghi chú dòng hàng</label>
                    <input
                      type="text"
                      value={detailInput.ghiChu}
                      onChange={(e) => setDetailInput({ ...detailInput, ghiChu: e.target.value })}
                      placeholder="Ghi chú chất lượng hoặc chênh lệch"
                    />
                  </div>
                </div>

                <button type="button" className="btn-add" onClick={handleAddChiTiet}>
                  Thêm dòng
                </button>
              </section>
            )}

            <section className="receipt-section">
              <div className="receipt-section-heading">
                <div>
                  <span>03</span>
                  <h4>Danh sách nguyên vật liệu trong phiếu</h4>
                </div>
                <p>Tổng tiền được tự tính từ danh sách chi tiết.</p>
              </div>

              <div className="receipt-detail-table-wrap">
                <table className="receipt-detail-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã NVL</th>
                      <th>Tên nguyên vật liệu</th>
                      <th>Đơn vị</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th>Tình trạng</th>
                      <th>Ghi chú</th>
                      {!isReadOnly && <th>Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {chiTietPhieuNhap.length === 0 ? (
                      <tr>
                        <td colSpan={isReadOnly ? 9 : 10}>
                          <div className="receipt-empty-state">
                            Chưa có nguyên vật liệu trong phiếu. Vui lòng chọn nguyên vật liệu và bấm Thêm dòng.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      chiTietPhieuNhap.map((item, index) => (
                        <tr key={item.tempId}>
                          <td>{index + 1}</td>
                          <td>{item.maNguyenVatLieu}</td>
                          <td>{item.tenNguyenVatLieu}</td>
                          <td>{item.tenDonVi || "-"}</td>
                          <td>
                            {!isReadOnly ? (
                              <input
                                className="receipt-inline-input"
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.soLuongNhap}
                                onChange={(e) =>
                                  setChiTietPhieuNhap((prev) =>
                                    prev.map((row) =>
                                      row.tempId === item.tempId
                                        ? { ...row, soLuongNhap: Number(e.target.value) }
                                        : row
                                    )
                                  )
                                }
                              />
                            ) : (
                              item.soLuongNhap
                            )}
                          </td>
                          <td>
                            {!isReadOnly ? (
                              <input
                                className="receipt-inline-input"
                                type="number"
                                min="0"
                                step="1000"
                                value={item.donGia}
                                onChange={(e) =>
                                  setChiTietPhieuNhap((prev) =>
                                    prev.map((row) =>
                                      row.tempId === item.tempId
                                        ? { ...row, donGia: Number(e.target.value) }
                                        : row
                                    )
                                  )
                                }
                              />
                            ) : (
                              formatMoney(item.donGia)
                            )}
                          </td>
                          <td>{formatMoney(Number(item.soLuongNhap) * Number(item.donGia))}</td>
                          <td>{getTinhTrangLabel(item.tinhTrangHang)}</td>
                          <td>{item.ghiChu || "-"}</td>
                          {!isReadOnly && (
                            <td>
                              <button type="button" className="btn-delete" onClick={() => handleRemoveChiTiet(item.tempId)}>
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

              <div className="receipt-total-row">
                <span>Tổng tiền</span>
                <strong>{formatMoney(tongTien)}</strong>
              </div>
            </section>

            <div className="form-actions">
              {!isReadOnly && (
                <button type="submit" className="btn-add">
                  {modalMode === "edit" ? "Cập nhật" : "Lưu phiếu"}
                </button>
              )}
              <button type="button" className="btn-delete" onClick={resetForm}>
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
          <div className="table-wrapper">
            <table className="data-table" style={{ minWidth: "1280px" }}>
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
                  <th>Thao tác</th>
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
                      <td>{item.maPhieuNhap || item.maPhieuNhapKho || `PNK${item.phieuNhapKhoId}`}</td>
                      <td>{getTenNhaCungCap(item)}</td>
                      <td>{getTenNguoiLap(item)}</td>
                      <td>{formatDate(item.ngayNhap)}</td>
                      <td>{formatMoney(item.tongTien)}</td>
                      <td>
                        <span className={statusClass(item.trangThai)}>
                          {formatStatus(item.trangThai)}
                        </span>
                      </td>
                      <td>{item.ghiChu || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-view" onClick={() => openView(item)}>
                            Xem
                          </button>
                          {canEdit(item) && (
                            <button className="btn-edit" onClick={() => openEdit(item)}>
                              Sửa
                            </button>
                          )}
                          {canApprove(item) && (
                            <button className="btn-add" onClick={() => handleApprove(item)}>
                              Duyệt
                            </button>
                          )}
                          {canDelete(item) && (
                            <button className="btn-delete" onClick={() => handleDelete(item)}>
                              Xóa
                            </button>
                          )}
                        </div>
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
