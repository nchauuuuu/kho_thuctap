using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("ChiTietPhieuXuatKho")]
public partial class ChiTietPhieuXuatKho
{
    [Key]
    public int ChiTietPhieuXuatKhoId { get; set; }

    public int PhieuXuatKhoId { get; set; }

    public int NguyenVatLieuId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoLuongXuat { get; set; }

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [ForeignKey("NguyenVatLieuId")]
    [InverseProperty("ChiTietPhieuXuatKhos")]
    public virtual NguyenVatLieu NguyenVatLieu { get; set; } = null!;

    [ForeignKey("PhieuXuatKhoId")]
    [InverseProperty("ChiTietPhieuXuatKhos")]
    public virtual PhieuXuatKho PhieuXuatKho { get; set; } = null!;
}
