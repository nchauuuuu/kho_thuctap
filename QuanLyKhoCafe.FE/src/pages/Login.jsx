import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    matKhau: "",
  });

  const [loading, setLoading] = useState(false);

  const normalizeRole = (role) => {
    return String(role || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
  };

  const getDefaultPathByRole = (role) => {
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
  };

  const clearAuthStorage = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("nguoiDung");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("vaiTro");
    localStorage.removeItem("tenVaiTro");

    localStorage.removeItem("nguoiDungId");
    localStorage.removeItem("hoTen");
    localStorage.removeItem("email");
    localStorage.removeItem("vaiTroId");
  };

  const saveAuthStorage = (user) => {
    const roleRaw = user.tenVaiTro || "";
    const roleNormalized = normalizeRole(roleRaw);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("authUser", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("nguoiDung", JSON.stringify(user));

    localStorage.setItem("role", roleRaw);
    localStorage.setItem("vaiTro", roleRaw);
    localStorage.setItem("tenVaiTro", roleRaw);

    localStorage.setItem("nguoiDungId", String(user.nguoiDungId || ""));
    localStorage.setItem("hoTen", user.hoTen || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("vaiTroId", String(user.vaiTroId || ""));

    if (user.token) {
      localStorage.setItem("token", user.token);
    }

    return roleNormalized;
  };

  const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
      return "Email hoặc mật khẩu không đúng.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.message) {
      return data.message;
    }

    if (data.title) {
      return data.title;
    }

    if (data.errors) {
      const firstError = Object.values(data.errors)?.[0]?.[0];
      if (firstError) return firstError;
    }

    return "Email hoặc mật khẩu không đúng.";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const matKhau = form.matKhau.trim();

    if (!email) {
      alert("Vui lòng nhập email.");
      return;
    }

    if (!matKhau) {
      alert("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      clearAuthStorage();

      const payload = {
        email,
        matKhau,
      };

      console.log("LOGIN URL:", "/NguoiDung/dang-nhap");
      console.log("LOGIN PAYLOAD:", payload);

      const res = await axiosClient.post("/NguoiDung/dang-nhap", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("LOGIN RESPONSE:", res.data);

      const user = res.data;

      if (!user || !user.nguoiDungId) {
        alert("Dữ liệu đăng nhập không hợp lệ.");
        clearAuthStorage();
        return;
      }

      if (!user.tenVaiTro) {
        alert("Tài khoản chưa có vai trò. Vui lòng kiểm tra lại dữ liệu.");
        clearAuthStorage();
        return;
      }

      const role = saveAuthStorage(user);
      const defaultPath = getDefaultPathByRole(role);

      console.log("ROLE RAW:", user.tenVaiTro);
      console.log("ROLE NORMALIZED:", role);
      console.log("NAVIGATE TO:", defaultPath);

      if (defaultPath === "/login") {
        alert("Vai trò tài khoản không hợp lệ.");
        clearAuthStorage();
        return;
      }

      navigate(defaultPath, { replace: true });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      console.error("STATUS:", error?.response?.status);
      console.error("DATA:", error?.response?.data);
      console.error("REQUEST URL:", error?.config?.url);
      console.error("REQUEST DATA:", error?.config?.data);

      clearAuthStorage();
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-v2">
      <div className="login-box">
        <div className="login-brand">
          <div className="login-logo">
            <i className="bi bi-cup-hot"></i>
          </div>

          <h2>Kho Cafe</h2>
          <p>Đăng nhập để quản lý kho nguyên vật liệu</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email"
              autoComplete="email"
            />
          </div>

          <div className="login-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="matKhau"
              value={form.matKhau}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="login-hint">
          <p>
            Tài khoản mẫu: <b>quanly@kho.cafe</b> / <b>123456</b>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;