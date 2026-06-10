import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "./Toast";

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
    const normalized = String(role || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");

    if (normalized === "quanlytiem") return "Quản lý tiệm";
    if (normalized === "nhanvienkho") return "Nhân viên kho";
    if (normalized === "nhanvienphache") return "Nhân viên pha chế";
    return role || "Chưa có vai trò";
  };

  const pageTitleMap = {
    "/admin/dashboard": "Tổng quan hệ thống",
    "/admin/nguyen-vat-lieu": "Nguyên vật liệu",
    "/admin/nhom-nguyen-vat-lieu": "Nhóm nguyên vật liệu",
    "/admin/don-vi-tinh": "Đơn vị tính",
    "/admin/nha-cung-cap": "Nhà cung cấp",
    "/admin/phieu-nhap-kho": "Phiếu nhập kho",
    "/admin/yeu-cau-xuat-kho": "Yêu cầu xuất kho",
    "/admin/phieu-xuat-kho": "Phiếu xuất kho",
    "/admin/kiem-ke-kho": "Kiểm kê kho",
    "/admin/bao-cao-xuat-nhap-ton": "Báo cáo tồn kho",
    "/admin/nguoi-dung": "Người dùng",
  };

  const pageTitle = pageTitleMap[location.pathname] || "Quản lý kho Cafe";

  const handleLogout = () => {
    localStorage.clear();
    showToast("Đăng xuất thành công.");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="navbar-custom">
        <div className="navbar-left">
          <div className="navbar-breadcrumb">
            <i className="bi bi-house-door"></i>
            <span>Kho Cafe</span>
            <i className="bi bi-chevron-right"></i>
            <b>{pageTitle}</b>
          </div>

          <h1 className="navbar-page-title">{pageTitle}</h1>
        </div>

        <div className="navbar-center" aria-hidden="true">
          <div className="navbar-search">
            <i className="bi bi-search"></i>
            <span>Tìm nguyên vật liệu, phiếu kho...</span>
          </div>

          <div className="navbar-status">
            <i className="bi bi-circle-fill"></i>
            Hệ thống sẵn sàng
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-user">
            <div className="navbar-avatar">
              {String(hoTen || "U").charAt(0).toUpperCase()}
            </div>

            <div className="navbar-user-info">
              <span>{hoTen}</span>
              <small>{getRoleLabel(tenVaiTro)}</small>
            </div>
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </header>

      {showLogoutModal && (
        <div className="logout-modal-backdrop" role="dialog" aria-modal="true">
          <div className="logout-modal">
            <div className="logout-modal-icon">
              <i className="bi bi-box-arrow-right"></i>
            </div>

            <div>
              <h3>Đăng xuất tài khoản?</h3>
              <p>Bạn sẽ quay về màn hình đăng nhập và phiên làm việc hiện tại sẽ kết thúc.</p>
            </div>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Hủy
              </button>

              <button type="button" className="logout-modal-confirm" onClick={handleLogout}>
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
