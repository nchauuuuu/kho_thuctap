using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("NhaCungCap")]
public partial class NhaCungCap
{
    [Key]
    public int NhaCungCapId { get; set; }

    [StringLength(150)]
    public string TenNhaCungCap { get; set; } = null!;

    [StringLength(20)]
    public string? SoDienThoai { get; set; }

    [StringLength(255)]
    public string? DiaChi { get; set; }

    [StringLength(255)]
    public string? NhomNguyenLieuCungCap { get; set; }

    [StringLength(255)]
    public string? GhiChu { get; set; }

    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    [InverseProperty("NhaCungCap")]
    public virtual ICollection<PhieuNhapKho> PhieuNhapKhos { get; set; } = new List<PhieuNhapKho>();
}
