using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("DonViTinh")]
[Index("TenDonVi", Name = "UQ__DonViTin__9031EA25C59891BE", IsUnique = true)]
public partial class DonViTinh
{
    [Key]
    public int DonViTinhId { get; set; }

    [StringLength(50)]
    public string TenDonVi { get; set; } = null!;

    [InverseProperty("DonViTinh")]
    public virtual ICollection<NguyenVatLieu> NguyenVatLieus { get; set; } = new List<NguyenVatLieu>();
}
