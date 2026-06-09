import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function PhieuXuatKho() {
  const [dsPhieuXuatKho, setDsPhieuXuatKho] = useState([]);
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
  const coQuyenXuLy = isQuanLy || isNhanVienKho;

  const LY_DO_XUAT_HOP_LE = [
    "XuatPhaChe",
    "XuatHongHao",
    "XuatKiemKe",
    "XuatKhac",
  ];

  const [formData, setFormData] = useState({
    yeuCauXuatKhoId: "",
    nguoiLapId: nguoiDungIdHienTai ? String(nguoiDungIdHienTai) : "",
    lyDoXuat: "XuatPhaChe",
    ghiChu: "",
  });

  const [chiTietForm, setChiTietForm] = useState({
    nguyenVatLieuId: "",
    soLuongXuat: 1,
    ghiChu: "",
  });

  const [chiTietPhieuXuat, setChiTietPhieuXuat] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const loadAllData = async () => {
    setLoading(true);

    try {
      const resPhieuXuat = await axiosClient.get("/PhieuXuatKho").catch((err) => {
        console.error("Lỗi API PhieuXuatKho:", err);
        return { data: [] };
      });

      const resYeuCau = await axiosClient.get("/YeuCauXuatKho").catch((err) => {
        console.error("Lỗi API YeuCauXuatKho:", err);
        return { data: [] };
      });

      const resNguoiDung = await axiosClient.get("/NguoiDung").catch((err) => {
        console.error("Lỗi API NguoiDung:", err);
        return { data: [] };
      });

      const resNguyenVatLieu = await axiosClient
        .get("/NguyenVatLieu")
        .catch((err) => {
          console.error("Lỗi API NguyenVatLieu:", err);
          return { data: [] };
        });

      setDsPhieuXuatKho(normalizeList(resPhieuXuat.data));
      setDsYeuCauXuatKho(normalizeList(resYeuCau.data));
      setDsNguoiDung(normalizeList(resNguoiDung.data));
      setDsNguyenVatLieu(normalizeList(resNguyenVatLieu.data));
    } catch (error) {
      console.error("Lỗi tải dữ liệu phiếu xuất kho:", error);
      alert("Không thể tải dữ liệu phiếu xuất kho");
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

  const getTenNguoiDungTheoId = (id) => {
    const user = dsNguoiDung.find(
      (item) => Number(item.nguoiDungId) === Number(id)
    );

    if (!user) return localStorage.getItem("hoTen") || "Người dùng hiện tại";

    return user.hoTen || user.tenNguoiDung || user.email || "Không có";
  };

  const resetChiTietForm = () => {
    setChiTietForm({
      nguyenVatLieuId: "",
      soLuongXuat: 1,
      ghiChu: "",
    });
  };

  const resetForm = () => {
    setFormData({
      yeuCauXuatKhoId: "",
      nguoiLapId: nguoiDungIdHienTai ? String(nguoiDungIdHienTai) : "",
      lyDoXuat: "XuatPhaChe",
      ghiChu: "",
    });

    setChiTietPhieuXuat([]);
    resetChiTietForm();
    setShowForm(false);
    setIsViewing(false);
  };

  const handleOpenAdd = () => {
    if (!coQuyenXuLy) {
      alert("Bạn không có quyền lập phiếu xuất kho.");
      return;
    }

    resetForm();
    setShowForm(true);
    setIsViewing(false);
  };

  const getChiTietFromItem = (item) => {
    return (
      item.chiTiet ||
      item.chiTietPhieuXuatKhos ||
      item.chiTietPhieuXuatKho ||
      item.chiTiets ||
      []
    );
  };

  const getChiTietYeuCau = (item) => {
    return (
      item.chiTiet ||
      item.chiTietYeuCauXuatKhos ||
      item.chiTietYeuCauXuatKho ||
      item.chiTiets ||
      []
    );
  };

  const handleChangeYeuCau = (e) => {
    const yeuCauXuatKhoId = e.target.value;

    setFormData({
      ...formData,
      yeuCauXuatKhoId,
    });

    if (!yeuCauXuatKhoId) {
      setChiTietPhieuXuat([]);
      return;
    }

    const yeuCau = dsYeuCauXuatKho.find(
      (item) => Number(item.yeuCauXuatKhoId) === Number(yeuCauXuatKhoId)
    );

    if (!yeuCau) {
      setChiTietPhieuXuat([]);
      return;
    }

    if (yeuCau.trangThai !== "ChoXuLy") {
      alert("Chỉ nên lập phiếu từ yêu cầu đang chờ xử lý.");
    }

    const dsChiTiet = getChiTietYeuCau(yeuCau);

    const chiTietDaMap = dsChiTiet.map((ct, index) => {
      const nguyenVatLieuId = ct.nguyenVatLieuId;

      const nvl = dsNguyenVatLieu.find(
        (x) => Number(x.nguyenVatLieuId) === Number(nguyenVatLieuId)
      );

      return {
        tempId: ct.chiTietYeuCauXuatKhoId || `yc-${index}`,
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
        soLuongXuat: ct.soLuongYeuCau || ct.soLuongXuat || 1,
        ghiChu: ct.ghiChu || "",
      };
    });

    setChiTietPhieuXuat(chiTietDaMap);
  };

  const handleAddChiTiet = () => {
    if (!chiTietForm.nguyenVatLieuId) {
      alert("Vui lòng chọn nguyên vật liệu");
      return;
    }

    if (Number(chiTietForm.soLuongXuat) <= 0) {
      alert("Số lượng xuất phải lớn hơn 0");
      return;
    }

    const nguyenVatLieuId = Number(chiTietForm.nguyenVatLieuId);

    const daTonTai = chiTietPhieuXuat.some(
      (item) => Number(item.nguyenVatLieuId) === nguyenVatLieuId
    );

    if (daTonTai) {
      alert("Nguyên vật liệu này đã có trong phiếu xuất kho");
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
      Number(chiTietForm.soLuongXuat) > Number(nguyenVatLieu.tonHienTai || 0)
    ) {
      alert(
        `Số lượng xuất không được lớn hơn tồn hiện tại. Tồn hiện tại: ${formatNumber(
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
      soLuongXuat: Number(chiTietForm.soLuongXuat),
      ghiChu: chiTietForm.ghiChu,
    };

    setChiTietPhieuXuat([...chiTietPhieuXuat, chiTietMoi]);
    resetChiTietForm();
  };

  const handleRemoveChiTiet = (tempId) => {
    const dsMoi = chiTietPhieuXuat.filter((item) => item.tempId !== tempId);
    setChiTietPhieuXuat(dsMoi);
  };

  const handleView = (item) => {
    setShowForm(true);
    setIsViewing(true);

    setFormData({
      yeuCauXuatKhoId: item.yeuCauXuatKhoId || "",
      nguoiLapId: item.nguoiLapId || "",
      lyDoXuat: LY_DO_XUAT_HOP_LE.includes(item.lyDoXuat)
        ? item.lyDoXuat
        : "XuatPhaChe",
      ghiChu: item.ghiChu || "",
    });

    const dsChiTiet = getChiTietFromItem(item);

    const chiTietDaMap = dsChiTiet.map((ct, index) => {
      const nguyenVatLieuId = ct.nguyenVatLieuId;

      const nvl = dsNguyenVatLieu.find(
        (x) => Number(x.nguyenVatLieuId) === Number(nguyenVatLieuId)
      );

      return {
        tempId: ct.chiTietPhieuXuatKhoId || `old-${index}`,
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
        soLuongXuat: ct.soLuongXuat || 1,
        ghiChu: ct.ghiChu || "",
      };
    });

    setChiTietPhieuXuat(chiTietDaMap);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coQuyenXuLy) {
      alert("Bạn không có quyền lập phiếu xuất kho.");
      return;
    }

    if (!nguoiDungIdHienTai) {
      alert("Không xác định được người lập phiếu. Vui lòng đăng nhập lại.");
      return;
    }

    if (!formData.yeuCauXuatKhoId && chiTietPhieuXuat.length === 0) {
      alert("Phiếu xuất kho phải có ít nhất một nguyên vật liệu");
      return;
    }

    const lyDoXuatHopLe = LY_DO_XUAT_HOP_LE.includes(formData.lyDoXuat)
      ? formData.lyDoXuat
      : "XuatPhaChe";

    let chiTietData = chiTietPhieuXuat.map((item) => ({
      nguyenVatLieuId: Number(item.nguyenVatLieuId),
      soLuongXuat: Number(item.soLuongXuat),
      ghiChu: item.ghiChu || "",
    }));

    if (formData.yeuCauXuatKhoId) {
      chiTietData = [];
    }

    const dataSend = {
      yeuCauXuatKhoId: formData.yeuCauXuatKhoId
        ? Number(formData.yeuCauXuatKhoId)
        : null,
      nguoiLapId: nguoiDungIdHienTai,
      lyDoXuat: lyDoXuatHopLe,
      ghiChu: formData.ghiChu || "",
      chiTiet: chiTietData,
    };

    try {
      const res = await axiosClient.post("/PhieuXuatKho", dataSend);

      alert(res.data?.message || "Tạo phiếu xuất kho thành công");

      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Lỗi tạo phiếu xuất kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể tạo phiếu xuất kho"));
    }
  };

  const handleDuyet = async (item) => {
    if (!coQuyenXuLy) {
      alert("Bạn không có quyền duyệt phiếu xuất kho.");
      return;
    }

    if (item.trangThai !== "ChoDuyet") {
      alert("Chỉ có thể duyệt phiếu xuất kho đang chờ duyệt.");
      return;
    }

    if (!nguoiDungIdHienTai) {
      alert("Không xác định được người duyệt. Vui lòng đăng nhập lại.");
      return;
    }

    const confirmDuyet = window.confirm(
      `Bạn có chắc muốn duyệt phiếu ${item.maPhieuXuat} không?\n\nSau khi duyệt, tồn kho sẽ bị trừ.`
    );

    if (!confirmDuyet) return;

    try {
      const res = await axiosClient.put(
        `/PhieuXuatKho/${item.phieuXuatKhoId}/duyet`,
        {
          nguoiDuyetId: nguoiDungIdHienTai,
        }
      );

      alert(res.data?.message || "Duyệt phiếu xuất kho thành công");
      loadAllData();
    } catch (error) {
      console.error("Lỗi duyệt phiếu xuất kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể duyệt phiếu xuất kho"));
    }
  };

  const handleTuChoi = async (item) => {
    if (!coQuyenXuLy) {
      alert("Bạn không có quyền từ chối phiếu xuất kho.");
      return;
    }

    if (item.trangThai !== "ChoDuyet") {
      alert("Chỉ có thể từ chối phiếu xuất kho đang chờ duyệt.");
      return;
    }

    const lyDo = window.prompt(`Nhập lý do từ chối phiếu ${item.maPhieuXuat}:`);

    if (lyDo === null) return;

    const confirmTuChoi = window.confirm(
      `Bạn có chắc muốn từ chối phiếu ${item.maPhieuXuat} không?`
    );

    if (!confirmTuChoi) return;

    try {
      const res = await axiosClient.put(
        `/PhieuXuatKho/${item.phieuXuatKhoId}/tu-choi`,
        {
          lyDoTuChoi: lyDo,
        }
      );

      alert(res.data?.message || "Từ chối phiếu xuất kho thành công");
      loadAllData();
    } catch (error) {
      console.error("Lỗi từ chối phiếu xuất kho:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể từ chối phiếu xuất kho"));
    }
  };

  const getMaYeuCau = (item) => {
    return item.maYeuCau || item.maYeuCauXuatKho || "Không có";
  };

  const getTenNguoiLap = (item) => {
    return item.tenNguoiLap || item.nguoiLap?.hoTen || "Không có";
  };

  const getTenNguoiDuyet = (item) => {
    return item.tenNguoiDuyet || item.nguoiDuyet?.hoTen || "Chưa duyệt";
  };

  const dsYeuCauChoXuLy = dsYeuCauXuatKho.filter(
    (item) => item.trangThai === "ChoXuLy"
  );

  const tableStyle = {
    minWidth: "1050px",
    width: "100%",
  };

  const stickyHeaderStyle = {
    position: "sticky",
    right: 0,
    background: "#1f2933",
    zIndex: 3,
    width: "210px",
    minWidth: "210px",
    textAlign: "center",
  };

  const stickyCellStyle = {
    position: "sticky",
    right: 0,
    background: "#fff",
    zIndex: 2,
    width: "210px",
    minWidth: "210px",
    padding: "8px",
  };

  const actionButtonGroupStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    flexWrap: "nowrap",
  };

  const smallButtonStyle = {
    padding: "7px 10px",
    fontSize: "13px",
    lineHeight: "1",
    minWidth: "50px",
    height: "32px",
    borderRadius: "8px",
    whiteSpace: "nowrap",
  };

  return (
    <div className="page-container phieu-xuat-page">
      <div className="page-header">
        <div>
          <h2>Quản lý phiếu xuất kho</h2>
          <p>Danh sách phiếu xuất nguyên vật liệu khỏi kho</p>
        </div>

        {coQuyenXuLy && (
          <button className="btn-add" onClick={handleOpenAdd}>
            <i className="bi bi-plus-circle me-2"></i>
            Thêm phiếu xuất
          </button>
        )}
      </div>

      {showForm && (
        <div className="table-card form-card">
          <h3>{isViewing ? "Xem phiếu xuất kho" : "Thêm phiếu xuất kho"}</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Yêu cầu xuất kho</label>
                <select
                  value={formData.yeuCauXuatKhoId}
                  onChange={handleChangeYeuCau}
                  disabled={isViewing}
                >
                  <option value="">-- Không chọn / xuất trực tiếp --</option>

                  {dsYeuCauChoXuLy.length === 0 ? (
                    <option value="" disabled>
                      Không có yêu cầu nào đang chờ xử lý
                    </option>
                  ) : (
                    dsYeuCauChoXuLy.map((item) => (
                      <option
                        key={item.yeuCauXuatKhoId}
                        value={item.yeuCauXuatKhoId}
                      >
                        {item.maYeuCau || `YCXK${item.yeuCauXuatKhoId}`} -{" "}
                        {item.tenNguoiYeuCau || "Không có"} - {item.trangThai}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Người lập phiếu</label>
                <select value={formData.nguoiLapId} disabled>
                  <option value="">-- Không xác định --</option>

                  {dsNguoiDung.length === 0 ? (
                    <option value={nguoiDungIdHienTai}>
                      {nguoiDungIdHienTai} - {getTenNguoiDungTheoId(nguoiDungIdHienTai)}
                    </option>
                  ) : (
                    dsNguoiDung.map((item) => (
                      <option key={item.nguoiDungId} value={item.nguoiDungId}>
                        {item.nguoiDungId} -{" "}
                        {item.hoTen || item.tenNguoiDung || item.email}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Lý do xuất</label>
                <select
                  value={formData.lyDoXuat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lyDoXuat: e.target.value,
                    })
                  }
                  disabled={isViewing}
                >
                  <option value="XuatPhaChe">Xuất pha chế</option>
                  <option value="XuatHongHao">Xuất hỏng hao</option>
                  <option value="XuatKiemKe">Xuất kiểm kê</option>
                  <option value="XuatKhac">Xuất khác</option>
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
                  disabled={isViewing}
                />
              </div>
            </div>

            <hr className="form-divider" />

            <h3>Chi tiết phiếu xuất kho</h3>

            {!isViewing && !formData.yeuCauXuatKhoId && (
              <>
                <div className="form-grid detail-form-grid">
                  <div className="form-group">
                    <label>Nguyên vật liệu</label>
                    <select
                      value={chiTietForm.nguyenVatLieuId}
                      onChange={(e) =>
                        setChiTietForm({
                          ...chiTietForm,
                          nguyenVatLieuId: e.target.value,
                        })
                      }
                    >
                      <option value="">-- Chọn nguyên vật liệu --</option>

                      {dsNguyenVatLieu.length === 0 ? (
                        <option value="" disabled>
                          Chưa có dữ liệu nguyên vật liệu
                        </option>
                      ) : (
                        dsNguyenVatLieu.map((item) => (
                          <option
                            key={item.nguyenVatLieuId}
                            value={item.nguyenVatLieuId}
                          >
                            {item.maNguyenVatLieu ||
                              `NVL${item.nguyenVatLieuId}`}{" "}
                            - {item.tenNguyenVatLieu} | Tồn:{" "}
                            {formatNumber(item.tonHienTai)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Số lượng xuất</label>
                    <input
                      type="number"
                      value={chiTietForm.soLuongXuat}
                      onChange={(e) =>
                        setChiTietForm({
                          ...chiTietForm,
                          soLuongXuat: e.target.value,
                        })
                      }
                      min="1"
                    />
                  </div>

                  <div className="form-group">
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
                    />
                  </div>
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

            {formData.yeuCauXuatKhoId && !isViewing && (
              <p className="form-note">
                Phiếu đang lập từ yêu cầu xuất kho. Chi tiết bên dưới chỉ dùng
                để xem trước, khi lưu backend sẽ tự lấy chi tiết từ yêu cầu.
              </p>
            )}

            <div className="table-wrapper">
              <table className="data-table detail-table">
                <thead>
                  <tr>
                    <th>Mã NVL</th>
                    <th>Tên nguyên vật liệu</th>
                    <th>Tồn hiện tại</th>
                    <th>Số lượng xuất</th>
                    <th>Ghi chú</th>
                    {!isViewing && !formData.yeuCauXuatKhoId && (
                      <th>Thao tác</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {chiTietPhieuXuat.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          !isViewing && !formData.yeuCauXuatKhoId ? "6" : "5"
                        }
                        className="text-center"
                      >
                        Chưa có nguyên vật liệu trong phiếu
                      </td>
                    </tr>
                  ) : (
                    chiTietPhieuXuat.map((item) => (
                      <tr key={item.tempId}>
                        <td>{item.maNguyenVatLieu}</td>
                        <td>{item.tenNguyenVatLieu}</td>
                        <td>{formatNumber(item.tonHienTai)}</td>
                        <td>{formatNumber(item.soLuongXuat)}</td>
                        <td>{item.ghiChu || "Không có"}</td>

                        {!isViewing && !formData.yeuCauXuatKhoId && (
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

            <div className="form-actions">
              {!isViewing && (
                <button type="submit" className="btn-add">
                  Lưu
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
            <table className="data-table" style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã phiếu xuất</th>
                  <th>Mã yêu cầu</th>
                  <th>Người lập</th>
                  <th>Ngày xuất</th>
                  <th>Người duyệt</th>
                  <th>Ngày duyệt</th>
                  <th>Lý do xuất</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th style={stickyHeaderStyle}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {dsPhieuXuatKho.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  dsPhieuXuatKho.map((item) => (
                    <tr key={item.phieuXuatKhoId}>
                      <td>{item.phieuXuatKhoId}</td>
                      <td>{item.maPhieuXuat}</td>
                      <td>{getMaYeuCau(item)}</td>
                      <td>{getTenNguoiLap(item)}</td>
                      <td>{formatDate(item.ngayXuat)}</td>
                      <td>{getTenNguoiDuyet(item)}</td>
                      <td>{formatDate(item.ngayDuyet)}</td>
                      <td>{item.lyDoXuat || "Không có"}</td>
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

                          {coQuyenXuLy && item.trangThai === "ChoDuyet" && (
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

export default PhieuXuatKho;