import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { showToast } from "../components/Toast";

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dsTonKho, setDsTonKho] = useState([]);
  const [phieuNhapKho, setPhieuNhapKho] = useState([]);
  const [yeuCauXuatKho, setYeuCauXuatKho] = useState([]);
  const [phieuXuatKho, setPhieuXuatKho] = useState([]);
  const [phieuKiemKeKho, setPhieuKiemKeKho] = useState([]);
  const [lichSuTonKho, setLichSuTonKho] = useState([]);
  const [nguoiDung, setNguoiDung] = useState([]);

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  const fetchArray = async (...urls) => {
    for (const url of urls) {
      try {
        const res = await axiosClient.get(url);
        return normalizeArray(res.data);
      } catch (error) {
        console.warn(`Không tải được ${url}:`, error);
      }
    }

    return [];
  };

  const loadDashboard = async (showSuccessToast = false) => {
    try {
      setLoading(true);

      const [tonKho, pnk, ycxk, pxk, pkk, lstk, nd] = await Promise.all([
        fetchArray("/TonKho", "/NguyenVatLieu"),
        fetchArray("/PhieuNhapKho"),
        fetchArray("/YeuCauXuatKho"),
        fetchArray("/PhieuXuatKho"),
        fetchArray("/PhieuKiemKeKho"),
        fetchArray("/LichSuTonKho"),
        fetchArray("/NguoiDung"),
      ]);

      setDsTonKho(tonKho);
      setPhieuNhapKho(pnk);
      setYeuCauXuatKho(ycxk);
      setPhieuXuatKho(pxk);
      setPhieuKiemKeKho(pkk);
      setLichSuTonKho(lstk);
      setNguoiDung(nd);

      if (showSuccessToast) {
        showToast("Đã làm mới dữ liệu dashboard.");
      }
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
      showToast("Không tải được dữ liệu tổng quan.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("vi-VN");
  };

  const formatNumber = (number) => {
    if (number === null || number === undefined || number === "") return "0";
    return Number(number).toLocaleString("vi-VN");
  };

  const getStatusLabel = (status) => {
    const map = {
      ChoDuyet: "Chờ duyệt",
      DaDuyet: "Đã duyệt",
      DaHuy: "Đã hủy",
      ChoXuLy: "Chờ xử lý",
      DaLapPhieu: "Đã lập phiếu",
      ChoXacNhan: "Chờ xác nhận",
      DaXacNhan: "Đã xác nhận",
      TuChoi: "Từ chối",
      HoatDong: "Hoạt động",
      Khoa: "Khóa",
      DangSuDung: "Đang sử dụng",
      NgungSuDung: "Ngừng sử dụng",
      BinhThuong: "Bình thường",
      SapHet: "Sắp hết",
      HetHang: "Hết hàng",
    };

    return map[status] || status || "-";
  };

  const getStatusClass = (status) => {
    const text = String(status || "").toLowerCase();
    if (text.includes("huy") || text.includes("khoa") || text.includes("tu") || text.includes("ngung") || text.includes("het")) return "danger";
    if (text.includes("cho") || text.includes("sap")) return "warning";
    if (text.includes("da") || text.includes("binh") || text.includes("dang") || text.includes("hoat")) return "success";
    return "neutral";
  };

  const getTonHienTai = (item) => Number(item.tonHienTai ?? item.soLuongTon ?? item.soLuong ?? 0);
  const getTonToiThieu = (item) => Number(item.tonToiThieu ?? item.mucTonToiThieu ?? 0);
  const getMaPhieuNhap = (item) => item.maPhieuNhap || item.maPhieuNhapKho || `PNK-${item.phieuNhapKhoId || ""}`;
  const getMaYeuCauXuat = (item) => item.maYeuCau || item.maYeuCauXuatKho || `YCXK-${item.yeuCauXuatKhoId || ""}`;
  const getMaPhieuXuat = (item) => item.maPhieuXuat || item.maPhieuXuatKho || `PXK-${item.phieuXuatKhoId || ""}`;
  const getMaPhieuKiemKe = (item) => item.maPhieuKiemKe || item.maPhieuKiemKeKho || `PKK-${item.phieuKiemKeKhoId || ""}`;

  const tonThapList = useMemo(() => {
    return dsTonKho.filter((item) => {
      const tonHienTai = getTonHienTai(item);
      const tonToiThieu = getTonToiThieu(item);
      const trangThai = String(item.trangThaiTonKho || "").toLowerCase();

      return (
        trangThai.includes("saphet") ||
        trangThai.includes("het") ||
        trangThai.includes("thap") ||
        trangThai.includes("canhbao") ||
        trangThai.includes("thieu") ||
        (tonToiThieu > 0 && tonHienTai <= tonToiThieu)
      );
    });
  }, [dsTonKho]);

  const hetHangList = useMemo(() => dsTonKho.filter((item) => getTonHienTai(item) <= 0), [dsTonKho]);
  const phieuNhapChoDuyet = useMemo(() => phieuNhapKho.filter((item) => item.trangThai === "ChoDuyet"), [phieuNhapKho]);
  const yeuCauXuatChoXuLy = useMemo(() => yeuCauXuatKho.filter((item) => item.trangThai === "ChoXuLy"), [yeuCauXuatKho]);
  const phieuXuatChoDuyet = useMemo(() => phieuXuatKho.filter((item) => item.trangThai === "ChoDuyet"), [phieuXuatKho]);
  const kiemKeChoXacNhan = useMemo(() => phieuKiemKeKho.filter((item) => item.trangThai === "ChoXacNhan"), [phieuKiemKeKho]);

  const recentActivities = useMemo(() => {
    const list = [];

    phieuNhapKho.forEach((item) => list.push({
      loai: "Nhập kho",
      ma: getMaPhieuNhap(item),
      ngay: item.ngayNhap || item.ngayLap || item.createdAt,
      trangThai: item.trangThai,
      link: "/admin/phieu-nhap-kho",
    }));

    yeuCauXuatKho.forEach((item) => list.push({
      loai: "Yêu cầu xuất",
      ma: getMaYeuCauXuat(item),
      ngay: item.ngayYeuCau || item.ngayLap || item.createdAt,
      trangThai: item.trangThai,
      link: "/admin/yeu-cau-xuat-kho",
    }));

    phieuXuatKho.forEach((item) => list.push({
      loai: "Xuất kho",
      ma: getMaPhieuXuat(item),
      ngay: item.ngayXuat || item.ngayLap || item.createdAt,
      trangThai: item.trangThai,
      link: "/admin/phieu-xuat-kho",
    }));

    phieuKiemKeKho.forEach((item) => list.push({
      loai: "Kiểm kê",
      ma: getMaPhieuKiemKe(item),
      ngay: item.ngayKiemKe || item.ngayLap || item.createdAt,
      trangThai: item.trangThai,
      link: "/admin/kiem-ke-kho",
    }));

    return list.sort((a, b) => new Date(b.ngay || 0) - new Date(a.ngay || 0)).slice(0, 5);
  }, [phieuNhapKho, yeuCauXuatKho, phieuXuatKho, phieuKiemKeKho]);

  const lichSuGanDay = useMemo(() => {
    return [...lichSuTonKho]
      .sort((a, b) => new Date(b.thoiGian || 0) - new Date(a.thoiGian || 0))
      .slice(0, 6);
  }, [lichSuTonKho]);

  const primaryStats = [
    {
      title: "Nguyên vật liệu",
      value: dsTonKho.length,
      note: `${tonThapList.length} tồn thấp`,
      icon: "bi bi-box-seam",
      link: "/admin/nguyen-vat-lieu",
      tone: "blue",
    },
    {
      title: "Phiếu nhập",
      value: phieuNhapKho.length,
      note: `${phieuNhapChoDuyet.length} chờ duyệt`,
      icon: "bi bi-box-arrow-in-down",
      link: "/admin/phieu-nhap-kho",
      tone: "green",
    },
    {
      title: "Phiếu xuất",
      value: phieuXuatKho.length,
      note: `${phieuXuatChoDuyet.length} chờ duyệt`,
      icon: "bi bi-box-arrow-up",
      link: "/admin/phieu-xuat-kho",
      tone: "orange",
    },
    {
      title: "Kiểm kê",
      value: phieuKiemKeKho.length,
      note: `${kiemKeChoXacNhan.length} chờ xác nhận`,
      icon: "bi bi-clipboard-check",
      link: "/admin/kiem-ke-kho",
      tone: "red",
    },
  ];

  const secondaryStats = [
    {
      label: "Yêu cầu xuất chờ xử lý",
      value: yeuCauXuatChoXuLy.length,
      link: "/admin/yeu-cau-xuat-kho",
      action: "Xem chi tiết",
    },
    {
      label: "Nguyên vật liệu hết hàng",
      value: hetHangList.length,
      link: "/admin/nguyen-vat-lieu",
      action: "Kiểm tra",
    },
    {
      label: "Lịch sử tồn kho",
      value: lichSuTonKho.length,
      link: "/admin/bao-cao-xuat-nhap-ton",
      action: "Theo dõi",
    },
    {
      label: "Người dùng",
      value: nguoiDung.length,
      link: "/admin/nguoi-dung",
      action: "Quản lý",
    },
  ];

  return (
    <div className="admin-dashboard">
      <section className="dashboard-hero-clean">
        <div>
          <span>Kho Cafe</span>
          <h2>Hoạt động kho hôm nay</h2>
          <p>Tập trung vào tồn kho, phiếu cần xử lý và cảnh báo nguyên vật liệu.</p>
        </div>

        <button type="button" onClick={() => loadDashboard(true)} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i>
          {loading ? "Đang tải" : "Làm mới"}
        </button>
      </section>

      <section className="dashboard-primary-grid">
        {primaryStats.map((item) => (
          <Link to={item.link} className="dashboard-stat-card" key={item.title}>
            <div className={`dashboard-stat-icon ${item.tone}`}>
              <i className={item.icon}></i>
            </div>
            <div>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </div>
          </Link>
        ))}
      </section>

      <section className="dashboard-secondary-grid">
        {secondaryStats.map((item) => (
          <Link to={item.link} className="dashboard-mini-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.action}</small>
          </Link>
        ))}
      </section>

      <section className="dashboard-main-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Hoạt động gần đây</h3>
              <p>Các phiếu mới phát sinh trong hệ thống</p>
            </div>
          </div>

          <div className="dashboard-activity-list">
            {recentActivities.length === 0 ? (
              <div className="dashboard-empty">Chưa có hoạt động gần đây</div>
            ) : (
              recentActivities.map((item, index) => (
                <Link to={item.link} className="dashboard-activity-item" key={`${item.loai}-${item.ma}-${index}`}>
                  <div>
                    <strong>{item.ma}</strong>
                    <span>{item.loai}</span>
                  </div>
                  <div>
                    <time>{formatDate(item.ngay)}</time>
                    <em className={`status-pill ${getStatusClass(item.trangThai)}`}>
                      {getStatusLabel(item.trangThai)}
                    </em>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Cảnh báo tồn kho</h3>
              <p>Nguyên vật liệu cần kiểm tra</p>
            </div>
            <Link to="/admin/nguyen-vat-lieu">Xem tất cả</Link>
          </div>

          <div className="dashboard-stock-list">
            {tonThapList.length === 0 ? (
              <div className="dashboard-empty good">
                <i className="bi bi-check-circle"></i>
                Không có nguyên vật liệu tồn thấp
              </div>
            ) : (
              tonThapList.slice(0, 5).map((item) => (
                <div className="dashboard-stock-item" key={item.nguyenVatLieuId}>
                  <div>
                    <strong>{item.tenNguyenVatLieu}</strong>
                    <span>{item.maNguyenVatLieu || "-"} | {getStatusLabel(item.trangThaiTonKho)}</span>
                  </div>
                  <b>
                    {formatNumber(getTonHienTai(item))}
                    <small> / {formatNumber(getTonToiThieu(item))} {item.tenDonVi}</small>
                  </b>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <h3>Lịch sử tồn kho gần đây</h3>
            <p>Các biến động nhập, xuất và kiểm kê mới nhất</p>
          </div>
          <Link to="/admin/bao-cao-xuat-nhap-ton">Xem báo cáo</Link>
        </div>

        <div className="dashboard-table-wrap">
          <table>
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
              </tr>
            </thead>
            <tbody>
              {lichSuGanDay.length === 0 ? (
                <tr>
                  <td colSpan="8">Chưa có lịch sử tồn kho</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
