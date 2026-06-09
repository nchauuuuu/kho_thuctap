import { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";

function NguoiDung() {
  const [dsNguoiDung, setDsNguoiDung] = useState([]);
  const [dsVaiTro, setDsVaiTro] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    hoTen: "",
    email: "",
    matKhau: "",
    soDienThoai: "",
    vaiTroId: "",
    trangThai: "HoatDong",
  });

  useEffect(() => {
    loadNguoiDung();
    loadVaiTro();
  }, []);

  const loadNguoiDung = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/NguoiDung");
      setDsNguoiDung(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
      alert("Không tải được danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const loadVaiTro = async () => {
    try {
      const res = await axiosClient.get("/VaiTro");
      setDsVaiTro(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách vai trò:", error);
      alert("Không tải được danh sách vai trò.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      hoTen: "",
      email: "",
      matKhau: "",
      soDienThoai: "",
      vaiTroId: "",
      trangThai: "HoatDong",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.hoTen.trim()) {
      alert("Vui lòng nhập họ tên.");
      return false;
    }

    if (!form.email.trim()) {
      alert("Vui lòng nhập email.");
      return false;
    }

    if (!editingId && !form.matKhau.trim()) {
      alert("Vui lòng nhập mật khẩu khi thêm người dùng.");
      return false;
    }

    if (!form.vaiTroId) {
      alert("Vui lòng chọn vai trò.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        hoTen: form.hoTen.trim(),
        email: form.email.trim(),
        soDienThoai: form.soDienThoai.trim(),
        vaiTroId: Number(form.vaiTroId),
        trangThai: form.trangThai,
      };

      if (form.matKhau.trim()) {
        payload.matKhau = form.matKhau.trim();
      }

      if (editingId) {
        await axiosClient.put(`/NguoiDung/${editingId}`, payload);
        alert("Cập nhật người dùng thành công.");
      } else {
        await axiosClient.post("/NguoiDung", payload);
        alert("Thêm người dùng thành công.");
      }

      resetForm();
      loadNguoiDung();
    } catch (error) {
      console.error("Lỗi lưu người dùng:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Lưu người dùng thất bại.";

      alert(message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.nguoiDungId);

    setForm({
      hoTen: item.hoTen || "",
      email: item.email || "",
      matKhau: "",
      soDienThoai: item.soDienThoai || "",
      vaiTroId: item.vaiTroId || "",
      trangThai: item.trangThai || "HoatDong",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa người dùng này không?"
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/NguoiDung/${id}`);
      alert("Xóa người dùng thành công.");
      loadNguoiDung();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Không thể xóa người dùng này.";

      alert(message);
    }
  };

  const getTenVaiTro = (item) => {
    return (
      item.vaiTro?.tenVaiTro ||
      item.tenVaiTro ||
      dsVaiTro.find((vt) => vt.vaiTroId === item.vaiTroId)?.tenVaiTro ||
      "-"
    );
  };

  const filteredNguoiDung = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) return dsNguoiDung;

    return dsNguoiDung.filter((item) => {
      const hoTen = item.hoTen?.toLowerCase() || "";
      const email = item.email?.toLowerCase() || "";
      const soDienThoai = item.soDienThoai?.toLowerCase() || "";
      const vaiTro = getTenVaiTro(item).toLowerCase();
      const trangThai = item.trangThai?.toLowerCase() || "";

      return (
        hoTen.includes(text) ||
        email.includes(text) ||
        soDienThoai.includes(text) ||
        vaiTro.includes(text) ||
        trangThai.includes(text)
      );
    });
  }, [keyword, dsNguoiDung, dsVaiTro]);

  return (
    <div className="page-container nguoi-dung-page">
      <div className="page-header">
        <div>
          <h2>Quản lý người dùng</h2>
          <p>Quản lý tài khoản, vai trò và trạng thái người dùng trong hệ thống.</p>
        </div>
      </div>

      <div className="nd-card">
        <div className="nd-card-header">
          <div>
            <h3>{editingId ? "Cập nhật người dùng" : "Thêm người dùng"}</h3>
            <span>
              {editingId
                ? "Chỉnh sửa thông tin tài khoản đã chọn"
                : "Nhập thông tin để tạo tài khoản mới"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="nd-form">
          <div className="nd-grid">
            <div className="nd-form-group">
              <label>Họ tên</label>
              <input
                type="text"
                name="hoTen"
                value={form.hoTen}
                onChange={handleChange}
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="nd-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email"
              />
            </div>

            <div className="nd-form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="matKhau"
                value={form.matKhau}
                onChange={handleChange}
                placeholder={editingId ? "Bỏ trống nếu không đổi" : "Nhập mật khẩu"}
              />
            </div>

            <div className="nd-form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="soDienThoai"
                value={form.soDienThoai}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="nd-form-group">
              <label>Vai trò</label>
              <select
                name="vaiTroId"
                value={form.vaiTroId}
                onChange={handleChange}
              >
                <option value="">-- Chọn vai trò --</option>
                {dsVaiTro.map((vt) => (
                  <option key={vt.vaiTroId} value={vt.vaiTroId}>
                    {vt.tenVaiTro}
                  </option>
                ))}
              </select>
            </div>

            <div className="nd-form-group">
              <label>Trạng thái</label>
              <select
                name="trangThai"
                value={form.trangThai}
                onChange={handleChange}
              >
                <option value="HoatDong">Hoạt động</option>
                <option value="Khoa">Khóa</option>
              </select>
            </div>
          </div>

          <div className="nd-actions">
            <button type="submit" className="btn-save">
              {editingId ? "Cập nhật" : "Thêm mới"}
            </button>

            {editingId && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Hủy sửa
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="nd-card">
        <div className="nd-table-header">
          <div>
            <h3>Danh sách người dùng</h3>
            <span>{filteredNguoiDung.length} tài khoản</span>
          </div>

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm người dùng..."
            className="nd-search"
          />
        </div>

        <div className="nd-table-wrap">
          {loading ? (
            <div className="nd-empty">Đang tải dữ liệu...</div>
          ) : (
            <table className="nd-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredNguoiDung.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="nd-empty-cell">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredNguoiDung.map((item) => (
                    <tr key={item.nguoiDungId}>
                      <td>{item.nguoiDungId}</td>
                      <td className="fw-medium">{item.hoTen}</td>
                      <td>{item.email}</td>
                      <td>{item.soDienThoai || "-"}</td>
                      <td>{getTenVaiTro(item)}</td>
                      <td>
                        <span
                          className={
                            item.trangThai === "HoatDong"
                              ? "status-badge active"
                              : "status-badge locked"
                          }
                        >
                          {item.trangThai === "HoatDong" ? "Hoạt động" : "Khóa"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => handleEdit(item)}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => handleDelete(item.nguoiDungId)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default NguoiDung;