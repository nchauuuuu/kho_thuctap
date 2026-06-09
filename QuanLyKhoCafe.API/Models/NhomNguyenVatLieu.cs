using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("NhomNguyenVatLieu")]
[Index("TenNhom", Name = "UQ__NhomNguy__2B432D0D633A51DF", IsUnique = true)]
public partial class NhomNguyenVatLieu
{
    [Key]
    public int NhomNguyenVatLieuId { get; set; }

    [StringLength(150)]
    public string TenNhom { get; set; } = null!;

    [StringLength(255)]
    public string? MoTa { get; set; }

    [InverseProperty("NhomNguyenVatLieu")]
    public virtual ICollection<NguyenVatLieu> NguyenVatLieus { get; set; } = new List<NguyenVatLieu>();
}
