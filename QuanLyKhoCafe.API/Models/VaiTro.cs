using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Table("VaiTro")]
[Index("TenVaiTro", Name = "UQ__VaiTro__1DA558144BE752C1", IsUnique = true)]
public partial class VaiTro
{
    [Key]
    public int VaiTroId { get; set; }

    [StringLength(100)]
    public string TenVaiTro { get; set; } = null!;

    [StringLength(255)]
    public string? MoTa { get; set; }

    [InverseProperty("VaiTro")]
    public virtual ICollection<NguoiDung> NguoiDungs { get; set; } = new List<NguoiDung>();
}
