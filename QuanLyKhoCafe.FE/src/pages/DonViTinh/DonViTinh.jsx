import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function DonViTinh() {
  const [dsDonViTinh, setDsDonViTinh] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    tenDonVi: "",
    ghiChu: "",
  });

  useEffect(() => {
    loadDonViTinh();
  }, []);

  const loadDonViTinh = async () => {
    try {
      const res = await axiosClient.get("/DonViTinh");
      console.log(res.data);
      setDsDonViTinh(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn vị tính:", error);
      alert("Không thể tải danh sách đơn vị tính");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenDonVi: "",
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
    setSelectedId(item.donViTinhId);
    setIsEditing(true);
    setShowForm(true);

    setFormData({
      tenDonVi: item.tenDonVi || item.tenDonViTinh || "",
      ghiChu: item.ghiChu || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa đơn vị tính này không?"
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/DonViTinh/${id}`);
      alert("Xóa đơn vị tính thành công");
      loadDonViTinh();
    } catch (error) {
      console.error("Lỗi xóa đơn vị tính:", error);
      alert("Không thể xóa đơn vị tính này");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tenDonVi.trim()) {
      alert("Vui lòng nhập tên đơn vị tính");
      return;
    }

    const dataSend = {
      tenDonVi: formData.tenDonVi,
      ghiChu: formData.ghiChu,
    };

    try {
      if (isEditing) {
        await axiosClient.put(`/DonViTinh/${selectedId}`, {
          donViTinhId: selectedId,
          ...dataSend,
        });

        alert("Cập nhật đơn vị tính thành công");
      } else {
        await axiosClient.post("/DonViTinh", dataSend);

        alert("Thêm đơn vị tính thành công");
      }

      resetForm();
      loadDonViTinh();
    } catch (error) {
      console.error("Lỗi lưu đơn vị tính:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Không thể lưu đơn vị tính");
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý đơn vị tính</h2>
          <p>Danh sách đơn vị dùng để tính số lượng nguyên vật liệu trong kho</p>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm đơn vị
        </button>
      </div>

      {showForm && (
        <div className="table-card" style={{ marginBottom: "20px" }}>
          <h3>{isEditing ? "Cập nhật đơn vị tính" : "Thêm đơn vị tính"}</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Tên đơn vị tính</label>
              <input
                type="text"
                value={formData.tenDonVi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tenDonVi: e.target.value,
                  })
                }
                placeholder="Nhập tên đơn vị tính"
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
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn vị</th>
                <th>Tên đơn vị</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {dsDonViTinh.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                dsDonViTinh.map((item) => (
                  <tr key={item.donViTinhId}>
                    <td>{item.donViTinhId}</td>

                    <td>
                      {item.maDonViTinh ||
                        item.maDonVi ||
                        `DVT${item.donViTinhId}`}
                    </td>

                    <td>{item.tenDonVi || item.tenDonViTinh}</td>

                    <td>{item.ghiChu || "Không có"}</td>

                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(item)}
                      >
                        Sửa
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.donViTinhId)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DonViTinh;