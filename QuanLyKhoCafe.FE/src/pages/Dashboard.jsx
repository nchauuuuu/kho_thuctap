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

    if (
      text.includes("huy") ||
      text.includes("khoa") ||
      text.includes("tu") ||
      text.includes("ngung") ||
      text.includes("het")
    ) {
      return "danger";
    }

    if (text.includes("cho") || text.includes("sap")) {
      return "warning";
    }

    if (
      text.includes("da") ||
      text.includes("binh") ||
      text.includes("dang") ||
      text.includes("hoat")
    ) {
      return "success";
    }

    return "neutral";
  };

  const getTonHienTai = (item) => {
    return Number(item.tonHienTai ?? item.soLuongTon ?? item.soLuong ?? 0);
  };

  const getTonToiThieu = (item) => {
    return Number(item.tonToiThieu ?? item.mucTonToiThieu ?? 0);
  };

  const getMaPhieuNhap = (item) => {
    return item.maPhieuNhap || item.maPhieuNhapKho || `PNK-${item.phieuNhapKhoId || ""}`;
  };

  const getMaYeuCauXuat = (item) => {
    return item.maYeuCau || item.maYeuCauXuatKho || `YCXK-${item.yeuCauXuatKhoId || ""}`;
  };

  const getMaPhieuXuat = (item) => {
    return item.maPhieuXuat || item.maPhieuXuatKho || `PXK-${item.phieuXuatKhoId || ""}`;
  };

  const getMaPhieuKiemKe = (item) => {
    return item.maPhieuKiemKe || item.maPhieuKiemKeKho || `PKK-${item.phieuKiemKeKhoId || ""}`;
  };

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

  const hetHangList = useMemo(() => {
    return dsTonKho.filter((item) => getTonHienTai(item) <= 0);
  }, [dsTonKho]);

  const phieuNhapChoDuyet = useMemo(() => {
    return phieuNhapKho.filter((item) => item.trangThai === "ChoDuyet");
  }, [phieuNhapKho]);

  const yeuCauXuatChoXuLy = useMemo(() => {
    return yeuCauXuatKho.filter((item) => item.trangThai === "ChoXuLy");
  }, [yeuCauXuatKho]);

  const phieuXuatChoDuyet = useMemo(() => {
    return phieuXuatKho.filter((item) => item.trangThai === "ChoDuyet");
  }, [phieuXuatKho]);

  const kiemKeChoXacNhan = useMemo(() => {
    return phieuKiemKeKho.filter((item) => item.trangThai === "ChoXacNhan");
  }, [phieuKiemKeKho]);

  const recentActivities = useMemo(() => {
    const list = [];

    phieuNhapKho.forEach((item) => {
      list.push({
        loai: "Nhập kho",
        ma: getMaPhieuNhap(item),
        ngay: item.ngayNhap || item.ngayLap || item.createdAt,
        trangThai: item.trangThai,
        link: "/admin/phieu-nhap-kho",
      });
    });

    yeuCauXuatKho.forEach((item) => {
      list.push({
        loai: "Yêu cầu xuất",
        ma: getMaYeuCauXuat(item),
        ngay: item.ngayYeuCau || item.ngayLap || item.createdAt,
        trangThai: item.trangThai,
        link: "/admin/yeu-cau-xuat-kho",
      });
    });

    phieuXuatKho.forEach((item) => {
      list.push({
        loai: "Xuất kho",
        ma: getMaPhieuXuat(item),
        ngay: item.ngayXuat || item.ngayLap || item.createdAt,
        trangThai: item.trangThai,
        link: "/admin/phieu-xuat-kho",
      });
    });

    phieuKiemKeKho.forEach((item) => {
      list.push({
        loai: "Kiểm kê",
        ma: getMaPhieuKiemKe(item),
        ngay: item.ngayKiemKe || item.ngayLap || item.createdAt,
        trangThai: item.trangThai,
        link: "/admin/kiem-ke-kho",
      });
    });

    return list
      .sort((a, b) => new Date(b.ngay || 0) - new Date(a.ngay || 0))
      .slice(0, 6);
  }, [phieuNhapKho, yeuCauXuatKho, phieuXuatKho, phieuKiemKeKho]);

  const lichSuGanDay = useMemo(() => {
    return [...lichSuTonKho]
      .sort((a, b) => new Date(b.thoiGian || 0) - new Date(a.thoiGian || 0))
      .slice(0, 6);
  }, [lichSuTonKho]);

  const stats = [
    {
      title: "Nguyên vật liệu",
      value: dsTonKho.length,
      subtitle: `${tonThapList.length} tồn thấp`,
      icon: "bi bi-box-seam",
      link: "/admin/nguyen-vat-lieu",
      tone: "blue",
    },
    {
      title: "Phiếu nhập",
      value: phieuNhapKho.length,
      subtitle: `${phieuNhapChoDuyet.length} chờ duyệt`,
      icon: "bi bi-box-arrow-in-down",
      link: "/admin/phieu-nhap-kho",
      tone: "green",
    },
    {
      title: "Phiếu xuất",
      value: phieuXuatKho.length,
      subtitle: `${phieuXuatChoDuyet.length} chờ duyệt`,
      icon: "bi bi-box-arrow-up",
      link: "/admin/phieu-xuat-kho",
      tone: "orange",
    },
    {
      title: "Kiểm kê",
      value: phieuKiemKeKho.length,
      subtitle: `${kiemKeChoXacNhan.length} chờ xác nhận`,
      icon: "bi bi-clipboard-check",
      link: "/admin/kiem-ke-kho",
      tone: "red",
    },
  ];

  const miniStats = [
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
    <div className="dashboard-v2">
      <div className="dash-hero">
        <div>
          <span className="dash-label">Kho Cafe</span>
          <h1>Trang tổng quan</h1>
          <p>
            Theo dõi nhanh tồn kho, phiếu nhập, phiếu xuất và các cảnh báo cần xử lý.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          className="dash-refresh"
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise"></i>
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      <div className="dash-kpi-grid">
        {stats.map((item) => (
          <Link to={item.link} className="dash-kpi-card" key={item.title}>
            <div className={`dash-kpi-icon ${item.tone}`}>
              <i className={item.icon}></i>
            </div>

            <div>
              <p>{item.title}</p>
              <h2>{item.value}</h2>
              <span>{item.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="dash-mini-grid">
        {miniStats.map((item) => (
          <div className="dash-mini-card" key={item.label}>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <Link to={item.link}>{item.action}</Link>
          </div>
        ))}
      </div>

      <div className="dash-content-grid">
        <div className="dash-section">
          <div className="dash-section-title">
            <div>
              <h3>Hoạt động gần đây</h3>
              <p>Các phiếu mới phát sinh trong hệ thống</p>
            </div>
          </div>

          <div className="dash-list">
            {recentActivities.length === 0 ? (
              <div className="dash-empty-box">Chưa có hoạt động gần đây</div>
            ) : (
              recentActivities.map((item, index) => (
                <Link
                  to={item.link}
                  className="dash-activity-item"
                  key={`${item.loai}-${item.ma}-${index}`}
                >
                  <div>
                    <strong>{item.ma}</strong>
                    <span>{item.loai}</span>
                  </div>

                  <div className="dash-activity-right">
                    <span>{formatDate(item.ngay)}</span>
                    <em className={`dash-pill ${getStatusClass(item.trangThai)}`}>
                      {getStatusLabel(item.trangThai)}
                    </em>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="dash-section">
          <div className="dash-section-title">
            <div>
              <h3>Cảnh báo tồn kho</h3>
              <p>Nguyên vật liệu cần kiểm tra</p>
            </div>

            <Link to="/admin/nguyen-vat-lieu">Xem tất cả</Link>
          </div>

          <div className="dash-stock-list">
            {tonThapList.length === 0 ? (
              <div className="dash-empty-box good">
                <i className="bi bi-check-circle"></i>
                Không có nguyên vật liệu tồn thấp
              </div>
            ) : (
              tonThapList.slice(0, 5).map((item) => (
                <div className="dash-stock-item" key={item.nguyenVatLieuId}>
                  <div>
                    <strong>{item.tenNguyenVatLieu}</strong>
                    <span>
                      {item.maNguyenVatLieu || "-"} | {getStatusLabel(item.trangThaiTonKho)}
                    </span>
                  </div>

                  <div>
                    <b>{formatNumber(getTonHienTai(item))}</b>
                    <small>
                      / {formatNumber(getTonToiThieu(item))} {item.tenDonVi}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">
          <div>
            <h3>Lịch sử tồn kho gần đây</h3>
            <p>Các biến động nhập, xuất và kiểm kê mới nhất</p>
          </div>

          <Link to="/admin/bao-cao-xuat-nhap-ton">Xem báo cáo</Link>
        </div>

        <div className="table-wrapper">
          <table className="data-table dash-history-table">
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
                  <td colSpan="8" className="text-center">
                    Chưa có lịch sử tồn kho
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

export default Dashboard;
