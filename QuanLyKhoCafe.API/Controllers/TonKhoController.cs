using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;

namespace QuanLyKhoCafe.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TonKhoController : ControllerBase
{
	private readonly QuanLyKhoCafeDbContext _context;

	public TonKhoController(QuanLyKhoCafeDbContext context)
	{
		_context = context;
	}

	// GET: api/TonKho
	[HttpGet]
	public async Task<ActionResult<IEnumerable<TonKhoResponse>>> GetTonKho()
	{
		var data = await _context.NguyenVatLieus
			.AsNoTracking()
			.Select(nvl => new TonKhoResponse
			{
				NguyenVatLieuId = nvl.NguyenVatLieuId,
				MaNguyenVatLieu = nvl.MaNguyenVatLieu,
				TenNguyenVatLieu = nvl.TenNguyenVatLieu,

				NhomNguyenVatLieuId = nvl.NhomNguyenVatLieuId,
				TenNhom = nvl.NhomNguyenVatLieu.TenNhom,

				DonViTinhId = nvl.DonViTinhId,
				TenDonVi = nvl.DonViTinh.TenDonVi,

				TonHienTai = nvl.TonHienTai,
				TonToiThieu = nvl.TonToiThieu,

				TrangThaiTonKho = nvl.TonHienTai <= nvl.TonToiThieu
					? "SapHet"
					: "BinhThuong",

				TrangThaiNguyenVatLieu = nvl.TrangThai,
				GhiChu = nvl.GhiChu
			})
			.OrderBy(x => x.TenNguyenVatLieu)
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/TonKho/5
	[HttpGet("{nguyenVatLieuId:int}")]
	public async Task<ActionResult<TonKhoResponse>> GetTonKhoTheoNguyenVatLieu(int nguyenVatLieuId)
	{
		var data = await _context.NguyenVatLieus
			.AsNoTracking()
			.Where(nvl => nvl.NguyenVatLieuId == nguyenVatLieuId)
			.Select(nvl => new TonKhoResponse
			{
				NguyenVatLieuId = nvl.NguyenVatLieuId,
				MaNguyenVatLieu = nvl.MaNguyenVatLieu,
				TenNguyenVatLieu = nvl.TenNguyenVatLieu,

				NhomNguyenVatLieuId = nvl.NhomNguyenVatLieuId,
				TenNhom = nvl.NhomNguyenVatLieu.TenNhom,

				DonViTinhId = nvl.DonViTinhId,
				TenDonVi = nvl.DonViTinh.TenDonVi,

				TonHienTai = nvl.TonHienTai,
				TonToiThieu = nvl.TonToiThieu,

				TrangThaiTonKho = nvl.TonHienTai <= nvl.TonToiThieu
					? "SapHet"
					: "BinhThuong",

				TrangThaiNguyenVatLieu = nvl.TrangThai,
				GhiChu = nvl.GhiChu
			})
			.FirstOrDefaultAsync();

		if (data == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy nguyên vật liệu."
			});
		}

		return Ok(data);
	}

	// GET: api/TonKho/canh-bao-sap-het
	[HttpGet("canh-bao-sap-het")]
	public async Task<ActionResult<IEnumerable<CanhBaoTonKhoResponse>>> GetCanhBaoSapHet()
	{
		var data = await _context.VwCanhBaoTonKhos
			.AsNoTracking()
			.Select(cb => new CanhBaoTonKhoResponse
			{
				NguyenVatLieuId = cb.NguyenVatLieuId,
				MaNguyenVatLieu = cb.MaNguyenVatLieu,
				TenNguyenVatLieu = cb.TenNguyenVatLieu,
				TenNhom = cb.TenNhom,
				TenDonVi = cb.TenDonVi,
				TonHienTai = cb.TonHienTai,
				TonToiThieu = cb.TonToiThieu,
				TrangThaiTonKho = cb.TrangThaiTonKho
			})
			.OrderBy(x => x.TonHienTai)
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/TonKho/tim-kiem?keyword=ca
	[HttpGet("tim-kiem")]
	public async Task<ActionResult<IEnumerable<TonKhoResponse>>> TimKiemTonKho([FromQuery] string? keyword)
	{
		if (string.IsNullOrWhiteSpace(keyword))
		{
			return BadRequest(new
			{
				message = "Vui lòng nhập từ khóa tìm kiếm."
			});
		}

		keyword = keyword.Trim();

		var data = await _context.NguyenVatLieus
			.AsNoTracking()
			.Where(nvl =>
				nvl.MaNguyenVatLieu.Contains(keyword) ||
				nvl.TenNguyenVatLieu.Contains(keyword) ||
				nvl.NhomNguyenVatLieu.TenNhom.Contains(keyword) ||
				nvl.DonViTinh.TenDonVi.Contains(keyword))
			.Select(nvl => new TonKhoResponse
			{
				NguyenVatLieuId = nvl.NguyenVatLieuId,
				MaNguyenVatLieu = nvl.MaNguyenVatLieu,
				TenNguyenVatLieu = nvl.TenNguyenVatLieu,

				NhomNguyenVatLieuId = nvl.NhomNguyenVatLieuId,
				TenNhom = nvl.NhomNguyenVatLieu.TenNhom,

				DonViTinhId = nvl.DonViTinhId,
				TenDonVi = nvl.DonViTinh.TenDonVi,

				TonHienTai = nvl.TonHienTai,
				TonToiThieu = nvl.TonToiThieu,

				TrangThaiTonKho = nvl.TonHienTai <= nvl.TonToiThieu
					? "SapHet"
					: "BinhThuong",

				TrangThaiNguyenVatLieu = nvl.TrangThai,
				GhiChu = nvl.GhiChu
			})
			.OrderBy(x => x.TenNguyenVatLieu)
			.ToListAsync();

		return Ok(data);
	}
}

public class TonKhoResponse
{
	public int NguyenVatLieuId { get; set; }

	public string? MaNguyenVatLieu { get; set; }

	public string? TenNguyenVatLieu { get; set; }

	public int NhomNguyenVatLieuId { get; set; }

	public string? TenNhom { get; set; }

	public int DonViTinhId { get; set; }

	public string? TenDonVi { get; set; }

	public decimal TonHienTai { get; set; }

	public decimal TonToiThieu { get; set; }

	public string? TrangThaiTonKho { get; set; }

	public string? TrangThaiNguyenVatLieu { get; set; }

	public string? GhiChu { get; set; }
}

public class CanhBaoTonKhoResponse
{
	public int NguyenVatLieuId { get; set; }

	public string? MaNguyenVatLieu { get; set; }

	public string? TenNguyenVatLieu { get; set; }

	public string? TenNhom { get; set; }

	public string? TenDonVi { get; set; }

	public decimal TonHienTai { get; set; }

	public decimal TonToiThieu { get; set; }

	public string? TrangThaiTonKho { get; set; }
}