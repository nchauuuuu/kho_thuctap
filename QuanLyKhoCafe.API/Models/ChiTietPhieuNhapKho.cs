using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("ChiTietPhieuNhapKho")]
public partial class ChiTietPhieuNhapKho
{
    [Key]
    public int ChiTietPhieuNhapKhoId { get; set; }

    public int PhieuNhapKhoId { get; set; }

    public int NguyenVatLieuId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoLuongNhap { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? DonGia { get; set; }

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [ForeignKey("NguyenVatLieuId")]
    [InverseProperty("ChiTietPhieuNhapKhos")]
    public virtual NguyenVatLieu NguyenVatLieu { get; set; } = null!;

    [ForeignKey("PhieuNhapKhoId")]
    [InverseProperty("ChiTietPhieuNhapKhos")]
    public virtual PhieuNhapKho PhieuNhapKho { get; set; } = null!;
}
