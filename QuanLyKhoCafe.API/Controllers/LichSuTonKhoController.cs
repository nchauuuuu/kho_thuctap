using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;

namespace QuanLyKhoCafe.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LichSuTonKhoController : ControllerBase
{
	private readonly QuanLyKhoCafeDbContext _context;

	public LichSuTonKhoController(QuanLyKhoCafeDbContext context)
	{
		_context = context;
	}

	// GET: api/LichSuTonKho
	[HttpGet]
	public async Task<ActionResult<IEnumerable<LichSuTonKhoResponse>>> GetLichSuTonKhos()
	{
		var data = await _context.LichSuTonKhos
			.AsNoTracking()
			.Select(ls => new LichSuTonKhoResponse
			{
				LichSuTonKhoId = ls.LichSuTonKhoId,

				NguyenVatLieuId = ls.NguyenVatLieuId,
				MaNguyenVatLieu = ls.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ls.NguyenVatLieu.TenNguyenVatLieu,
				TenDonVi = ls.NguyenVatLieu.DonViTinh.TenDonVi,

				LoaiGiaoDich = ls.LoaiGiaoDich,
				BangLienQuan = ls.BangLienQuan,
				BanGhiLienQuanId = ls.BanGhiLienQuanId,

				SoLuongThayDoi = ls.SoLuongThayDoi,
				TonTruoc = ls.TonTruoc,
				TonSau = ls.TonSau,

				NguoiThucHienId = ls.NguoiThucHienId,
				TenNguoiThucHien = ls.NguoiThucHien.HoTen,

				ThoiGian = ls.ThoiGian,
				GhiChu = ls.GhiChu
			})
			.OrderByDescending(x => x.ThoiGian)
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/LichSuTonKho/5
	[HttpGet("{id:int}")]
	public async Task<ActionResult<LichSuTonKhoResponse>> GetLichSuTonKho(int id)
	{
		var data = await _context.LichSuTonKhos
			.AsNoTracking()
			.Where(ls => ls.LichSuTonKhoId == id)
			.Select(ls => new LichSuTonKhoResponse
			{
				LichSuTonKhoId = ls.LichSuTonKhoId,

				NguyenVatLieuId = ls.NguyenVatLieuId,
				MaNguyenVatLieu = ls.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ls.NguyenVatLieu.TenNguyenVatLieu,
				TenDonVi = ls.NguyenVatLieu.DonViTinh.TenDonVi,

				LoaiGiaoDich = ls.LoaiGiaoDich,
				BangLienQuan = ls.BangLienQuan,
				BanGhiLienQuanId = ls.BanGhiLienQuanId,

				SoLuongThayDoi = ls.SoLuongThayDoi,
				TonTruoc = ls.TonTruoc,
				TonSau = ls.TonSau,

				NguoiThucHienId = ls.NguoiThucHienId,
				TenNguoiThucHien = ls.NguoiThucHien.HoTen,

				ThoiGian = ls.ThoiGian,
				GhiChu = ls.GhiChu
			})
			.FirstOrDefaultAsync();

		if (data == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy lịch sử tồn kho."
			});
		}

		return Ok(data);
	}

	// GET: api/LichSuTonKho/nguyen-vat-lieu/1
	[HttpGet("nguyen-vat-lieu/{nguyenVatLieuId:int}")]
	public async Task<ActionResult<IEnumerable<LichSuTonKhoResponse>>> GetLichSuTheoNguyenVatLieu(int nguyenVatLieuId)
	{
		var nguyenVatLieuTonTai = await _context.NguyenVatLieus
			.AnyAsync(nvl => nvl.NguyenVatLieuId == nguyenVatLieuId);

		if (!nguyenVatLieuTonTai)
		{
			return NotFound(new
			{
				message = "Không tìm thấy nguyên vật liệu."
			});
		}

		var data = await _context.LichSuTonKhos
			.AsNoTracking()
			.Where(ls => ls.NguyenVatLieuId == nguyenVatLieuId)
			.Select(ls => new LichSuTonKhoResponse
			{
				LichSuTonKhoId = ls.LichSuTonKhoId,

				NguyenVatLieuId = ls.NguyenVatLieuId,
				MaNguyenVatLieu = ls.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ls.NguyenVatLieu.TenNguyenVatLieu,
				TenDonVi = ls.NguyenVatLieu.DonViTinh.TenDonVi,

				LoaiGiaoDich = ls.LoaiGiaoDich,
				BangLienQuan = ls.BangLienQuan,
				BanGhiLienQuanId = ls.BanGhiLienQuanId,

				SoLuongThayDoi = ls.SoLuongThayDoi,
				TonTruoc = ls.TonTruoc,
				TonSau = ls.TonSau,

				NguoiThucHienId = ls.NguoiThucHienId,
				TenNguoiThucHien = ls.NguoiThucHien.HoTen,

				ThoiGian = ls.ThoiGian,
				GhiChu = ls.GhiChu
			})
			.OrderByDescending(x => x.ThoiGian)
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/LichSuTonKho/tim-kiem?keyword=ca
	[HttpGet("tim-kiem")]
	public async Task<ActionResult<IEnumerable<LichSuTonKhoResponse>>> TimKiemLichSuTonKho([FromQuery] string? keyword)
	{
		if (string.IsNullOrWhiteSpace(keyword))
		{
			return BadRequest(new
			{
				message = "Vui lòng nhập từ khóa tìm kiếm."
			});
		}

		keyword = keyword.Trim();

		var data = await _context.LichSuTonKhos
			.AsNoTracking()
			.Where(ls =>
				ls.NguyenVatLieu.MaNguyenVatLieu.Contains(keyword) ||
				ls.NguyenVatLieu.TenNguyenVatLieu.Contains(keyword) ||
				ls.LoaiGiaoDich.Contains(keyword) ||
				(ls.BangLienQuan != null && ls.BangLienQuan.Contains(keyword)) ||
				ls.NguoiThucHien.HoTen.Contains(keyword) ||
				(ls.GhiChu != null && ls.GhiChu.Contains(keyword)))
			.Select(ls => new LichSuTonKhoResponse
			{
				LichSuTonKhoId = ls.LichSuTonKhoId,

				NguyenVatLieuId = ls.NguyenVatLieuId,
				MaNguyenVatLieu = ls.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ls.NguyenVatLieu.TenNguyenVatLieu,
				TenDonVi = ls.NguyenVatLieu.DonViTinh.TenDonVi,

				LoaiGiaoDich = ls.LoaiGiaoDich,
				BangLienQuan = ls.BangLienQuan,
				BanGhiLienQuanId = ls.BanGhiLienQuanId,

				SoLuongThayDoi = ls.SoLuongThayDoi,
				TonTruoc = ls.TonTruoc,
				TonSau = ls.TonSau,

				NguoiThucHienId = ls.NguoiThucHienId,
				TenNguoiThucHien = ls.NguoiThucHien.HoTen,

				ThoiGian = ls.ThoiGian,
				GhiChu = ls.GhiChu
			})
			.OrderByDescending(x => x.ThoiGian)
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/LichSuTonKho/theo-khoang-ngay?tuNgay=2026-05-01&denNgay=2026-05-28
	[HttpGet("theo-khoang-ngay")]
	public async Task<ActionResult<IEnumerable<LichSuTonKhoResponse>>> GetLichSuTheoKhoangNgay(
		[FromQuery] DateTime? tuNgay,
		[FromQuery] DateTime? denNgay)
	{
		if (tuNgay == null || denNgay == null)
		{
			return BadRequest(new
			{
				message = "Vui lòng nhập đủ từ ngày và đến ngày."
			});
		}

		if (tuNgay > denNgay)
		{
			return BadRequest(new
			{
				message = "Từ ngày không được lớn hơn đến ngày."
			});
		}

		var tuNgayValue = tuNgay.Value.Date;
		var denNgayValue = denNgay.Value.Date.AddDays(1);

		var data = await _context.LichSuTonKhos
			.AsNoTracking()
			.Where(ls => ls.ThoiGian >= tuNgayValue && ls.ThoiGian < denNgayValue)
			.Select(ls => new LichSuTonKhoResponse
			{
				LichSuTonKhoId = ls.LichSuTonKhoId,

				NguyenVatLieuId = ls.NguyenVatLieuId,
				MaNguyenVatLieu = ls.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ls.NguyenVatLieu.TenNguyenVatLieu,
				TenDonVi = ls.NguyenVatLieu.DonViTinh.TenDonVi,

				LoaiGiaoDich = ls.LoaiGiaoDich,
				BangLienQuan = ls.BangLienQuan,
				BanGhiLienQuanId = ls.BanGhiLienQuanId,

				SoLuongThayDoi = ls.SoLuongThayDoi,
				TonTruoc = ls.TonTruoc,
				TonSau = ls.TonSau,

				NguoiThucHienId = ls.NguoiThucHienId,
				TenNguoiThucHien = ls.NguoiThucHien.HoTen,

				ThoiGian = ls.ThoiGian,
				GhiChu = ls.GhiChu
			})
			.OrderByDescending(x => x.ThoiGian)
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/LichSuTonKho/loai-giao-dich/NhapKho
	[HttpGet("loai-giao-dich/{loaiGiaoDich}")]
	public async Task<ActionResult<IEnumerable<LichSuTonKhoResponse>>> GetLichSuTheoLoaiGiaoDich(string loaiGiaoDich)
	{
		if (string.IsNullOrWhiteSpace(loaiGiaoDich))
		{
			return BadRequest(new
			{
				message = "Vui lòng nhập loại giao dịch."
			});
		}

		loaiGiaoDich = loaiGiaoDich.Trim();

		var data = await _context.LichSuTonKhos
			.AsNoTracking()
			.Where(ls => ls.LoaiGiaoDich == loaiGiaoDich)
			.Select(ls => new LichSuTonKhoResponse
			{
				LichSuTonKhoId = ls.LichSuTonKhoId,

				NguyenVatLieuId = ls.NguyenVatLieuId,
				MaNguyenVatLieu = ls.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ls.NguyenVatLieu.TenNguyenVatLieu,
				TenDonVi = ls.NguyenVatLieu.DonViTinh.TenDonVi,

				LoaiGiaoDich = ls.LoaiGiaoDich,
				BangLienQuan = ls.BangLienQuan,
				BanGhiLienQuanId = ls.BanGhiLienQuanId,

				SoLuongThayDoi = ls.SoLuongThayDoi,
				TonTruoc = ls.TonTruoc,
				TonSau = ls.TonSau,

				NguoiThucHienId = ls.NguoiThucHienId,
				TenNguoiThucHien = ls.NguoiThucHien.HoTen,

				ThoiGian = ls.ThoiGian,
				GhiChu = ls.GhiChu
			})
			.OrderByDescending(x => x.ThoiGian)
			.ToListAsync();

		return Ok(data);
	}
}

public class LichSuTonKhoResponse
{
	public int LichSuTonKhoId { get; set; }

	public int NguyenVatLieuId { get; set; }

	public string? MaNguyenVatLieu { get; set; }

	public string? TenNguyenVatLieu { get; set; }

	public string? TenDonVi { get; set; }

	public string? LoaiGiaoDich { get; set; }

	public string? BangLienQuan { get; set; }

	public int? BanGhiLienQuanId { get; set; }

	public decimal SoLuongThayDoi { get; set; }

	public decimal TonTruoc { get; set; }

	public decimal TonSau { get; set; }

	public int NguoiThucHienId { get; set; }

	public string? TenNguoiThucHien { get; set; }

	public DateTime ThoiGian { get; set; }

	public string? GhiChu { get; set; }
}