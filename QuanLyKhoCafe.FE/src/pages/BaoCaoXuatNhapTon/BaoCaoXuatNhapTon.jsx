import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";

function BaoCaoNhapXuatTon() {
  const [loading, setLoading] = useState(false);
  const [dsTonKho, setDsTonKho] = useState([]);
  const [dsLichSuTonKho, setDsLichSuTonKho] = useState([]);
  const [keyword, setKeyword] = useState("");

  const getInputDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [tuNgay, setTuNgay] = useState(getInputDate(firstDayOfMonth));
  const [denNgay, setDenNgay] = useState(getInputDate(today));

  useEffect(() => {
    loadBaoCao();
  }, []);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const layThongBaoLoi = (error, fallback = "Có lỗi xảy ra.") => {
    const data = error.response?.data;

    if (typeof data === "string") return data;
    if (data?.innerError) return data.innerError;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.title) return data.title;

    return fallback;
  };

  const formatDateTime = (value) => {
    if (!value) return "Không có";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Không có";

    return date.toLocaleString("vi-VN");
  };

  const formatNumber = (number) => {
    if (number === null || number === undefined || number === "") return "0";

    return Number(number).toLocaleString("vi-VN");
  };

  const getTrangThaiTonKho = (item) => {
    const tonHienTai = Number(item.tonHienTai || 0);
    const tonToiThieu = Number(item.tonToiThieu || 0);

    if (tonHienTai <= 0) return "Hết hàng";
    if (tonToiThieu > 0 && tonHienTai <= tonToiThieu) return "Sắp hết";

    return "Bình thường";
  };

  const getTrangThaiClass = (item) => {
    const tonHienTai = Number(item.tonHienTai || 0);
    const tonToiThieu = Number(item.tonToiThieu || 0);

    if (tonHienTai <= 0) return "status-danger";
    if (tonToiThieu > 0 && tonHienTai <= tonToiThieu) return "status-warning";

    return "status-success";
  };

  const loadBaoCao = async () => {
    if (!tuNgay || !denNgay) {
      alert("Vui lòng chọn từ ngày và đến ngày");
      return;
    }

    if (new Date(tuNgay) > new Date(denNgay)) {
      alert("Từ ngày không được lớn hơn đến ngày");
      return;
    }

    setLoading(true);

    try {
      const [resTonKho, resLichSu] = await Promise.all([
        axiosClient.get("/TonKho"),
        axiosClient.get(
          `/LichSuTonKho/theo-khoang-ngay?tuNgay=${tuNgay}&denNgay=${denNgay}`
        ),
      ]);

      setDsTonKho(normalizeList(resTonKho.data));
      setDsLichSuTonKho(normalizeList(resLichSu.data));
    } catch (error) {
      console.error("Lỗi tải báo cáo nhập xuất tồn:", error);
      console.log("STATUS:", error.response?.status);
      console.log("CHI TIẾT LỖI:", error.response?.data);

      alert(layThongBaoLoi(error, "Không thể tải báo cáo nhập xuất tồn"));
    } finally {
      setLoading(false);
    }
  };

  const baoCaoRows = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return dsTonKho
      .map((nvl) => {
        const lichSuTheoNvl = dsLichSuTonKho.filter(
          (ls) => Number(ls.nguyenVatLieuId) === Number(nvl.nguyenVatLieuId)
        );

        const tongNhap = lichSuTheoNvl
          .filter((ls) => ls.loaiGiaoDich === "NhapKho")
          .reduce((sum, ls) => sum + Math.abs(Number(ls.soLuongThayDoi || 0)), 0);

        const tongXuat = lichSuTheoNvl
          .filter((ls) => ls.loaiGiaoDich === "XuatKho")
          .reduce((sum, ls) => sum + Math.abs(Number(ls.soLuongThayDoi || 0)), 0);

        const chenhLechKiemKe = lichSuTheoNvl
          .filter((ls) => ls.loaiGiaoDich === "KiemKe")
          .reduce((sum, ls) => sum + Number(ls.soLuongThayDoi || 0), 0);

        const tonHienTai = Number(nvl.tonHienTai || 0);

        const tonDauKy =
          tonHienTai - tongNhap + tongXuat - chenhLechKiemKe;

        return {
          ...nvl,
          tonDauKy,
          tongNhap,
          tongXuat,
          chenhLechKiemKe,
          tonHienTai,
        };
      })
      .filter((item) => {
        if (!lowerKeyword) return true;

        return (
          String(item.maNguyenVatLieu || "").toLowerCase().includes(lowerKeyword) ||
          String(item.tenNguyenVatLieu || "").toLowerCase().includes(lowerKeyword) ||
          String(item.tenNhom || "").toLowerCase().includes(lowerKeyword)
        );
      });
  }, [dsTonKho, dsLichSuTonKho, keyword]);

  const tongHop = useMemo(() => {
    return baoCaoRows.reduce(
      (result, item) => {
        result.tongNhap += Number(item.tongNhap || 0);
        result.tongXuat += Number(item.tongXuat || 0);
        result.chenhLechKiemKe += Number(item.chenhLechKiemKe || 0);
        result.tongTonHienTai += Number(item.tonHienTai || 0);

        return result;
      },
      {
        tongNhap: 0,
        tongXuat: 0,
        chenhLechKiemKe: 0,
        tongTonHienTai: 0,
      }
    );
  }, [baoCaoRows]);

  const lichSuGanDay = useMemo(() => {
    return [...dsLichSuTonKho]
      .sort((a, b) => new Date(b.thoiGian || 0) - new Date(a.thoiGian || 0))
      .slice(0, 30);
  }, [dsLichSuTonKho]);

  const cardStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  };

  const summaryCardStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
    border: "1px solid #eef2f7",
  };

  const tableStyle = {
    minWidth: "1200px",
    width: "100%",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Báo cáo nhập - xuất - tồn</h2>
          <p>
            Tổng hợp biến động tồn kho theo khoảng ngày dựa trên lịch sử tồn kho
          </p>
        </div>

        <button className="btn-add" onClick={loadBaoCao}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      <div className="table-card form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>Từ ngày</label>
            <input
              type="date"
              value={tuNgay}
              onChange={(e) => setTuNgay(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Đến ngày</label>
            <input
              type="date"
              value={denNgay}
              onChange={(e) => setDenNgay(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Tìm kiếm</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm mã, tên NVL, nhóm..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-add" onClick={loadBaoCao}>
            Xem báo cáo
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={summaryCardStyle}>
          <p>Tổng nhập</p>
          <h3>{formatNumber(tongHop.tongNhap)}</h3>
        </div>

        <div style={summaryCardStyle}>
          <p>Tổng xuất</p>
          <h3>{formatNumber(tongHop.tongXuat)}</h3>
        </div>

        <div style={summaryCardStyle}>
          <p>Chênh lệch kiểm kê</p>
          <h3>{formatNumber(tongHop.chenhLechKiemKe)}</h3>
        </div>

        <div style={summaryCardStyle}>
          <p>Tổng tồn hiện tại</p>
          <h3>{formatNumber(tongHop.tongTonHienTai)}</h3>
        </div>
      </div>

      <div className="table-card">
        <div className="page-header" style={{ marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: 0 }}>Bảng tổng hợp nhập - xuất - tồn</h3>
            <p>
              Giai đoạn: {tuNgay} đến {denNgay}
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <p>Đang tải báo cáo...</p>
          ) : (
            <table className="data-table" style={tableStyle}>
              <thead>
                <tr>
                  <th>Mã NVL</th>
                  <th>Tên nguyên vật liệu</th>
                  <th>Nhóm</th>
                  <th>Đơn vị</th>
                  <th>Tồn đầu kỳ ước tính</th>
                  <th>Tổng nhập</th>
                  <th>Tổng xuất</th>
                  <th>Chênh lệch kiểm kê</th>
                  <th>Tồn hiện tại</th>
                  <th>Tồn tối thiểu</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {baoCaoRows.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center">
                      Chưa có dữ liệu báo cáo
                    </td>
                  </tr>
                ) : (
                  baoCaoRows.map((item) => (
                    <tr key={item.nguyenVatLieuId}>
                      <td>{item.maNguyenVatLieu || "-"}</td>
                      <td>{item.tenNguyenVatLieu || "-"}</td>
                      <td>{item.tenNhom || "-"}</td>
                      <td>{item.tenDonVi || "-"}</td>
                      <td>{formatNumber(item.tonDauKy)}</td>
                      <td>{formatNumber(item.tongNhap)}</td>
                      <td>{formatNumber(item.tongXuat)}</td>
                      <td>{formatNumber(item.chenhLechKiemKe)}</td>
                      <td>{formatNumber(item.tonHienTai)}</td>
                      <td>{formatNumber(item.tonToiThieu)}</td>
                      <td>
                        <span className={getTrangThaiClass(item)}>
                          {getTrangThaiTonKho(item)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="table-card" style={{ marginTop: "18px" }}>
        <div className="page-header" style={{ marginBottom: "12px" }}>
          <div>
            <h3 style={{ margin: 0 }}>Chi tiết lịch sử tồn kho</h3>
            <p>Các giao dịch nhập, xuất, kiểm kê trong khoảng ngày đã chọn</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table" style={{ minWidth: "1100px" }}>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Mã NVL</th>
                <th>Tên nguyên vật liệu</th>
                <th>Loại giao dịch</th>
                <th>Thay đổi</th>
                <th>Tồn trước</th>
                <th>Tồn sau</th>
                <th>Người thực hiện</th>
                <th>Ghi chú</th>
              </tr>
            </thead>

            <tbody>
              {lichSuGanDay.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    Không có lịch sử tồn kho trong khoảng ngày này
                  </td>
                </tr>
              ) : (
                lichSuGanDay.map((item) => (
                  <tr key={item.lichSuTonKhoId}>
                    <td>{formatDateTime(item.thoiGian)}</td>
                    <td>{item.maNguyenVatLieu || "-"}</td>
                    <td>{item.tenNguyenVatLieu || "-"}</td>
                    <td>{item.loaiGiaoDich || "-"}</td>
                    <td>{formatNumber(item.soLuongThayDoi)}</td>
                    <td>{formatNumber(item.tonTruoc)}</td>
                    <td>{formatNumber(item.tonSau)}</td>
                    <td>{item.tenNguoiThucHien || "-"}</td>
                    <td>{item.ghiChu || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BaoCaoNhapXuatTon;