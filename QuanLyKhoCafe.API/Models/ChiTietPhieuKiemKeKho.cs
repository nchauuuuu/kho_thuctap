using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("ChiTietPhieuKiemKeKho")]
public partial class ChiTietPhieuKiemKeKho
{
    [Key]
    public int ChiTietPhieuKiemKeKhoId { get; set; }

    public int PhieuKiemKeKhoId { get; set; }

    public int NguyenVatLieuId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoLuongHeThong { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoLuongThucTe { get; set; }

    [Column(TypeName = "decimal(19, 2)")]
    public decimal? ChenhLech { get; set; }

    [StringLength(255)]
    public string? LyDoChenhLech { get; set; }

    [ForeignKey("NguyenVatLieuId")]
    [InverseProperty("ChiTietPhieuKiemKeKhos")]
    public virtual NguyenVatLieu NguyenVatLieu { get; set; } = null!;

    [ForeignKey("PhieuKiemKeKhoId")]
    [InverseProperty("ChiTietPhieuKiemKeKhos")]
    public virtual PhieuKiemKeKho PhieuKiemKeKho { get; set; } = null!;
}
