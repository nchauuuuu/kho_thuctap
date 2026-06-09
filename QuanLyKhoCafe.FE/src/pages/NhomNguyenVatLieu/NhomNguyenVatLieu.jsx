import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function NhomNguyenVatLieu() {
  const [dsNhomNguyenVatLieu, setDsNhomNguyenVatLieu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    tenNhom: "",
    ghiChu: "",
  });

  useEffect(() => {
    loadNhomNguyenVatLieu();
  }, []);

  const loadNhomNguyenVatLieu = async () => {
    try {
      const res = await axiosClient.get("/NhomNguyenVatLieu");
      console.log(res.data);
      setDsNhomNguyenVatLieu(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhóm nguyên vật liệu:", error);
      alert("Không thể tải danh sách nhóm nguyên vật liệu");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenNhom: "",
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
    setSelectedId(item.nhomNguyenVatLieuId);
    setIsEditing(true);
    setShowForm(true);

    setFormData({
      tenNhom: item.tenNhom || item.tenNhomNguyenVatLieu || "",
      ghiChu: item.ghiChu || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa nhóm nguyên vật liệu này không?"
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/NhomNguyenVatLieu/${id}`);
      alert("Xóa nhóm nguyên vật liệu thành công");
      loadNhomNguyenVatLieu();
    } catch (error) {
      console.error("Lỗi xóa nhóm nguyên vật liệu:", error);
      alert("Không thể xóa nhóm nguyên vật liệu này");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tenNhom.trim()) {
      alert("Vui lòng nhập tên nhóm nguyên vật liệu");
      return;
    }

    const dataSend = {
      tenNhom: formData.tenNhom,
      ghiChu: formData.ghiChu,
    };

    try {
     if (isEditing) {
        await axiosClient.put(`/NhomNguyenVatLieu/${selectedId}`, dataSend);

  alert("Cập nhật nhóm nguyên vật liệu thành công");
      } else {
        await axiosClient.post("/NhomNguyenVatLieu", dataSend);

        alert("Thêm nhóm nguyên vật liệu thành công");
      }

      resetForm();
      loadNhomNguyenVatLieu();
    } catch (error) {
      console.error("Lỗi lưu nhóm nguyên vật liệu:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Không thể lưu nhóm nguyên vật liệu");
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý nhóm nguyên vật liệu</h2>
          <p>Danh sách nhóm dùng để phân loại nguyên vật liệu trong kho</p>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm nhóm
        </button>
      </div>

      {showForm && (
        <div className="table-card" style={{ marginBottom: "20px" }}>
          <h3>
            {isEditing
              ? "Cập nhật nhóm nguyên vật liệu"
              : "Thêm nhóm nguyên vật liệu"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Tên nhóm nguyên vật liệu</label>
              <input
                type="text"
                value={formData.tenNhom}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tenNhom: e.target.value,
                  })
                }
                placeholder="Nhập tên nhóm nguyên vật liệu"
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
                <th>Mã nhóm</th>
                <th>Tên nhóm</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {dsNhomNguyenVatLieu.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Chưa có dữ liệu
                  </td>
                </tr>
              ) : (
                dsNhomNguyenVatLieu.map((item) => (
                  <tr key={item.nhomNguyenVatLieuId}>
                    <td>{item.nhomNguyenVatLieuId}</td>

                    <td>
                      {item.maNhom ||
                        item.maNhomNguyenVatLieu ||
                        `NHOM${item.nhomNguyenVatLieuId}`}
                    </td>

                    <td>{item.tenNhom || item.tenNhomNguyenVatLieu}</td>

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
                        onClick={() =>
                          handleDelete(item.nhomNguyenVatLieuId)
                        }
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

export default NhomNguyenVatLieu;