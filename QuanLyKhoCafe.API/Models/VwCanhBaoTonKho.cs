using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyKhoCafe.API.Models;

[Keyless]
public partial class VwCanhBaoTonKho
{
    public int NguyenVatLieuId { get; set; }

    [StringLength(50)]
    public string MaNguyenVatLieu { get; set; } = null!;

    [StringLength(150)]
    public string TenNguyenVatLieu { get; set; } = null!;

    [StringLength(150)]
    public string TenNhom { get; set; } = null!;

    [StringLength(50)]
    public string TenDonVi { get; set; } = null!;

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TonHienTai { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TonToiThieu { get; set; }

    [StringLength(10)]
    public string TrangThaiTonKho { get; set; } = null!;
}
