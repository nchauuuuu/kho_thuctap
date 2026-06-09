using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("YeuCauXuatKho")]
[Index("TrangThai", Name = "IX_YeuCauXuatKho_TrangThai")]
[Index("MaYeuCau", Name = "UQ__YeuCauXu__CFA5DF4F73909ACE", IsUnique = true)]
public partial class YeuCauXuatKho
{
    [Key]
    public int YeuCauXuatKhoId { get; set; }

    [StringLength(50)]
    public string MaYeuCau { get; set; } = null!;

    public int NguoiYeuCauId { get; set; }

    public DateTime NgayYeuCau { get; set; }

    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [InverseProperty("YeuCauXuatKho")]
    public virtual ICollection<ChiTietYeuCauXuatKho> ChiTietYeuCauXuatKhos { get; set; } = new List<ChiTietYeuCauXuatKho>();

    [ForeignKey("NguoiYeuCauId")]
    [InverseProperty("YeuCauXuatKhos")]
    public virtual NguoiDung NguoiYeuCau { get; set; } = null!;

    [InverseProperty("YeuCauXuatKho")]
    public virtual ICollection<PhieuXuatKho> PhieuXuatKhos { get; set; } = new List<PhieuXuatKho>();
}
