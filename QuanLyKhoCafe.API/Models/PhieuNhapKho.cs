using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("PhieuNhapKho")]
[Index("TrangThai", Name = "IX_PhieuNhapKho_TrangThai")]
[Index("MaPhieuNhap", Name = "UQ__PhieuNha__1470EF3AF1BEC750", IsUnique = true)]
public partial class PhieuNhapKho
{
    [Key]
    public int PhieuNhapKhoId { get; set; }

    [StringLength(50)]
    public string MaPhieuNhap { get; set; } = null!;

    public int? NhaCungCapId { get; set; }

    public int NguoiLapId { get; set; }

    public int? NguoiDuyetId { get; set; }

    public DateTime NgayNhap { get; set; }

    public DateTime? NgayDuyet { get; set; }

    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [InverseProperty("PhieuNhapKho")]
    public virtual ICollection<ChiTietPhieuNhapKho> ChiTietPhieuNhapKhos { get; set; } = new List<ChiTietPhieuNhapKho>();

    [ForeignKey("NguoiDuyetId")]
    [InverseProperty("PhieuNhapKhoNguoiDuyets")]
    public virtual NguoiDung? NguoiDuyet { get; set; }

    [ForeignKey("NguoiLapId")]
    [InverseProperty("PhieuNhapKhoNguoiLaps")]
    public virtual NguoiDung NguoiLap { get; set; } = null!;

    [ForeignKey("NhaCungCapId")]
    [InverseProperty("PhieuNhapKhos")]
    public virtual NhaCungCap? NhaCungCap { get; set; }
}
