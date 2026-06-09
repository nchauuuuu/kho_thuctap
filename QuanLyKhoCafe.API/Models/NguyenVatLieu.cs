using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("NguyenVatLieu")]
[Index("NhomNguyenVatLieuId", Name = "IX_NguyenVatLieu_NhomNguyenVatLieuId")]
[Index("TenNguyenVatLieu", Name = "IX_NguyenVatLieu_TenNguyenVatLieu")]
[Index("MaNguyenVatLieu", Name = "UQ__NguyenVa__23D814DC0599F22C", IsUnique = true)]
public partial class NguyenVatLieu
{
    [Key]
    public int NguyenVatLieuId { get; set; }

    [StringLength(50)]
    public string MaNguyenVatLieu { get; set; } = null!;

    [StringLength(150)]
    public string TenNguyenVatLieu { get; set; } = null!;

    public int NhomNguyenVatLieuId { get; set; }

    public int DonViTinhId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TonHienTai { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TonToiThieu { get; set; }

    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [InverseProperty("NguyenVatLieu")]
    public virtual ICollection<ChiTietPhieuKiemKeKho> ChiTietPhieuKiemKeKhos { get; set; } = new List<ChiTietPhieuKiemKeKho>();

    [InverseProperty("NguyenVatLieu")]
    public virtual ICollection<ChiTietPhieuNhapKho> ChiTietPhieuNhapKhos { get; set; } = new List<ChiTietPhieuNhapKho>();

    [InverseProperty("NguyenVatLieu")]
    public virtual ICollection<ChiTietPhieuXuatKho> ChiTietPhieuXuatKhos { get; set; } = new List<ChiTietPhieuXuatKho>();

    [InverseProperty("NguyenVatLieu")]
    public virtual ICollection<ChiTietYeuCauXuatKho> ChiTietYeuCauXuatKhos { get; set; } = new List<ChiTietYeuCauXuatKho>();

    [ForeignKey("DonViTinhId")]
    [InverseProperty("NguyenVatLieus")]
    public virtual DonViTinh DonViTinh { get; set; } = null!;

    [InverseProperty("NguyenVatLieu")]
    public virtual ICollection<LichSuTonKho> LichSuTonKhos { get; set; } = new List<LichSuTonKho>();

    [ForeignKey("NhomNguyenVatLieuId")]
    [InverseProperty("NguyenVatLieus")]
    public virtual NhomNguyenVatLieu NhomNguyenVatLieu { get; set; } = null!;
}
