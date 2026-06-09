import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function KiemKeKho() {
  const [dsKiemKeKho, setDsKiemKeKho] = useState([]);
  const [dsNguoiDung, setDsNguoiDung] = useState([]);
  const [dsTonKho, setDsTonKho] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [selectedPhieu, setSelectedPhieu] = useState(null);
  const [dsChiTietKiemKe, setDsChiTietKiemKe] = useState([]);

  const [formData, setFormData] = useState({
    maPhieuKiemKe: "",
    nguoiKiemKeId: "",
    ghiChu: "",
  });

  const [chiTietRows, setChiTietRows] = useState([
    {
      nguyenVatLieuId: "",
      soLuongThucTe: "",
      lyDoChenhLech: "",
    },
  ]);

  useEffect(() => {
    loadAllData();
  }, []);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const normalizeObject = (data) => {
    if (data?.data) return data.data;
    return data;
  };

  const loadAllData = async () => {
    setLoading(true);

    try {
      const [resKiemKe, resNguoiDung, resTonKho] = await Promise.all([
        axiosClient.get("/PhieuKiemKeKho"),
        axiosClient.get("/NguoiDung"),
        axiosClient.get("/TonKho"),
      ]);

      setDsKiemKeKho(normalizeList(resKiemKe.data));
      setDsNguoiDung(normalizeList(resNguoiDung.data));
      setDsTonKho(normalizeList(resTonKho.data));
    } catch (error) {
      console.error("Lỗi tải dữ liệu kiểm kê kho:", error);
      alert(layThongBaoLoi(error, "Không thể tải dữ liệu kiểm kê kho"));
    } finally {
      setLoading(false);
    }
  };

  const loadChiTietPhieu = async (phieuKiemKeKhoId) => {
    setLoadingDetail(true);

    try {
      const res = await axiosClient.get(`/PhieuKiemKeKho/${phieuKiemKeKhoId}`);
      const phieu = normalizeObject(res.data);

      setSelectedPhieu(phieu);
      setDsChiTietKiemKe(normalizeList(phieu?.chiTiet));
    } catch (error) {
      console.error("Lỗi tải chi tiết phiếu kiểm kê:", error);
      setDsChiTietKiemKe([]);
      alert(layThongBaoLoi(error, "Không thể tải chi tiết phiếu kiểm kê"));
    } finally {
      setLoadingDetail(false);
    }
  };

  const layThongBaoLoi = (error, fallback = "Có lỗi xảy ra.") => {
    const data = error.response?.data;

    if (typeof data === "string") return data;
    if (data?.innerError) return data.innerError;
    if (data?.error) return data.error;
    if (data?.message) return data.message;

    if (data?.errors) {
      const allErrors = Object.entries(data.errors)
        .flatMap(([field, messages]) => {
          const list = Array.isArray(messages) ? messages : [String(messages)];
          return list.map((msg) => `${field}: ${msg}`);
        })
        .join("\n");

      return allErrors || data?.title || fallback;
    }

    if (data?.title) return data.title;

    return fallback;
  };

  const formatDate = (date) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatNumber = (number) => {
    if (number === null || number === undefined || number === "") return "0";
    return Number(number).toLocaleString("vi-VN");
  };

  const getMaPhieu = (item) => {
    return (
      item?.maPhieuKiemKe ||
      item?.maPhieuKiemKeKho ||
      `PKK${item?.phieuKiemKeKhoId || ""}`
    );
  };

  const getTenNguoiKiemKe = (item) => {
    return item?.tenNguoiKiemKe || item?.nguoiKiemKe?.hoTen || "Không có";
  };

  const getTenNguoiXacNhan = (item) => {
    return (
      item?.tenNguoiXacNhan ||
      item?.nguoiXacNhan?.hoTen ||
      "Chưa xác nhận"
    );
  };

  const getTrangThaiLabel = (trangThai) => {
    switch (trangThai) {
      case "ChoXacNhan":
        return "Chờ xác nhận";
      case "DaXacNhan":
        return "Đã xác nhận";
      case "TuChoi":
        return "Từ chối";
      default:
        return trangThai || "Không có";
    }
  };

  const getTrangThaiClass = (trangThai) => {
    switch (trangThai) {
      case "ChoXacNhan":
        return "status-warning";
      case "DaXacNhan":
        return "status-success";
      case "TuChoi":
        return "status-danger";
      default:
        return "";
    }
  };

  const taoMaPhieuTam = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    return `PKK${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  };

  const handleOpenAdd = () => {
    setFormData({
      maPhieuKiemKe: taoMaPhieuTam(),
      nguoiKiemKeId: "",
      ghiChu: "",
    });

    setChiTietRows([
      {
        nguyenVatLieuId: "",
        soLuongThucTe: "",
        lyDoChenhLech: "",
      },
    ]);

    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      maPhieuKiemKe: "",
      nguoiKiemKeId: "",
      ghiChu: "",
    });

    setChiTietRows([
      {
        nguyenVatLieuId: "",
        soLuongThucTe: "",
        lyDoChenhLech: "",
      },
    ]);

    setShowForm(false);
  };

  const getNguyenVatLieuById = (nguyenVatLieuId) => {
    return dsTonKho.find(
      (item) => Number(item.nguyenVatLieuId) === Number(nguyenVatLieuId)
    );
  };

  const getChenhLechPreview = (row) => {
    if (!row.nguyenVatLieuId || row.soLuongThucTe === "") {
      return 0;
    }

    const nvl = getNguyenVatLieuById(row.nguyenVatLieuId);
    const tonHeThong = Number(nvl?.tonHienTai || 0);
    const soLuongThucTe = Number(row.soLuongThucTe || 0);

    return soLuongThucTe - tonHeThong;
  };

  const updateChiTietRow = (index, field, value) => {
    setChiTietRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        return {
          ...row,
          [field]: value,
        };
      })
    );
  };

  const addChiTietRow = () => {
    setChiTietRows((prev) => [
      ...prev,
      {
        nguyenVatLieuId: "",
        soLuongThucTe: "",
        lyDoChenhLech: "",
      },
    ]);
  };

  const removeChiTietRow = (index) => {
    if (chiTietRows.length === 1) {
      alert("Phiếu kiểm kê phải có ít nhất một nguyên vật liệu");
      return;
    }

    setChiTietRows((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.nguoiKiemKeId) {
      alert("Vui lòng chọn người kiểm kê");
      return false;
    }

    if (!chiTietRows || chiTietRows.length === 0) {
      alert("Phiếu kiểm kê phải có ít nhất một nguyên vật liệu");
      return false;
    }

    const ids = [];

    for (let i = 0; i < chiTietRows.length; i++) {
      const row = chiTietRows[i];

      if (!row.nguyenVatLieuId) {
        alert(`Dòng ${i + 1}: Vui lòng chọn nguyên vật liệu`);
        return false;
      }

      if (ids.includes(Number(row.nguyenVatLieuId))) {
        alert(`Dòng ${i + 1}: Nguyên vật liệu bị nhập trùng`);
        return false;
      }

      ids.push(Number(row.nguyenVatLieuId));

      if (row.soLuongThucTe === "" || Number(row.soLuongThucTe) < 0) {
        alert(`Dòng ${i + 1}: Số lượng thực tế không hợp lệ`);
        return false;
      }

      const chenhLech = getChenhLechPreview(row);

      if (chenhLech !== 0 && !row.lyDoChenhLech.trim()) {
        const nvl = getNguyenVatLieuById(row.nguyenVatLieuId);

        alert(
          `Dòng ${i + 1}: ${
            nvl?.tenNguyenVatLieu || "Nguyên vật liệu"
          } có chênh lệch nên phải nhập lý do`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const dataSend = {
      maPhieuKiemKe: formData.maPhieuKiemKe.trim(),
      nguoiKiemKeId: Number(formData.nguoiKiemKeId),
      ghiChu: formData.ghiChu || "",
      chiTiet: chiTietRows.map((row) => ({
        nguyenVatLieuId: Number(row.nguyenVatLieuId),
        soLuongThucTe: Number(row.soLuongThucTe),
        lyDoChenhLech: row.lyDoChenhLech || "",
      })),
    };

    console.log("DATA TẠO PHIẾU KIỂM KÊ:", dataSend);

    try {
      const res = await axiosClient.post("/PhieuKiemKeKho", dataSend);

      alert(res.data?.message || "Tạo phiếu kiểm kê thành công");

      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Lỗi tạo phiếu kiểm kê:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể tạo phiếu kiểm kê"));
    }
  };

  const handleOpenDetail = (item) => {
    setShowDetail(true);
    setSelectedPhieu(item);
    setDsChiTietKiemKe([]);
    loadChiTietPhieu(item.phieuKiemKeKhoId);
  };

  const handleDelete = async (item) => {
    if (item.trangThai === "DaXacNhan") {
      alert("Không thể xóa phiếu đã xác nhận vì đã ảnh hưởng tồn kho");
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa phiếu kiểm kê ${getMaPhieu(item)} không?`
    );

    if (!confirmDelete) return;

    try {
      const res = await axiosClient.delete(
        `/PhieuKiemKeKho/${item.phieuKiemKeKhoId}`
      );

      alert(res.data?.message || "Xóa phiếu kiểm kê thành công");

      if (
        selectedPhieu &&
        Number(selectedPhieu.phieuKiemKeKhoId) ===
          Number(item.phieuKiemKeKhoId)
      ) {
        setShowDetail(false);
        setSelectedPhieu(null);
        setDsChiTietKiemKe([]);
      }

      loadAllData();
    } catch (error) {
      console.error("Lỗi xóa phiếu kiểm kê:", error);
      alert(layThongBaoLoi(error, "Không thể xóa phiếu kiểm kê"));
    }
  };

  const chonNguoiXacNhan = () => {
    if (dsNguoiDung.length === 0) {
      alert("Chưa có danh sách người dùng để chọn người xác nhận");
      return null;
    }

    const danhSachNguoiDung = dsNguoiDung
      .map((user) => `${user.nguoiDungId} - ${user.hoTen || user.email}`)
      .join("\n");

    const nguoiXacNhanIdNhap = window.prompt(
      `Nhập ID người xác nhận:\n\n${danhSachNguoiDung}`,
      dsNguoiDung[0]?.nguoiDungId || ""
    );

    if (!nguoiXacNhanIdNhap) return null;

    const nguoiXacNhanId = Number(nguoiXacNhanIdNhap);

    if (!Number.isInteger(nguoiXacNhanId) || nguoiXacNhanId <= 0) {
      alert("ID người xác nhận không hợp lệ");
      return null;
    }

    const tonTai = dsNguoiDung.some(
      (user) => Number(user.nguoiDungId) === nguoiXacNhanId
    );

    if (!tonTai) {
      alert("ID người xác nhận không tồn tại");
      return null;
    }

    return nguoiXacNhanId;
  };

  const handleXacNhanPhieu = async (item) => {
    if (item.trangThai !== "ChoXacNhan") {
      alert("Chỉ có thể xác nhận phiếu đang chờ xác nhận");
      return;
    }

    const nguoiXacNhanId = chonNguoiXacNhan();

    if (!nguoiXacNhanId) return;

    const confirmXacNhan = window.confirm(
      `Bạn có chắc muốn xác nhận phiếu ${getMaPhieu(
        item
      )} không?\n\nSau khi xác nhận, tồn kho sẽ được cập nhật theo số lượng thực tế.`
    );

    if (!confirmXacNhan) return;

    try {
      const res = await axiosClient.put(
        `/PhieuKiemKeKho/${item.phieuKiemKeKhoId}/xac-nhan`,
        {
          nguoiXacNhanId,
        }
      );

      alert(res.data?.message || "Xác nhận phiếu kiểm kê thành công");

      await loadAllData();

      if (
        selectedPhieu &&
        Number(selectedPhieu.phieuKiemKeKhoId) ===
          Number(item.phieuKiemKeKhoId)
      ) {
        await loadChiTietPhieu(item.phieuKiemKeKhoId);
      }
    } catch (error) {
      console.error("Lỗi xác nhận phiếu kiểm kê:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể xác nhận phiếu kiểm kê"));
    }
  };

  const handleTuChoiPhieu = async (item) => {
    if (item.trangThai !== "ChoXacNhan") {
      alert("Chỉ có thể từ chối phiếu đang chờ xác nhận");
      return;
    }

    const nguoiXacNhanId = chonNguoiXacNhan();

    if (!nguoiXacNhanId) return;

    const ghiChu = window.prompt(
      `Nhập lý do từ chối phiếu ${getMaPhieu(item)}:`,
      "Không xác nhận số liệu kiểm kê"
    );

    if (ghiChu === null) return;

    const confirmTuChoi = window.confirm(
      `Bạn có chắc muốn từ chối phiếu ${getMaPhieu(item)} không?`
    );

    if (!confirmTuChoi) return;

    try {
      const res = await axiosClient.put(
        `/PhieuKiemKeKho/${item.phieuKiemKeKhoId}/tu-choi`,
        {
          nguoiXacNhanId,
          ghiChu,
        }
      );

      alert(res.data?.message || "Từ chối phiếu kiểm kê thành công");

      await loadAllData();

      if (
        selectedPhieu &&
        Number(selectedPhieu.phieuKiemKeKhoId) ===
          Number(item.phieuKiemKeKhoId)
      ) {
        await loadChiTietPhieu(item.phieuKiemKeKhoId);
      }
    } catch (error) {
      console.error("Lỗi từ chối phiếu kiểm kê:", error);
      alert(layThongBaoLoi(error, "Không thể từ chối phiếu kiểm kê"));
    }
  };

  const tableStyle = {
    minWidth: "1050px",
    width: "100%",
  };

  const detailTableStyle = {
    minWidth: "950px",
    width: "100%",
  };

  const actionButtonGroupStyle = {
    display: "flex",
    gap: "6px",
    flexWrap: "nowrap",
  };

  const smallButtonStyle = {
    padding: "7px 10px",
    fontSize: "13px",
    lineHeight: "1",
    minWidth: "56px",
    height: "32px",
    borderRadius: "8px",
    whiteSpace: "nowrap",
    marginBottom: 0,
  };

  const dsTonKhoDangSuDung = dsTonKho.filter(
    (item) => item.trangThaiNguyenVatLieu !== "NgungSuDung"
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý kiểm kê kho</h2>
          <p>Đối chiếu tồn hệ thống với số lượng thực tế trong kho</p>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm phiếu kiểm kê
        </button>
      </div>

      {showForm && (
        <div className="table-card form-card">
          <h3>Thêm phiếu kiểm kê</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Mã phiếu kiểm kê</label>
                <input
                  type="text"
                  value={formData.maPhieuKiemKe}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maPhieuKiemKe: e.target.value,
                    })
                  }
                  placeholder="Có thể để hệ thống tự tạo"
                />
              </div>

              <div className="form-group">
                <label>Người kiểm kê</label>
                <select
                  value={formData.nguoiKiemKeId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nguoiKiemKeId: e.target.value,
                    })
                  }
                >
                  <option value="">-- Chọn người kiểm kê --</option>

                  {dsNguoiDung.map((item) => (
                    <option key={item.nguoiDungId} value={item.nguoiDungId}>
                      {item.nguoiDungId} -{" "}
                      {item.hoTen || item.tenNguoiDung || item.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
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
                />
              </div>
            </div>

            <div style={{ marginTop: "18px" }}>
              <h4>Chi tiết kiểm kê</h4>

              {chiTietRows.map((row, index) => {
                const nvl = getNguyenVatLieuById(row.nguyenVatLieuId);
                const chenhLech = getChenhLechPreview(row);

                return (
                  <div
                    key={index}
                    className="table-card"
                    style={{ marginBottom: "12px", padding: "14px" }}
                  >
                    <div className="form-grid detail-form-grid">
                      <div className="form-group">
                        <label>Nguyên vật liệu</label>
                        <select
                          value={row.nguyenVatLieuId}
                          onChange={(e) =>
                            updateChiTietRow(
                              index,
                              "nguyenVatLieuId",
                              e.target.value
                            )
                          }
                        >
                          <option value="">-- Chọn nguyên vật liệu --</option>

                          {dsTonKhoDangSuDung.map((item) => (
                            <option
                              key={item.nguyenVatLieuId}
                              value={item.nguyenVatLieuId}
                            >
                              {item.maNguyenVatLieu} - {item.tenNguyenVatLieu} |
                              Tồn: {formatNumber(item.tonHienTai)}{" "}
                              {item.tenDonVi}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Số lượng thực tế</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.soLuongThucTe}
                          onChange={(e) =>
                            updateChiTietRow(
                              index,
                              "soLuongThucTe",
                              e.target.value
                            )
                          }
                          placeholder="Nhập số lượng thực tế"
                        />
                      </div>

                      <div className="form-group">
                        <label>Lý do chênh lệch</label>
                        <input
                          type="text"
                          value={row.lyDoChenhLech}
                          onChange={(e) =>
                            updateChiTietRow(
                              index,
                              "lyDoChenhLech",
                              e.target.value
                            )
                          }
                          placeholder="Bắt buộc nếu có chênh lệch"
                        />
                      </div>
                    </div>

                    <p className="form-note">
                      Dòng {index + 1}:{" "}
                      <b>{nvl?.tenNguyenVatLieu || "Chưa chọn NVL"}</b> | SL hệ
                      thống: <b>{formatNumber(nvl?.tonHienTai || 0)}</b> | SL
                      thực tế:{" "}
                      <b>
                        {row.soLuongThucTe === ""
                          ? "Chưa nhập"
                          : formatNumber(row.soLuongThucTe)}
                      </b>{" "}
                      | Chênh lệch:{" "}
                      <b>
                        {row.soLuongThucTe === ""
                          ? "Chưa nhập"
                          : formatNumber(chenhLech)}
                      </b>
                    </p>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => removeChiTietRow(index)}
                      >
                        Xóa dòng
                      </button>
                    </div>
                  </div>
                );
              })}

              <button type="button" className="btn-edit" onClick={addChiTietRow}>
                <i className="bi bi-plus-circle me-2"></i>
                Thêm nguyên vật liệu
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-add">
                Lưu phiếu kiểm kê
              </button>

              <button type="button" className="btn-delete" onClick={resetForm}>
                Đóng
              </button>
            </div>
          </form>
        </div>
      )}

      {showDetail && selectedPhieu && (
        <div className="table-card form-card">
          <div className="page-header" style={{ marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Chi tiết phiếu kiểm kê: {getMaPhieu(selectedPhieu)}
              </h3>
              <p>
                Trạng thái:{" "}
                <b className={getTrangThaiClass(selectedPhieu.trangThai)}>
                  {getTrangThaiLabel(selectedPhieu.trangThai)}
                </b>
              </p>
            </div>

            <button
              type="button"
              className="btn-delete"
              onClick={() => {
                setShowDetail(false);
                setSelectedPhieu(null);
                setDsChiTietKiemKe([]);
              }}
            >
              Đóng chi tiết
            </button>
          </div>

          <div className="table-wrapper" style={{ marginTop: "18px" }}>
            {loadingDetail ? (
              <p>Đang tải chi tiết...</p>
            ) : (
              <table className="data-table" style={detailTableStyle}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mã NVL</th>
                    <th>Tên nguyên vật liệu</th>
                    <th>Đơn vị</th>
                    <th>SL hệ thống</th>
                    <th>SL thực tế</th>
                    <th>Chênh lệch</th>
                    <th>Lý do</th>
                  </tr>
                </thead>

                <tbody>
                  {dsChiTietKiemKe.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Chưa có chi tiết kiểm kê
                      </td>
                    </tr>
                  ) : (
                    dsChiTietKiemKe.map((item) => (
                      <tr key={item.chiTietPhieuKiemKeKhoId}>
                        <td>{item.chiTietPhieuKiemKeKhoId}</td>
                        <td>{item.maNguyenVatLieu || "Không có"}</td>
                        <td>{item.tenNguyenVatLieu || "Không có"}</td>
                        <td>{item.tenDonVi || "Không có"}</td>
                        <td>{formatNumber(item.soLuongHeThong)}</td>
                        <td>{formatNumber(item.soLuongThucTe)}</td>
                        <td>{formatNumber(item.chenhLech)}</td>
                        <td>{item.lyDoChenhLech || "Không có"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table" style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã phiếu</th>
                  <th>Người kiểm kê</th>
                  <th>Ngày kiểm kê</th>
                  <th>Người xác nhận</th>
                  <th>Ngày xác nhận</th>
                  <th>Trạng thái</th>
                  <th>Số dòng</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {dsKiemKeKho.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  dsKiemKeKho.map((item) => (
                    <tr key={item.phieuKiemKeKhoId}>
                      <td>{item.phieuKiemKeKhoId}</td>
                      <td>{getMaPhieu(item)}</td>
                      <td>{getTenNguoiKiemKe(item)}</td>
                      <td>{formatDate(item.ngayKiemKe)}</td>
                      <td>{getTenNguoiXacNhan(item)}</td>
                      <td>{formatDate(item.ngayXacNhan)}</td>
                      <td>
                        <span className={getTrangThaiClass(item.trangThai)}>
                          {getTrangThaiLabel(item.trangThai)}
                        </span>
                      </td>
                      <td>{item.soDongChiTiet ?? "Không có"}</td>
                      <td>{item.ghiChu || "Không có"}</td>
                      <td>
                        <div style={actionButtonGroupStyle}>
                          <button
                            className="btn-edit"
                            style={smallButtonStyle}
                            onClick={() => handleOpenDetail(item)}
                          >
                            Chi tiết
                          </button>

                          {item.trangThai === "ChoXacNhan" && (
                            <>
                              <button
                                className="btn-add"
                                style={smallButtonStyle}
                                onClick={() => handleXacNhanPhieu(item)}
                              >
                                Xác nhận
                              </button>

                              <button
                                className="btn-edit"
                                style={smallButtonStyle}
                                onClick={() => handleTuChoiPhieu(item)}
                              >
                                Từ chối
                              </button>
                            </>
                          )}

                          {item.trangThai !== "DaXacNhan" && (
                            <button
                              className="btn-delete"
                              style={smallButtonStyle}
                              onClick={() => handleDelete(item)}
                            >
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

export default KiemKeKho;