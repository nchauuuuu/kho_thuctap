using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("LichSuTonKho")]
[Index("NguyenVatLieuId", "ThoiGian", Name = "IX_LichSuTonKho_NguyenVatLieuId_ThoiGian")]
public partial class LichSuTonKho
{
    [Key]
    public int LichSuTonKhoId { get; set; }

    public int NguyenVatLieuId { get; set; }

    [StringLength(50)]
    public string LoaiGiaoDich { get; set; } = null!;

    [StringLength(100)]
    public string? BangLienQuan { get; set; }

    public int? BanGhiLienQuanId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal SoLuongThayDoi { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TonTruoc { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TonSau { get; set; }

    public int NguoiThucHienId { get; set; }

    public DateTime ThoiGian { get; set; }

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [ForeignKey("NguoiThucHienId")]
    [InverseProperty("LichSuTonKhos")]
    public virtual NguoiDung NguoiThucHien { get; set; } = null!;

    [ForeignKey("NguyenVatLieuId")]
    [InverseProperty("LichSuTonKhos")]
    public virtual NguyenVatLieu NguyenVatLieu { get; set; } = null!;
}
