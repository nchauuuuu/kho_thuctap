using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("PhieuXuatKho")]
[Index("TrangThai", Name = "IX_PhieuXuatKho_TrangThai")]
[Index("MaPhieuXuat", Name = "UQ__PhieuXua__26C4B5A32485492A", IsUnique = true)]
public partial class PhieuXuatKho
{
    [Key]
    public int PhieuXuatKhoId { get; set; }

    [StringLength(50)]
    public string MaPhieuXuat { get; set; } = null!;

    public int? YeuCauXuatKhoId { get; set; }

    public int NguoiLapId { get; set; }

    public int? NguoiDuyetId { get; set; }

    public DateTime NgayXuat { get; set; }

    public DateTime? NgayDuyet { get; set; }

    [StringLength(100)]
    public string LyDoXuat { get; set; } = null!;

    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [InverseProperty("PhieuXuatKho")]
    public virtual ICollection<ChiTietPhieuXuatKho> ChiTietPhieuXuatKhos { get; set; } = new List<ChiTietPhieuXuatKho>();

    [ForeignKey("NguoiDuyetId")]
    [InverseProperty("PhieuXuatKhoNguoiDuyets")]
    public virtual NguoiDung? NguoiDuyet { get; set; }

    [ForeignKey("NguoiLapId")]
    [InverseProperty("PhieuXuatKhoNguoiLaps")]
    public virtual NguoiDung NguoiLap { get; set; } = null!;

    [ForeignKey("YeuCauXuatKhoId")]
    [InverseProperty("PhieuXuatKhos")]
    public virtual YeuCauXuatKho? YeuCauXuatKho { get; set; }
}
