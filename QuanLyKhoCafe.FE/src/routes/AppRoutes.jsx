import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import NguyenVatLieu from "../pages/NguyenVatLieu/NguyenVatLieu";
import NhomNguyenVatLieu from "../pages/NhomNguyenVatLieu/NhomNguyenVatLieu";
import DonViTinh from "../pages/DonViTinh/DonViTinh";
import NhaCungCap from "../pages/NhaCungCap/NhaCungCap";
import PhieuNhapKho from "../pages/PhieuNhapKho/PhieuNhapKho";
import YeuCauXuatKho from "../pages/YeuCauXuatKho/YeuCauXuatKho";
import PhieuXuatKho from "../pages/PhieuXuatKho/PhieuXuatKho";
import KiemKeKho from "../pages/KiemKeKho/KiemKeKho";
import BaoCaoXuatNhapTon from "../pages/BaoCaoXuatNhapTon/BaoCaoXuatNhapTon";
import NguoiDung from "../pages/NguoiDung/NguoiDung";

function normalizeRole(role) {
  return String(role || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function getCurrentUser() {
  const keys = ["user", "authUser", "currentUser", "nguoiDung"];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (!value) continue;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return null;
}

function getCurrentRole() {
  const user = getCurrentUser();

  const role =
    user?.tenVaiTro ||
    user?.vaiTro ||
    user?.role ||
    localStorage.getItem("tenVaiTro") ||
    localStorage.getItem("role") ||
    localStorage.getItem("vaiTro");

  return normalizeRole(role);
}

function isLoggedIn() {
  const user = getCurrentUser();

  return Boolean(
    user?.nguoiDungId ||
      user?.nguoiDungID ||
      user?.id ||
      user?.email
  );
}

function getDefaultPathByRole(role) {
  if (role === "quanlytiem") {
    return "/admin/dashboard";
  }

  if (role === "nhanvienkho") {
    return "/admin/phieu-nhap-kho";
  }

  if (role === "nhanvienphache") {
    return "/admin/yeu-cau-xuat-kho";
  }

  return "/login";
}

function RequireAuth({ children, allowRoles = [] }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const role = getCurrentRole();

  console.log("CHECK AUTH USER:", getCurrentUser());
  console.log("CHECK AUTH ROLE:", role);

  if (allowRoles.length > 0 && !allowRoles.includes(role)) {
    return <Navigate to={getDefaultPathByRole(role)} replace />;
  }

  return children;
}

function HomeRedirect() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const role = getCurrentRole();
  return <Navigate to={getDefaultPathByRole(role)} replace />;
}

function RoleRoute({ children, allowRoles }) {
  return <RequireAuth allowRoles={allowRoles}>{children}</RequireAuth>;
}

function AppRoutes() {
  const quanLyTiem = ["quanlytiem"];

  const khoRoles = ["quanlytiem", "nhanvienkho"];

  const phaCheRoles = ["quanlytiem", "nhanvienphache"];

  const khoVaPhaCheRoles = [
    "quanlytiem",
    "nhanvienkho",
    "nhanvienphache",
  ];

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/dang-nhap" element={<Login />} />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<HomeRedirect />} />

        <Route
          path="dashboard"
          element={
            <RoleRoute allowRoles={quanLyTiem}>
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="nguyen-vat-lieu"
          element={
            <RoleRoute allowRoles={khoRoles}>
              <NguyenVatLieu />
            </RoleRoute>
          }
        />

        <Route
          path="nhom-nguyen-vat-lieu"
          element={
            <RoleRoute allowRoles={quanLyTiem}>
              <NhomNguyenVatLieu />
            </RoleRoute>
          }
        />

        <Route
          path="nhom-nvl"
          element={
            <RoleRoute allowRoles={quanLyTiem}>
              <NhomNguyenVatLieu />
            </RoleRoute>
          }
        />

        <Route
          path="don-vi-tinh"
          element={
            <RoleRoute allowRoles={quanLyTiem}>
              <DonViTinh />
            </RoleRoute>
          }
        />

        <Route
          path="nha-cung-cap"
          element={
            <RoleRoute allowRoles={quanLyTiem}>
              <NhaCungCap />
            </RoleRoute>
          }
        />

        <Route
          path="phieu-nhap-kho"
          element={
            <RoleRoute allowRoles={khoRoles}>
              <PhieuNhapKho />
            </RoleRoute>
          }
        />

        <Route
          path="yeu-cau-xuat-kho"
          element={
            <RoleRoute allowRoles={khoVaPhaCheRoles}>
              <YeuCauXuatKho />
            </RoleRoute>
          }
        />

        <Route
          path="phieu-xuat-kho"
          element={
            <RoleRoute allowRoles={khoRoles}>
              <PhieuXuatKho />
            </RoleRoute>
          }
        />

        <Route
          path="kiem-ke-kho"
          element={
            <RoleRoute allowRoles={khoRoles}>
              <KiemKeKho />
            </RoleRoute>
          }
        />

        <Route
          path="bao-cao-xuat-nhap-ton"
          element={
            <RoleRoute allowRoles={khoRoles}>
              <BaoCaoXuatNhapTon />
            </RoleRoute>
          }
        />

        <Route
          path="nguoi-dung"
          element={
            <RoleRoute allowRoles={quanLyTiem}>
              <NguoiDung />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default AppRoutes;