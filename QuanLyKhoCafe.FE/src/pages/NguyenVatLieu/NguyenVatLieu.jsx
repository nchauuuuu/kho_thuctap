import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

function NguyenVatLieu() {
  const [dsNguyenVatLieu, setDsNguyenVatLieu] = useState([]);
  const [dsNhomNguyenVatLieu, setDsNhomNguyenVatLieu] = useState([]);
  const [dsDonViTinh, setDsDonViTinh] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    maNguyenVatLieu: "",
    tenNguyenVatLieu: "",
    nhomNguyenVatLieuId: "",
    donViTinhId: "",
    tonHienTai: 0,
    tonToiThieu: 0,
    trangThaiNguyenVatLieu: "DangSuDung",
    ghiChu: "",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);

    try {
      const [resNguyenVatLieu, resNhom, resDonViTinh] = await Promise.all([
        axiosClient.get("/NguyenVatLieu"),
        axiosClient.get("/NhomNguyenVatLieu"),
        axiosClient.get("/DonViTinh"),
      ]);

      console.log("Nguyên vật liệu:", resNguyenVatLieu.data);
      console.log("Nhóm nguyên vật liệu:", resNhom.data);
      console.log("Đơn vị tính:", resDonViTinh.data);

      setDsNguyenVatLieu(resNguyenVatLieu.data);
      setDsNhomNguyenVatLieu(resNhom.data);
      setDsDonViTinh(resDonViTinh.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      alert("Không thể tải dữ liệu nguyên vật liệu");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      maNguyenVatLieu: "",
      tenNguyenVatLieu: "",
      nhomNguyenVatLieuId: "",
      donViTinhId: "",
      tonHienTai: 0,
      tonToiThieu: 0,
      trangThaiNguyenVatLieu: "DangSuDung",
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
    setSelectedId(item.nguyenVatLieuId);
    setIsEditing(true);
    setShowForm(true);

    setFormData({
      maNguyenVatLieu: item.maNguyenVatLieu || item.maNVL || "",
      tenNguyenVatLieu: item.tenNguyenVatLieu || "",
      nhomNguyenVatLieuId: item.nhomNguyenVatLieuId || "",
      donViTinhId: item.donViTinhId || "",
      tonHienTai: item.tonHienTai ?? 0,
      tonToiThieu: item.tonToiThieu ?? 0,
      trangThaiNguyenVatLieu:
        item.trangThaiNguyenVatLieu || item.trangThai || "DangSuDung",
      ghiChu: item.ghiChu || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa nguyên vật liệu này không?"
    );

    if (!confirmDelete) return;

    try {
      await axiosClient.delete(`/NguyenVatLieu/${id}`);
      alert("Xóa nguyên vật liệu thành công");
      loadAllData();
    } catch (error) {
      console.error("Lỗi xóa nguyên vật liệu:", error);
      console.log("Chi tiết lỗi:", error.response?.data);
      alert("Không thể xóa nguyên vật liệu này");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.maNguyenVatLieu.trim()) {
      alert("Vui lòng nhập mã nguyên vật liệu");
      return;
    }

    if (!formData.tenNguyenVatLieu.trim()) {
      alert("Vui lòng nhập tên nguyên vật liệu");
      return;
    }

    if (!formData.nhomNguyenVatLieuId) {
      alert("Vui lòng chọn nhóm nguyên vật liệu");
      return;
    }

    if (!formData.donViTinhId) {
      alert("Vui lòng chọn đơn vị tính");
      return;
    }

    const dataSend = {
      maNguyenVatLieu: formData.maNguyenVatLieu,
      tenNguyenVatLieu: formData.tenNguyenVatLieu,
      nhomNguyenVatLieuId: Number(formData.nhomNguyenVatLieuId),
      donViTinhId: Number(formData.donViTinhId),
      tonHienTai: Number(formData.tonHienTai),
      tonToiThieu: Number(formData.tonToiThieu),
      trangThaiNguyenVatLieu: formData.trangThaiNguyenVatLieu,
      ghiChu: formData.ghiChu,
    };

    try {
      if (isEditing) {
        await axiosClient.put(`/NguyenVatLieu/${selectedId}`, dataSend);
        alert("Cập nhật nguyên vật liệu thành công");
      } else {
        await axiosClient.post("/NguyenVatLieu", dataSend);
        alert("Thêm nguyên vật liệu thành công");
      }

      resetForm();
      loadAllData();
    } catch (error) {
      console.error("Lỗi lưu nguyên vật liệu:", error);
      console.log("Chi tiết lỗi:", error.response?.data);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.response?.data?.errors) {
        alert("Dữ liệu chưa hợp lệ, kiểm tra lại mã/tên nguyên vật liệu");
      } else {
        alert("Không thể lưu nguyên vật liệu");
      }
    }
  };

  const getTenNhom = (item) => {
    return (
      item.tenNhom ||
      item.nhomNguyenVatLieu?.tenNhom ||
      item.nhomNguyenVatLieu?.tenNhomNguyenVatLieu ||
      "Không có"
    );
  };

  const getTenDonVi = (item) => {
    return (
      item.tenDonVi ||
      item.tenDonViTinh ||
      item.donViTinh?.tenDonVi ||
      item.donViTinh?.tenDonViTinh ||
      "Không có"
    );
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

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ddd",
    borderRadius: "6px",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Quản lý nguyên vật liệu</h2>
          <p>Danh sách nguyên vật liệu đang được quản lý trong kho cà phê</p>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm nguyên vật liệu
        </button>
      </div>

      {showForm && (
        <div className="table-card" style={{ marginBottom: "20px" }}>
          <h3>
            {isEditing ? "Cập nhật nguyên vật liệu" : "Thêm nguyên vật liệu"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Mã nguyên vật liệu</label>
              <input
                type="text"
                value={formData.maNguyenVatLieu}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maNguyenVatLieu: e.target.value,
                  })
                }
                placeholder="Ví dụ: NVL010"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Tên nguyên vật liệu</label>
              <input
                type="text"
                value={formData.tenNguyenVatLieu}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tenNguyenVatLieu: e.target.value,
                  })
                }
                placeholder="Nhập tên nguyên vật liệu"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Nhóm nguyên vật liệu</label>
              <select
                value={formData.nhomNguyenVatLieuId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nhomNguyenVatLieuId: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="">-- Chọn nhóm nguyên vật liệu --</option>
                {dsNhomNguyenVatLieu.map((item) => (
                  <option
                    key={item.nhomNguyenVatLieuId}
                    value={item.nhomNguyenVatLieuId}
                  >
                    {item.tenNhom || item.tenNhomNguyenVatLieu}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Đơn vị tính</label>
              <select
                value={formData.donViTinhId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    donViTinhId: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="">-- Chọn đơn vị tính --</option>
                {dsDonViTinh.map((item) => (
                  <option key={item.donViTinhId} value={item.donViTinhId}>
                    {item.tenDonVi || item.tenDonViTinh}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Tồn hiện tại</label>
              <input
                type="number"
                value={formData.tonHienTai}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tonHienTai: e.target.value,
                  })
                }
                min="0"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Tồn tối thiểu</label>
              <input
                type="number"
                value={formData.tonToiThieu}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tonToiThieu: e.target.value,
                  })
                }
                min="0"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Trạng thái</label>
              <select
                value={formData.trangThaiNguyenVatLieu}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trangThaiNguyenVatLieu: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="DangSuDung">Đang sử dụng</option>
                <option value="NgungSuDung">Ngưng sử dụng</option>
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
                style={inputStyle}
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
                  <th>Mã NVL</th>
                  <th>Tên nguyên vật liệu</th>
                  <th>Nhóm</th>
                  <th>Đơn vị</th>
                  <th>Tồn hiện tại</th>
                  <th>Tồn tối thiểu</th>
                  <th>Trạng thái tồn</th>
                  <th>Trạng thái NVL</th>
                  <th>Ghi chú</th>
                  <th style={stickyHeaderStyle}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {dsNguyenVatLieu.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center">
                      Chưa có dữ liệu
                    </td>
                  </tr>
                ) : (
                  dsNguyenVatLieu.map((item) => (
                    <tr key={item.nguyenVatLieuId}>
                      <td>{item.nguyenVatLieuId}</td>

                      <td>
                        {item.maNguyenVatLieu ||
                          item.maNVL ||
                          `NVL${item.nguyenVatLieuId}`}
                      </td>

                      <td>{item.tenNguyenVatLieu}</td>

                      <td>{getTenNhom(item)}</td>

                      <td>{getTenDonVi(item)}</td>

                      <td>{item.tonHienTai}</td>

                      <td>{item.tonToiThieu}</td>

                      <td>{item.trangThaiTonKho || "Không có"}</td>

                      <td>
                        {item.trangThaiNguyenVatLieu ||
                          item.trangThai ||
                          "Không có"}
                      </td>

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
                          onClick={() => handleDelete(item.nguyenVatLieuId)}
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

export default NguyenVatLieu;