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
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-mark">
          <i className="bi bi-cup-hot-fill"></i>
        </div>
        <div>
          <h2>Kho Cafe</h2>
          <p>Inventory System</p>
        </div>
      </div>

      <nav className="admin-sidebar-menu">
        {isQuanLyTiem && (
          <section>
            <span className="admin-menu-label">Tổng quan</span>
            <NavLink to="/admin/dashboard">
              <i className="bi bi-grid-1x2"></i>
              <span>Tổng quan</span>
            </NavLink>
          </section>
        )}

        {canKho && (
          <section>
            <span className="admin-menu-label">Danh mục kho</span>
            <NavLink to="/admin/nguyen-vat-lieu">
              <i className="bi bi-box-seam"></i>
              <span>Nguyên vật liệu</span>
            </NavLink>

            {isQuanLyTiem && (
              <>
                <NavLink to="/admin/nhom-nguyen-vat-lieu">
                  <i className="bi bi-tags"></i>
                  <span>Nhóm nguyên liệu</span>
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
          </section>
        )}

        {(canKho || canPhaChe) && (
          <section>
            <span className="admin-menu-label">Nghiệp vụ</span>
            {canKho && (
              <NavLink to="/admin/phieu-nhap-kho">
                <i className="bi bi-box-arrow-in-down"></i>
                <span>Phiếu nhập</span>
              </NavLink>
            )}
            {canPhaChe && (
              <NavLink to="/admin/yeu-cau-xuat-kho">
                <i className="bi bi-clipboard-check"></i>
                <span>Yêu cầu xuất</span>
              </NavLink>
            )}
            {canKho && (
              <>
                <NavLink to="/admin/phieu-xuat-kho">
                  <i className="bi bi-box-arrow-up"></i>
                  <span>Phiếu xuất</span>
                </NavLink>
                <NavLink to="/admin/kiem-ke-kho">
                  <i className="bi bi-clipboard-data"></i>
                  <span>Kiểm kê</span>
                </NavLink>
              </>
            )}
          </section>
        )}

        {canKho && (
          <section>
            <span className="admin-menu-label">Báo cáo</span>
            <NavLink to="/admin/bao-cao-xuat-nhap-ton">
              <i className="bi bi-bar-chart-line"></i>
              <span>Xuất nhập tồn</span>
            </NavLink>
          </section>
        )}

        {isQuanLyTiem && (
          <section>
            <span className="admin-menu-label">Hệ thống</span>
            <NavLink to="/admin/nguoi-dung">
              <i className="bi bi-people"></i>
              <span>Người dùng</span>
            </NavLink>
          </section>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
