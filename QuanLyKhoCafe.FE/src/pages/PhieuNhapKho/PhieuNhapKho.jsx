import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { showToast } from "../../components/Toast";

const emptyDetail = {
  nguyenVatLieuId: "",
  soLuongNhap: 1,
  donGia: 0,
  ghiChu: "",
};

const emptyForm = {
  nhaCungCapId: "",
  nguoiLapId: "",
  ngayNhap: new Date().toISOString().slice(0, 10),
  ghiChu: "",
};

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
        soLuongNhap: Number(ct.soLuongNhap || 0),
        donGia: Number(ct.donGiaNhap ?? ct.donGia ?? 0),
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
        soLuongNhap: Number(detailInput.soLuongNhap),
        donGia: Number(detailInput.donGia),
        ghiChu: detailInput.ghiChu || "",
      },
    ]);
    setDetailInput(emptyDetail);
  };

  const handleRemoveChiTiet = (tempId) => {
    setChiTietPhieuNhap((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const buildPayload = () => ({
    nhaCungCapId: Number(formData.nhaCungCapId),
    nguoiLapId: Number(formData.nguoiLapId),
    ngayNhap: formData.ngayNhap,
    ghiChu: formData.ghiChu || "",
    chiTiet: chiTietPhieuNhap.map((item) => ({
      nguyenVatLieuId: Number(item.nguyenVatLieuId),
      soLuongNhap: Number(item.soLuongNhap),
      donGia: Number(item.donGia),
      ghiChu: item.ghiChu || "",
    })),
  });

  const validateBeforeSubmit = () => {
    if (!formData.nhaCungCapId) return "Vui lòng chọn nhà cung cấp.";
    if (!formData.nguoiLapId) return "Vui lòng chọn người lập phiếu.";
    if (!formData.ngayNhap) return "Ngày nhập không được rỗng.";
    if (chiTietPhieuNhap.length === 0) return "Phiếu nhập phải có ít nhất một nguyên vật liệu.";
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
        <div className="table-card" style={{ marginBottom: "20px" }}>
          <h3>
            {modalMode === "view"
              ? "Chi tiết phiếu nhập kho"
              : modalMode === "edit"
                ? "Sửa phiếu nhập kho"
                : "Thêm phiếu nhập kho"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
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
                <label>Ghi chú</label>
                <input
                  type="text"
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  placeholder="Nhập ghi chú"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {!isReadOnly && (
              <div className="form-card">
                <h3>Thêm nguyên vật liệu</h3>
                <div className="form-grid detail-form-grid">
                  <div className="form-group">
                    <label>Nguyên vật liệu</label>
                    <select
                      value={detailInput.nguyenVatLieuId}
                      onChange={(e) => setDetailInput({ ...detailInput, nguyenVatLieuId: e.target.value })}
                    >
                      <option value="">-- Chọn nguyên vật liệu --</option>
                      {dsNguyenVatLieu.map((item) => (
                        <option key={item.nguyenVatLieuId} value={item.nguyenVatLieuId}>
                          {item.maNguyenVatLieu} - {item.tenNguyenVatLieu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Số lượng</label>
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
                </div>

                <button type="button" className="btn-add" onClick={handleAddChiTiet}>
                  Thêm dòng
                </button>
              </div>
            )}

            <div className="table-wrapper">
              <table className="data-table" style={{ minWidth: "900px" }}>
                <thead>
                  <tr>
                    <th>Mã NVL</th>
                    <th>Tên nguyên vật liệu</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th>Ghi chú</th>
                    {!isReadOnly && <th>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {chiTietPhieuNhap.length === 0 ? (
                    <tr>
                      <td colSpan={isReadOnly ? 6 : 7} className="text-center">
                        Chưa có nguyên vật liệu trong phiếu
                      </td>
                    </tr>
                  ) : (
                    chiTietPhieuNhap.map((item) => (
                      <tr key={item.tempId}>
                        <td>{item.maNguyenVatLieu}</td>
                        <td>{item.tenNguyenVatLieu}</td>
                        <td>{item.soLuongNhap}</td>
                        <td>{formatMoney(item.donGia)}</td>
                        <td>{formatMoney(Number(item.soLuongNhap) * Number(item.donGia))}</td>
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

            <div style={{ marginTop: 16, fontWeight: 800 }}>
              Tổng tiền: {formatMoney(tongTien)}
            </div>

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
