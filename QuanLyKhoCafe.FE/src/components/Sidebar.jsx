import { NavLink } from "react-router-dom";

function normalizeRole(role) {
  return String(role || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function Sidebar() {
  const role = normalizeRole(
    localStorage.getItem("tenVaiTro") ||
      localStorage.getItem("role") ||
      localStorage.getItem("vaiTro")
  );

  const isQuanLyTiem = role === "quanlytiem";
  const isNhanVienKho = role === "nhanvienkho";
  const isNhanVienPhaChe = role === "nhanvienphache";

  const canKho = isQuanLyTiem || isNhanVienKho;
  const canPhaChe = isQuanLyTiem || isNhanVienKho || isNhanVienPhaChe;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <i className="bi bi-cup-hot-fill"></i>
        </div>

        <div>
          <h2>Kho Cafe</h2>
          <p>Inventory System</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {isQuanLyTiem && (
          <>
            <div className="sidebar-group-title">Tổng quan</div>

            <NavLink to="/admin/dashboard">
              <i className="bi bi-speedometer2"></i>
              <span>Tổng quan</span>
            </NavLink>
          </>
        )}

        {canKho && (
          <>
            <div className="sidebar-group-title">Danh mục kho</div>

            <NavLink to="/admin/nguyen-vat-lieu">
              <i className="bi bi-box-seam"></i>
              <span>Nguyên vật liệu</span>
            </NavLink>

            {isQuanLyTiem && (
              <>
                <NavLink to="/admin/nhom-nguyen-vat-lieu">
                  <i className="bi bi-tags"></i>
                  <span>Nhóm nguyên vật liệu</span>
                </NavLink>

                <NavLink to="/admin/don-vi-tinh">
                  <i className="bi bi-rulers"></i>
                  <span>Đơn vị tính</span>
                </NavLink>

                <NavLink to="/admin/nha-cung-cap">
                  <i className="bi bi-truck"></i>
                  <span>Nhà cung cấp</span>
                </NavLink>
              </>
            )}

            <div className="sidebar-group-title">Nghiệp vụ kho</div>

            <NavLink to="/admin/phieu-nhap-kho">
              <i className="bi bi-box-arrow-in-down"></i>
              <span>Phiếu nhập kho</span>
            </NavLink>
          </>
        )}

        {canPhaChe && (
          <NavLink to="/admin/yeu-cau-xuat-kho">
            <i className="bi bi-clipboard-check"></i>
            <span>Yêu cầu xuất kho</span>
          </NavLink>
        )}

        {canKho && (
          <>
            <NavLink to="/admin/phieu-xuat-kho">
              <i className="bi bi-box-arrow-up"></i>
              <span>Phiếu xuất kho</span>
            </NavLink>

            <NavLink to="/admin/kiem-ke-kho">
              <i className="bi bi-clipboard-data"></i>
              <span>Kiểm kê kho</span>
            </NavLink>

            <div className="sidebar-group-title">Báo cáo</div>

            <NavLink to="/admin/bao-cao-xuat-nhap-ton">
              <i className="bi bi-bar-chart-line"></i>
              <span>Báo cáo tồn kho</span>
            </NavLink>
          </>
        )}

        {isQuanLyTiem && (
          <>
            <div className="sidebar-group-title">Hệ thống</div>

            <NavLink to="/admin/nguoi-dung">
              <i className="bi bi-people"></i>
              <span>Người dùng</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;