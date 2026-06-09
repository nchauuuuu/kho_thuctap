import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function NhaCungCap() {
  const [dsNhaCungCap, setDsNhaCungCap] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    tenNhaCungCap: "",
    soDienThoai: "",
    email: "",
    diaChi: "",
    trangThai: "DangHopTac",
    ghiChu: "",
  });

  useEffect(() => {
    loadNhaCungCap();
  }, []);

  const loadNhaCungCap = async () => {
    try {
      const res = await axiosClient.get("/NhaCungCap");
      console.log(res.data);
      setDsNhaCungCap(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhà cung cấp:", error);
      alert("Không thể tải danh sách nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenNhaCungCap: "",
      soDienThoai: "",
      email: "",
      diaChi: "",
      trangThai: "DangHopTac",
      ghiChu: "",
    });

    setSelectedId(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setSelectedId(item.nhaCungCapId);
    setIsEditing(true);
    setShowForm(true);

    setFormData({
      tenNhaCungCap: item.tenNhaCungCap || "",
      soDienThoai: item.soDienThoai || "",
      email: item.email || "",
      diaChi: item.diaChi || "",
      trangThai: item.trangThai || "DangHopTac",
      ghiChu: item.ghiChu || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa nhà cung cấp này không?"
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/NhaCungCap/${id}`);
      alert("Xóa nhà cung cấp thành công");
      loadNhaCungCap();
    } catch (error) {
      console.error("Lỗi xóa nhà cung cấp:", error);
      alert("Không thể xóa nhà cung cấp này");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tenNhaCungCap.trim()) {
      alert("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    const dataSend = {
      tenNhaCungCap: formData.tenNhaCungCap,
      soDienThoai: formData.soDienThoai,
      email: formData.email,
      diaChi: formData.diaChi,
      trangThai: formData.trangThai,
      ghiChu: formData.ghiChu,
    };

    try {
      if (isEditing) {
        await axiosClient.put(`/NhaCungCap/${selectedId}`, dataSend);
        alert("Cập nhật nhà cung cấp thành công");
      } else {
        await axiosClient.post("/NhaCungCap", dataSend);
        alert("Thêm nhà cung cấp thành công");
      }

      resetForm();
      loadNhaCungCap();
    } catch (error) {
      console.error("Lỗi lưu nhà cung cấp:", error);
      console.log("Chi tiết lỗi:", error.response?.data);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Không thể lưu nhà cung cấp");
      }
    }
  };

  const tableWrapperStyle = {
    width: "100%",
    overflowX: "auto",
  };

  const tableStyle = {
    minWidth: "1450px",
    width: "100%",
  };

  const stickyHeaderStyle = {
    position: "sticky",
    right: 0,
    background: "#1f2933",
    zIndex: 3,
  };

  const stickyCellStyle = {
    position: "sticky",
    right: 0,
    background: "#fff",
    zIndex: 2,
    display: "flex",
    gap: "8px",
    alignItems: "center",
    minHeight: "70px",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý nhà cung cấp</h2>
          <p>Danh sách nhà cung cấp nguyên vật liệu cho kho cà phê</p>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm nhà cung cấp
        </button>
      </div>

      {showForm && (
        <div className="table-card" style={{ marginBottom: "20px" }}>
          <h3>{isEditing ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Tên nhà cung cấp</label>
              <input
                type="text"
                value={formData.tenNhaCungCap}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tenNhaCungCap: e.target.value,
                  })
                }
                placeholder="Nhập tên nhà cung cấp"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Số điện thoại</label>
              <input
                type="text"
                value={formData.soDienThoai}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    soDienThoai: e.target.value,
                  })
                }
                placeholder="Nhập số điện thoại"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                placeholder="Nhập email"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Địa chỉ</label>
              <input
                type="text"
                value={formData.diaChi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    diaChi: e.target.value,
                  })
                }
                placeholder="Nhập địa chỉ"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Trạng thái</label>
              <select
                value={formData.trangThai}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trangThai: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <option value="DangHopTac">Đang hợp tác</option>
                <option value="NgungHopTac">Ngưng hợp tác</option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Ghi chú</label>
              <input
                type="text"
                value={formData.ghiChu}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ghiChu: e.target.value,
                  })
                }
                placeholder="Nhập ghi chú"
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "6px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div>
              <button type="submit" className="btn-add">
                {isEditing ? "Cập nhật" : "Lưu"}
              </button>

              <button
                type="button"
                className="btn-delete"
                onClick={resetForm}
                style={{ marginLeft: "10px" }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={tableWrapperStyle}>
            <table className="data-table" style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã NCC</th>
                  <th>Tên nhà cung cấp</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Địa chỉ</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th style={stickyHeaderStyle}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {dsNhaCungCap.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  dsNhaCungCap.map((item) => (
                    <tr key={item.nhaCungCapId}>
                      <td>{item.nhaCungCapId}</td>

                      <td>
                        {item.maNhaCungCap ||
                          item.maNCC ||
                          `NCC${item.nhaCungCapId}`}
                      </td>

                      <td>{item.tenNhaCungCap}</td>

                      <td>{item.soDienThoai || "Không có"}</td>

                      <td>{item.email || "Không có"}</td>

                      <td>{item.diaChi || "Không có"}</td>

                      <td>{item.trangThai || "Không có"}</td>

                      <td>{item.ghiChu || "Không có"}</td>

                      <td style={stickyCellStyle}>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          Sửa
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item.nhaCungCapId)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default NhaCungCap;