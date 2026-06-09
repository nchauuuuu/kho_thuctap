using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("ChiTietYeuCauXuatKho")]
public partial class ChiTietYeuCauXuatKho
{
    [Key]
    public int ChiTietYeuCauXuatKhoId { get; set; }

    public int YeuCauXuatKhoId { get; set; }

    public int NguyenVatLieuId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoLuongYeuCau { get; set; }

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [ForeignKey("NguyenVatLieuId")]
    [InverseProperty("ChiTietYeuCauXuatKhos")]
    public virtual NguyenVatLieu NguyenVatLieu { get; set; } = null!;

    [ForeignKey("YeuCauXuatKhoId")]
    [InverseProperty("ChiTietYeuCauXuatKhos")]
    public virtual YeuCauXuatKho YeuCauXuatKho { get; set; } = null!;
}
