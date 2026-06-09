using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("PhieuKiemKeKho")]
[Index("MaPhieuKiemKe", Name = "UQ__PhieuKie__40B08EA91DD36AE7", IsUnique = true)]
public partial class PhieuKiemKeKho
{
    [Key]
    public int PhieuKiemKeKhoId { get; set; }

    [StringLength(50)]
    public string MaPhieuKiemKe { get; set; } = null!;

    public int NguoiKiemKeId { get; set; }

    public int? NguoiXacNhanId { get; set; }

    public DateTime NgayKiemKe { get; set; }

    public DateTime? NgayXacNhan { get; set; }

    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [InverseProperty("PhieuKiemKeKho")]
    public virtual ICollection<ChiTietPhieuKiemKeKho> ChiTietPhieuKiemKeKhos { get; set; } = new List<ChiTietPhieuKiemKeKho>();

    [ForeignKey("NguoiKiemKeId")]
    [InverseProperty("PhieuKiemKeKhoNguoiKiemKes")]
    public virtual NguoiDung NguoiKiemKe { get; set; } = null!;

    [ForeignKey("NguoiXacNhanId")]
    [InverseProperty("PhieuKiemKeKhoNguoiXacNhans")]
    public virtual NguoiDung? NguoiXacNhan { get; set; }
}
