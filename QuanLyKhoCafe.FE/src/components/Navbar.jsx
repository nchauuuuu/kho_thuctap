import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "./Toast";

const pageMeta = {
  "/admin/dashboard": {
    title: "Tổng quan hệ thống",
    section: "Tổng quan",
    hint: "Theo dõi nhanh tình trạng kho",
  },
  "/admin/nguyen-vat-lieu": {
    title: "Nguyên vật liệu",
    section: "Danh mục kho",
    hint: "Quản lý nguyên vật liệu",
  },
  "/admin/nhom-nguyen-vat-lieu": {
    title: "Nhóm nguyên vật liệu",
    section: "Danh mục kho",
    hint: "Phân loại nguyên vật liệu",
  },
  "/admin/don-vi-tinh": {
    title: "Đơn vị tính",
    section: "Danh mục kho",
    hint: "Chuẩn hóa đơn vị",
  },
  "/admin/nha-cung-cap": {
    title: "Nhà cung cấp",
    section: "Danh mục kho",
    hint: "Thông tin đối tác cung ứng",
  },
  "/admin/phieu-nhap-kho": {
    title: "Phiếu nhập kho",
    section: "Nghiệp vụ kho",
    hint: "Ghi nhận nhập kho",
  },
  "/admin/yeu-cau-xuat-kho": {
    title: "Yêu cầu xuất kho",
    section: "Nghiệp vụ kho",
    hint: "Tiếp nhận yêu cầu xuất",
  },
  "/admin/phieu-xuat-kho": {
    title: "Phiếu xuất kho",
    section: "Nghiệp vụ kho",
    hint: "Theo dõi xuất kho",
  },
  "/admin/kiem-ke-kho": {
    title: "Kiểm kê kho",
    section: "Nghiệp vụ kho",
    hint: "Đối soát tồn thực tế",
  },
  "/admin/bao-cao-xuat-nhap-ton": {
    title: "Báo cáo tồn kho",
    section: "Báo cáo",
    hint: "Tổng hợp xuất nhập tồn",
  },
  "/admin/nguoi-dung": {
    title: "Người dùng",
    section: "Hệ thống",
    hint: "Phân quyền tài khoản",
  },
};

function normalizeRole(role) {
  return String(role || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const getAuthUser = () => {
    try {
      const raw =
        localStorage.getItem("authUser") ||
        localStorage.getItem("user") ||
        localStorage.getItem("nguoiDung");

      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const authUser = getAuthUser();
  const meta = pageMeta[location.pathname] || {
    title: "Quản lý kho Cafe",
    section: "Kho Cafe",
    hint: "Vận hành hệ thống kho",
  };

  const hoTen =
    localStorage.getItem("hoTen") ||
    authUser?.hoTen ||
    authUser?.email ||
    "Người dùng";

  const tenVaiTro =
    localStorage.getItem("tenVaiTro") ||
    authUser?.tenVaiTro ||
    "Chưa có vai trò";

  const getRoleLabel = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === "quanlytiem") return "Quản lý tiệm";
    if (normalized === "nhanvienkho") return "Nhân viên kho";
    if (normalized === "nhanvienphache") return "Nhân viên pha chế";
    return role || "Chưa có vai trò";
  };

  const handleLogout = () => {
    localStorage.clear();
    showToast("Đăng xuất thành công.");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="admin-topbar">
        <div className="admin-title-block">
          <div className="admin-breadcrumb">
            <span>Kho Cafe</span>
            <i className="bi bi-chevron-right"></i>
            <b>{meta.section}</b>
          </div>

          <h1>{meta.title}</h1>
          <p>{meta.hint}</p>
        </div>

        <div className="admin-search">
          <i className="bi bi-search"></i>
          <span>Tìm nguyên vật liệu, phiếu kho, nhà cung cấp...</span>
        </div>

        <div className="admin-actions">
          <div className="admin-status">
            <i className="bi bi-circle-fill"></i>
            Sẵn sàng
          </div>

          <div className="admin-user-card">
            <div className="admin-avatar">{String(hoTen || "U").charAt(0).toUpperCase()}</div>
            <div>
              <strong>{hoTen}</strong>
              <small>{getRoleLabel(tenVaiTro)}</small>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={() => setShowLogoutModal(true)}
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </header>

      {showLogoutModal && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-logout-modal">
            <div className="admin-logout-icon">
              <i className="bi bi-box-arrow-right"></i>
            </div>
            <h3>Đăng xuất tài khoản?</h3>
            <p>Bạn sẽ quay về màn hình đăng nhập và phiên làm việc hiện tại sẽ kết thúc.</p>

            <div className="admin-modal-actions">
              <button type="button" className="btn-soft" onClick={() => setShowLogoutModal(false)}>
                Hủy
              </button>
              <button type="button" className="btn-danger-solid" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
