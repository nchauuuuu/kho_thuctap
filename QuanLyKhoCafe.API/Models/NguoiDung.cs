using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("NguoiDung")]
[Index("VaiTroId", Name = "IX_NguoiDung_VaiTroId")]
[Index("Email", Name = "UQ__NguoiDun__A9D10534ECF034D1", IsUnique = true)]
public partial class NguoiDung
{
    [Key]
    public int NguoiDungId { get; set; }

    [StringLength(150)]
    public string HoTen { get; set; } = null!;

    [StringLength(150)]
    public string Email { get; set; } = null!;

    [StringLength(255)]
    public string MatKhauHash { get; set; } = null!;

    [StringLength(20)]
    public string? SoDienThoai { get; set; }

    public int VaiTroId { get; set; }

    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    public DateTime NgayTao { get; set; }

    [InverseProperty("NguoiThucHien")]
    public virtual ICollection<LichSuTonKho> LichSuTonKhos { get; set; } = new List<LichSuTonKho>();

    [InverseProperty("NguoiKiemKe")]
    public virtual ICollection<PhieuKiemKeKho> PhieuKiemKeKhoNguoiKiemKes { get; set; } = new List<PhieuKiemKeKho>();

    [InverseProperty("NguoiXacNhan")]
    public virtual ICollection<PhieuKiemKeKho> PhieuKiemKeKhoNguoiXacNhans { get; set; } = new List<PhieuKiemKeKho>();

    [InverseProperty("NguoiDuyet")]
    public virtual ICollection<PhieuNhapKho> PhieuNhapKhoNguoiDuyets { get; set; } = new List<PhieuNhapKho>();

    [InverseProperty("NguoiLap")]
    public virtual ICollection<PhieuNhapKho> PhieuNhapKhoNguoiLaps { get; set; } = new List<PhieuNhapKho>();

    [InverseProperty("NguoiDuyet")]
    public virtual ICollection<PhieuXuatKho> PhieuXuatKhoNguoiDuyets { get; set; } = new List<PhieuXuatKho>();

    [InverseProperty("NguoiLap")]
    public virtual ICollection<PhieuXuatKho> PhieuXuatKhoNguoiLaps { get; set; } = new List<PhieuXuatKho>();

    [ForeignKey("VaiTroId")]
    [InverseProperty("NguoiDungs")]
    public virtual VaiTro VaiTro { get; set; } = null!;

    [InverseProperty("NguoiYeuCau")]
    public virtual ICollection<YeuCauXuatKho> YeuCauXuatKhos { get; set; } = new List<YeuCauXuatKho>();
}
