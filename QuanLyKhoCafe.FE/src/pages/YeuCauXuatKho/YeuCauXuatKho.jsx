import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";

function YeuCauXuatKho() {
  const [dsYeuCauXuatKho, setDsYeuCauXuatKho] = useState([]);
  const [dsNguoiDung, setDsNguoiDung] = useState([]);
  const [dsNguyenVatLieu, setDsNguyenVatLieu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  const tenVaiTro = localStorage.getItem("tenVaiTro") || "";
  const nguoiDungIdHienTai = Number(localStorage.getItem("nguoiDungId") || 0);

  const normalizeRole = (role) => {
    return String(role || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
  };

  const role = normalizeRole(tenVaiTro);

  const isQuanLy = role === "quanly" || role === "admin";
  const isNhanVienKho = role === "nhanvienkho";
  const isNhanVienPhaChe = role === "nhanvienphache";

  const coQuyenXuLy = isQuanLy || isNhanVienKho;

  const getNguoiYeuCauMacDinh = () => {
    if (isNhanVienPhaChe && nguoiDungIdHienTai > 0) {
      return String(nguoiDungIdHienTai);
    }

    return "";
  };

  const [formData, setFormData] = useState({
    nguoiYeuCauId: getNguoiYeuCauMacDinh(),
    ghiChu: "",
  });

  const [chiTietForm, setChiTietForm] = useState({
    nguyenVatLieuId: "",
    soLuongYeuCau: 1,
    ghiChu: "",
  });

  const [chiTietYeuCau, setChiTietYeuCau] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);

    try {
      const [resYeuCau, resNguoiDung, resNguyenVatLieu] = await Promise.all([
        axiosClient.get("/YeuCauXuatKho"),
        axiosClient.get("/NguoiDung"),
        axiosClient.get("/NguyenVatLieu"),
      ]);

      setDsYeuCauXuatKho(resYeuCau.data || []);
      setDsNguoiDung(resNguoiDung.data || []);
      setDsNguyenVatLieu(resNguyenVatLieu.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu yêu cầu xuất kho:", error);
      alert("Không thể tải dữ liệu yêu cầu xuất kho");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Không có";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatNumber = (number) => {
    if (number === null || number === undefined) return "0";
    return Number(number).toLocaleString("vi-VN");
  };

  const getNguoiYeuCauId = (item) => {
    return Number(
      item.nguoiYeuCauId ||
        item.nguoiYeuCau?.nguoiDungId ||
        item.nguoiDung?.nguoiDungId ||
        0
    );
  };

  const isYeuCauCuaNguoiDangNhap = (item) => {
    return getNguoiYeuCauId(item) === nguoiDungIdHienTai;
  };

  const dsYeuCauHienThi = useMemo(() => {
    if (isNhanVienPhaChe) {
      return dsYeuCauXuatKho.filter((item) => isYeuCauCuaNguoiDangNhap(item));
    }

    return dsYeuCauXuatKho;
  }, [dsYeuCauXuatKho, isNhanVienPhaChe, nguoiDungIdHienTai]);

  const dsNguoiDungHienThi = useMemo(() => {
    if (isNhanVienPhaChe) {
      return dsNguoiDung.filter(
        (item) => Number(item.nguoiDungId) === nguoiDungIdHienTai
      );
    }

    return dsNguoiDung;
  }, [dsNguoiDung, isNhanVienPhaChe, nguoiDungIdHienTai]);

  const resetChiTietForm = () => {
    setChiTietForm({
      nguyenVatLieuId: "",
      soLuongYeuCau: 1,
      ghiChu: "",
    });
  };

  const resetForm = () => {
    setFormData({
      nguoiYeuCauId: getNguoiYeuCauMacDinh(),
      ghiChu: "",
    });

    setChiTietYeuCau([]);
    resetChiTietForm();
    setShowForm(false);
    setIsViewing(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
    setIsViewing(false);
  };

  const getChiTietFromItem = (item) => {
    return (
      item.chiTiet ||
      item.chiTietYeuCauXuatKhos ||
      item.chiTietYeuCauXuatKho ||
      item.chiTiets ||
      []
    );
  };

  const handleView = (item) => {
    setShowForm(true);
    setIsViewing(true);

    setFormData({
      nguoiYeuCauId: item.nguoiYeuCauId || "",
      ghiChu: item.ghiChu || "",
    });

    const dsChiTiet = getChiTietFromItem(item);

    const chiTietDaMap = dsChiTiet.map((ct, index) => {
      const nguyenVatLieuId = ct.nguyenVatLieuId;

      const nvl = dsNguyenVatLieu.find(
        (x) => Number(x.nguyenVatLieuId) === Number(nguyenVatLieuId)
      );

      return {
        tempId: ct.chiTietYeuCauXuatKhoId || `old-${index}`,
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
        tonHienTai: nvl?.tonHienTai ?? ct.tonHienTai ?? 0,
        soLuongYeuCau: ct.soLuongYeuCau || 1,
        ghiChu: ct.ghiChu || "",
      };
    });

    setChiTietYeuCau(chiTietDaMap);
  };

  const handleAddChiTiet = () => {
    if (!chiTietForm.nguyenVatLieuId) {
      alert("Vui lòng chọn nguyên vật liệu");
      return;
    }

    if (Number(chiTietForm.soLuongYeuCau) <= 0) {
      alert("Số lượng yêu cầu phải lớn hơn 0");
      return;
    }

    const nguyenVatLieuId = Number(chiTietForm.nguyenVatLieuId);

    const daTonTai = chiTietYeuCau.some(
      (item) => Number(item.nguyenVatLieuId) === nguyenVatLieuId
    );

    if (daTonTai) {
      alert("Nguyên vật liệu này đã có trong yêu cầu xuất kho");
      return;
    }

    const nguyenVatLieu = dsNguyenVatLieu.find(
      (item) => Number(item.nguyenVatLieuId) === nguyenVatLieuId
    );

    if (!nguyenVatLieu) {
      alert("Không tìm thấy nguyên vật liệu");
      return;
    }

    if (
      Number(chiTietForm.soLuongYeuCau) >
      Number(nguyenVatLieu.tonHienTai || 0)
    ) {
      alert(
        `Số lượng yêu cầu không được lớn hơn tồn hiện tại. Tồn hiện tại: ${formatNumber(
          nguyenVatLieu.tonHienTai
        )}`
      );
      return;
    }

    const chiTietMoi = {
      tempId: Date.now(),
      nguyenVatLieuId,
      maNguyenVatLieu:
        nguyenVatLieu.maNguyenVatLieu ||
        nguyenVatLieu.maNVL ||
        `NVL${nguyenVatLieuId}`,
      tenNguyenVatLieu: nguyenVatLieu.tenNguyenVatLieu || "Không có",
      tonHienTai: nguyenVatLieu.tonHienTai ?? 0,
      soLuongYeuCau: Number(chiTietForm.soLuongYeuCau),
      ghiChu: chiTietForm.ghiChu,
    };

    setChiTietYeuCau([...chiTietYeuCau, chiTietMoi]);
    resetChiTietForm();
  };

  const handleRemoveChiTiet = (tempId) => {
    const dsMoi = chiTietYeuCau.filter((item) => item.tempId !== tempId);
    setChiTietYeuCau(dsMoi);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nguoiYeuCauId = isNhanVienPhaChe
      ? nguoiDungIdHienTai
      : Number(formData.nguoiYeuCauId);

    if (!nguoiYeuCauId) {
      alert("Vui lòng chọn người yêu cầu");
      return;
    }

    if (chiTietYeuCau.length === 0) {
      alert("Yêu cầu xuất kho phải có ít nhất một nguyên vật liệu");
      return;
    }

    const chiTietData = chiTietYeuCau.map((item) => ({
      nguyenVatLieuId: Number(item.nguyenVatLieuId),
      soLuongYeuCau: Number(item.soLuongYeuCau),
      ghiChu: item.ghiChu || "",
    }));

    const dataSend = {
      nguoiYeuCauId,
      ghiChu: formData.ghiChu || "",
      chiTiet: chiTietData,
    };

    try {
      const res = await axiosClient.post("/YeuCauXuatKho", dataSend);

      alert(res.data?.message || "Tạo yêu cầu xuất kho thành công");

      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Lỗi tạo yêu cầu xuất kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể tạo yêu cầu xuất kho"));
    }
  };

  const handleTuChoi = async (item) => {
    if (!coQuyenXuLy) {
      alert("Bạn không có quyền từ chối yêu cầu xuất kho.");
      return;
    }

    if (item.trangThai !== "ChoXuLy") {
      alert("Chỉ có thể từ chối yêu cầu đang chờ xử lý.");
      return;
    }

    const maYeuCau =
      item.maYeuCauXuatKho ||
      item.maYeuCau ||
      `YCXK${item.yeuCauXuatKhoId}`;

    const lyDo = window.prompt(`Nhập lý do từ chối yêu cầu ${maYeuCau}:`);

    if (lyDo === null) return;

    const confirmTuChoi = window.confirm(
      `Bạn có chắc muốn từ chối yêu cầu ${maYeuCau} không?`
    );

    if (!confirmTuChoi) return;

    try {
      const res = await axiosClient.put(
        `/YeuCauXuatKho/${item.yeuCauXuatKhoId}/tu-choi`,
        {
          lyDoTuChoi: lyDo,
        }
      );

      alert(res.data?.message || "Từ chối yêu cầu xuất kho thành công");
      loadAllData();
    } catch (error) {
      console.error("Lỗi từ chối yêu cầu xuất kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể từ chối yêu cầu xuất kho"));
    }
  };

  const handleDuyet = async (item) => {
    if (!coQuyenXuLy) {
      alert("Bạn không có quyền duyệt yêu cầu xuất kho.");
      return;
    }

    if (item.trangThai !== "ChoXuLy") {
      alert("Chỉ có thể duyệt yêu cầu đang chờ xử lý.");
      return;
    }

    if (!nguoiDungIdHienTai) {
      alert("Không xác định được người duyệt. Vui lòng đăng nhập lại.");
      return;
    }

    const maYeuCau =
      item.maYeuCauXuatKho ||
      item.maYeuCau ||
      `YCXK${item.yeuCauXuatKhoId}`;

    const confirmDuyet = window.confirm(
      `Bạn có chắc muốn duyệt yêu cầu ${maYeuCau} không?\n\nSau khi duyệt, tồn kho sẽ bị trừ theo số lượng yêu cầu.`
    );

    if (!confirmDuyet) return;

    try {
      const res = await axiosClient.put(
        `/YeuCauXuatKho/${item.yeuCauXuatKhoId}/duyet`,
        {
          nguoiDuyetId: nguoiDungIdHienTai,
        }
      );

      alert(res.data?.message || "Duyệt yêu cầu xuất kho thành công");
      loadAllData();
    } catch (error) {
      console.error("Lỗi duyệt yêu cầu xuất kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể duyệt yêu cầu xuất kho"));
    }
  };

  const handleDelete = async (item) => {
    const laYeuCauCuaMinh = isYeuCauCuaNguoiDangNhap(item);

    const duocXoa =
      coQuyenXuLy ||
      (isNhanVienPhaChe && laYeuCauCuaMinh && item.trangThai === "ChoXuLy");

    if (!duocXoa) {
      alert("Bạn không có quyền xóa yêu cầu này.");
      return;
    }

    const maYeuCau =
      item.maYeuCauXuatKho ||
      item.maYeuCau ||
      `YCXK${item.yeuCauXuatKhoId}`;

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa yêu cầu ${maYeuCau} không?`
    );

    if (!confirmDelete) return;

    try {
      const res = await axiosClient.delete(
        `/YeuCauXuatKho/${item.yeuCauXuatKhoId}`
      );

      alert(res.data?.message || "Xóa yêu cầu xuất kho thành công");
      loadAllData();
    } catch (error) {
      console.error("Lỗi xóa yêu cầu xuất kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể xóa yêu cầu xuất kho"));
    }
  };

  const getMaYeuCau = (item) => {
    return (
      item.maYeuCauXuatKho ||
      item.maYeuCau ||
      `YCXK${item.yeuCauXuatKhoId}`
    );
  };

  const getTenNguoiYeuCau = (item) => {
    return (
      item.tenNguoiYeuCau ||
      item.nguoiYeuCau?.hoTen ||
      item.nguoiDung?.hoTen ||
      "Không có"
    );
  };

  const getTenNguoiDuyet = (item) => {
    return item.tenNguoiDuyet || item.nguoiDuyet?.hoTen || "Chưa duyệt";
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
    minWidth: "1250px",
    width: "100%",
  };

  const stickyHeaderStyle = {
    position: "sticky",
    right: 0,
    background: "#1f2933",
    zIndex: 3,
    width: "260px",
    minWidth: "260px",
    textAlign: "center",
  };

  const stickyCellStyle = {
    position: "sticky",
    right: 0,
    background: "#fff",
    zIndex: 2,
    width: "260px",
    minWidth: "260px",
    padding: "10px 12px",
  };

  const actionButtonGroupStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "nowrap",
  };

  const smallButtonStyle = {
    padding: "7px 12px",
    fontSize: "14px",
    lineHeight: "1",
    minWidth: "58px",
    height: "34px",
    borderRadius: "8px",
    whiteSpace: "nowrap",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý yêu cầu xuất kho</h2>
          <p>
            {isNhanVienPhaChe
              ? "Danh sách yêu cầu xuất kho của bạn"
              : "Danh sách yêu cầu xuất nguyên vật liệu ra khỏi kho"}
          </p>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm yêu cầu
        </button>
      </div>

      {showForm && (
        <div className="table-card" style={{ marginBottom: "20px" }}>
          <h3>{isViewing ? "Xem yêu cầu xuất kho" : "Thêm yêu cầu xuất kho"}</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Người yêu cầu</label>
              <select
                value={formData.nguoiYeuCauId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nguoiYeuCauId: e.target.value,
                  })
                }
                style={inputStyle}
                disabled={isViewing || isNhanVienPhaChe}
              >
                <option value="">-- Chọn người yêu cầu --</option>
                {dsNguoiDungHienThi.map((item) => (
                  <option key={item.nguoiDungId} value={item.nguoiDungId}>
                    {item.hoTen || item.tenNguoiDung || item.email}
                  </option>
                ))}
              </select>
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
                disabled={isViewing}
              />
            </div>

            <hr style={{ margin: "24px 0" }} />

            <h3>Chi tiết yêu cầu xuất kho</h3>

            {!isViewing && (
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
                        {item.tenNguyenVatLieu} | Tồn:{" "}
                        {formatNumber(item.tonHienTai)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Số lượng yêu cầu</label>
                  <input
                    type="number"
                    value={chiTietForm.soLuongYeuCau}
                    onChange={(e) =>
                      setChiTietForm({
                        ...chiTietForm,
                        soLuongYeuCau: e.target.value,
                      })
                    }
                    min="1"
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
                  Thêm nguyên vật liệu vào yêu cầu
                </button>
              </>
            )}

            <div style={tableWrapperStyle}>
              <table className="data-table" style={{ minWidth: "900px" }}>
                <thead>
                  <tr>
                    <th>Mã NVL</th>
                    <th>Tên nguyên vật liệu</th>
                    <th>Tồn hiện tại</th>
                    <th>Số lượng yêu cầu</th>
                    <th>Ghi chú</th>
                    {!isViewing && <th>Thao tác</th>}
                  </tr>
                </thead>

                <tbody>
                  {chiTietYeuCau.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isViewing ? "5" : "6"}
                        className="text-center"
                      >
                        Chưa có nguyên vật liệu trong yêu cầu
                      </td>
                    </tr>
                  ) : (
                    chiTietYeuCau.map((item) => (
                      <tr key={item.tempId}>
                        <td>{item.maNguyenVatLieu}</td>
                        <td>{item.tenNguyenVatLieu}</td>
                        <td>{formatNumber(item.tonHienTai)}</td>
                        <td>{formatNumber(item.soLuongYeuCau)}</td>
                        <td>{item.ghiChu || "Không có"}</td>
                        {!isViewing && (
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

            <div style={{ marginTop: "16px" }}>
              {!isViewing && (
                <button type="submit" className="btn-add">
                  Lưu
                </button>
              )}

              <button
                type="button"
                className="btn-delete"
                onClick={resetForm}
                style={{ marginLeft: isViewing ? "0" : "10px" }}
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
                  <th>Mã yêu cầu</th>
                  <th>Người yêu cầu</th>
                  <th>Ngày yêu cầu</th>
                  <th>Người duyệt</th>
                  <th>Ngày duyệt</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th style={stickyHeaderStyle}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {dsYeuCauHienThi.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  dsYeuCauHienThi.map((item) => {
                    const laYeuCauCuaMinh = isYeuCauCuaNguoiDangNhap(item);

                    const duocXoa =
                      coQuyenXuLy ||
                      (isNhanVienPhaChe &&
                        laYeuCauCuaMinh &&
                        item.trangThai === "ChoXuLy");

                    return (
                      <tr key={item.yeuCauXuatKhoId}>
                        <td>{item.yeuCauXuatKhoId}</td>

                        <td>{getMaYeuCau(item)}</td>

                        <td>{getTenNguoiYeuCau(item)}</td>

                        <td>{formatDate(item.ngayYeuCau)}</td>

                        <td>{getTenNguoiDuyet(item)}</td>

                        <td>{formatDate(item.ngayDuyet)}</td>

                        <td>{item.trangThai || "Không có"}</td>

                        <td>{item.ghiChu || "Không có"}</td>

                        <td style={stickyCellStyle}>
                          <div style={actionButtonGroupStyle}>
                            <button
                              className="btn-edit"
                              style={smallButtonStyle}
                              onClick={() => handleView(item)}
                            >
                              Xem
                            </button>

                            {coQuyenXuLy && item.trangThai === "ChoXuLy" && (
                              <>
                                <button
                                  className="btn-add"
                                  style={smallButtonStyle}
                                  onClick={() => handleDuyet(item)}
                                >
                                  Duyệt
                                </button>

                                <button
                                  className="btn-delete"
                                  style={smallButtonStyle}
                                  onClick={() => handleTuChoi(item)}
                                >
                                  Từ chối
                                </button>
                              </>
                            )}

                            {duocXoa &&
                              !["DaDuyet", "DaLapPhieu"].includes(
                                item.trangThai
                              ) && (
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default YeuCauXuatKho;