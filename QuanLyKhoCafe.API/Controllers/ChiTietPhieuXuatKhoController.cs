using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ChiTietPhieuXuatKhoController : ControllerBase
{
	private readonly QuanLyKhoCafeDbContext _context;

	public ChiTietPhieuXuatKhoController(QuanLyKhoCafeDbContext context)
	{
		_context = context;
	}

	// GET: api/ChiTietPhieuXuatKho
	[HttpGet]
	public async Task<ActionResult<IEnumerable<ChiTietPhieuXuatKhoResponse>>> GetChiTietPhieuXuatKhos()
	{
		var data = await _context.ChiTietPhieuXuatKhos
			.AsNoTracking()
			.Select(ct => new ChiTietPhieuXuatKhoResponse
			{
				ChiTietPhieuXuatKhoId = ct.ChiTietPhieuXuatKhoId,
				PhieuXuatKhoId = ct.PhieuXuatKhoId,
				MaPhieuXuat = ct.PhieuXuatKho.MaPhieuXuat,
				NguyenVatLieuId = ct.NguyenVatLieuId,
				MaNguyenVatLieu = ct.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ct.NguyenVatLieu.TenNguyenVatLieu,
				SoLuongXuat = ct.SoLuongXuat,
				TonHienTai = ct.NguyenVatLieu.TonHienTai,
				GhiChu = ct.GhiChu
			})
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/ChiTietPhieuXuatKho/5
	[HttpGet("{id:int}")]
	public async Task<ActionResult<ChiTietPhieuXuatKhoResponse>> GetChiTietPhieuXuatKho(int id)
	{
		var chiTiet = await _context.ChiTietPhieuXuatKhos
			.AsNoTracking()
			.Where(ct => ct.ChiTietPhieuXuatKhoId == id)
			.Select(ct => new ChiTietPhieuXuatKhoResponse
			{
				ChiTietPhieuXuatKhoId = ct.ChiTietPhieuXuatKhoId,
				PhieuXuatKhoId = ct.PhieuXuatKhoId,
				MaPhieuXuat = ct.PhieuXuatKho.MaPhieuXuat,
				NguyenVatLieuId = ct.NguyenVatLieuId,
				MaNguyenVatLieu = ct.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ct.NguyenVatLieu.TenNguyenVatLieu,
				SoLuongXuat = ct.SoLuongXuat,
				TonHienTai = ct.NguyenVatLieu.TonHienTai,
				GhiChu = ct.GhiChu
			})
			.FirstOrDefaultAsync();

		if (chiTiet == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy chi tiết phiếu xuất kho."
			});
		}

		return Ok(chiTiet);
	}

	// GET: api/ChiTietPhieuXuatKho/phieu-xuat/5
	[HttpGet("phieu-xuat/{phieuXuatKhoId:int}")]
	public async Task<ActionResult<IEnumerable<ChiTietPhieuXuatKhoResponse>>> GetChiTietTheoPhieuXuat(int phieuXuatKhoId)
	{
		var phieuXuatTonTai = await _context.PhieuXuatKhos
			.AnyAsync(p => p.PhieuXuatKhoId == phieuXuatKhoId);

		if (!phieuXuatTonTai)
		{
			return NotFound(new
			{
				message = "Không tìm thấy phiếu xuất kho."
			});
		}

		var data = await _context.ChiTietPhieuXuatKhos
			.AsNoTracking()
			.Where(ct => ct.PhieuXuatKhoId == phieuXuatKhoId)
			.Select(ct => new ChiTietPhieuXuatKhoResponse
			{
				ChiTietPhieuXuatKhoId = ct.ChiTietPhieuXuatKhoId,
				PhieuXuatKhoId = ct.PhieuXuatKhoId,
				MaPhieuXuat = ct.PhieuXuatKho.MaPhieuXuat,
				NguyenVatLieuId = ct.NguyenVatLieuId,
				MaNguyenVatLieu = ct.NguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = ct.NguyenVatLieu.TenNguyenVatLieu,
				SoLuongXuat = ct.SoLuongXuat,
				TonHienTai = ct.NguyenVatLieu.TonHienTai,
				GhiChu = ct.GhiChu
			})
			.ToListAsync();

		return Ok(data);
	}

	// POST: api/ChiTietPhieuXuatKho
	[HttpPost]
	public async Task<ActionResult<ChiTietPhieuXuatKhoResponse>> PostChiTietPhieuXuatKho(
		[FromBody] ChiTietPhieuXuatKhoRequest request)
	{
		if (request.SoLuongXuat <= 0)
		{
			return BadRequest(new
			{
				message = "Số lượng xuất phải lớn hơn 0."
			});
		}

		var phieuXuat = await _context.PhieuXuatKhos
			.FirstOrDefaultAsync(p => p.PhieuXuatKhoId == request.PhieuXuatKhoId);

		if (phieuXuat == null)
		{
			return BadRequest(new
			{
				message = "Phiếu xuất kho không tồn tại."
			});
		}

		if (IsDaDuyet(phieuXuat.TrangThai))
		{
			return BadRequest(new
			{
				message = "Phiếu xuất đã duyệt, không được thêm chi tiết."
			});
		}

		var nguyenVatLieu = await _context.NguyenVatLieus
			.FirstOrDefaultAsync(nvl => nvl.NguyenVatLieuId == request.NguyenVatLieuId);

		if (nguyenVatLieu == null)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu không tồn tại."
			});
		}

		if (request.SoLuongXuat > nguyenVatLieu.TonHienTai)
		{
			return BadRequest(new
			{
				message = "Số lượng xuất vượt quá tồn kho hiện tại.",
				tonHienTai = nguyenVatLieu.TonHienTai,
				soLuongXuat = request.SoLuongXuat
			});
		}

		var daTonTaiTrongPhieu = await _context.ChiTietPhieuXuatKhos
			.AnyAsync(ct =>
				ct.PhieuXuatKhoId == request.PhieuXuatKhoId &&
				ct.NguyenVatLieuId == request.NguyenVatLieuId);

		if (daTonTaiTrongPhieu)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu này đã có trong phiếu xuất. Vui lòng cập nhật số lượng thay vì thêm mới."
			});
		}

		var chiTiet = new ChiTietPhieuXuatKho
		{
			PhieuXuatKhoId = request.PhieuXuatKhoId,
			NguyenVatLieuId = request.NguyenVatLieuId,
			SoLuongXuat = request.SoLuongXuat,
			GhiChu = request.GhiChu
		};

		_context.ChiTietPhieuXuatKhos.Add(chiTiet);
		await _context.SaveChangesAsync();

		var response = new ChiTietPhieuXuatKhoResponse
		{
			ChiTietPhieuXuatKhoId = chiTiet.ChiTietPhieuXuatKhoId,
			PhieuXuatKhoId = chiTiet.PhieuXuatKhoId,
			MaPhieuXuat = phieuXuat.MaPhieuXuat,
			NguyenVatLieuId = chiTiet.NguyenVatLieuId,
			MaNguyenVatLieu = nguyenVatLieu.MaNguyenVatLieu,
			TenNguyenVatLieu = nguyenVatLieu.TenNguyenVatLieu,
			SoLuongXuat = chiTiet.SoLuongXuat,
			TonHienTai = nguyenVatLieu.TonHienTai,
			GhiChu = chiTiet.GhiChu
		};

		return CreatedAtAction(
			nameof(GetChiTietPhieuXuatKho),
			new { id = chiTiet.ChiTietPhieuXuatKhoId },
			response
		);
	}

	// PUT: api/ChiTietPhieuXuatKho/5
	[HttpPut("{id:int}")]
	public async Task<IActionResult> PutChiTietPhieuXuatKho(
		int id,
		[FromBody] ChiTietPhieuXuatKhoRequest request)
	{
		if (request.SoLuongXuat <= 0)
		{
			return BadRequest(new
			{
				message = "Số lượng xuất phải lớn hơn 0."
			});
		}

		var chiTiet = await _context.ChiTietPhieuXuatKhos
			.Include(ct => ct.PhieuXuatKho)
			.FirstOrDefaultAsync(ct => ct.ChiTietPhieuXuatKhoId == id);

		if (chiTiet == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy chi tiết phiếu xuất kho."
			});
		}

		if (IsDaDuyet(chiTiet.PhieuXuatKho.TrangThai))
		{
			return BadRequest(new
			{
				message = "Phiếu xuất đã duyệt, không được cập nhật chi tiết."
			});
		}

		var phieuXuat = await _context.PhieuXuatKhos
			.FirstOrDefaultAsync(p => p.PhieuXuatKhoId == request.PhieuXuatKhoId);

		if (phieuXuat == null)
		{
			return BadRequest(new
			{
				message = "Phiếu xuất kho không tồn tại."
			});
		}

		if (IsDaDuyet(phieuXuat.TrangThai))
		{
			return BadRequest(new
			{
				message = "Phiếu xuất đã duyệt, không được cập nhật chi tiết."
			});
		}

		var nguyenVatLieu = await _context.NguyenVatLieus
			.FirstOrDefaultAsync(nvl => nvl.NguyenVatLieuId == request.NguyenVatLieuId);

		if (nguyenVatLieu == null)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu không tồn tại."
			});
		}

		if (request.SoLuongXuat > nguyenVatLieu.TonHienTai)
		{
			return BadRequest(new
			{
				message = "Số lượng xuất vượt quá tồn kho hiện tại.",
				tonHienTai = nguyenVatLieu.TonHienTai,
				soLuongXuat = request.SoLuongXuat
			});
		}

		var biTrungNguyenVatLieu = await _context.ChiTietPhieuXuatKhos
			.AnyAsync(ct =>
				ct.ChiTietPhieuXuatKhoId != id &&
				ct.PhieuXuatKhoId == request.PhieuXuatKhoId &&
				ct.NguyenVatLieuId == request.NguyenVatLieuId);

		if (biTrungNguyenVatLieu)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu này đã có trong phiếu xuất."
			});
		}

		chiTiet.PhieuXuatKhoId = request.PhieuXuatKhoId;
		chiTiet.NguyenVatLieuId = request.NguyenVatLieuId;
		chiTiet.SoLuongXuat = request.SoLuongXuat;
		chiTiet.GhiChu = request.GhiChu;

		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Cập nhật chi tiết phiếu xuất kho thành công.",
			data = new ChiTietPhieuXuatKhoResponse
			{
				ChiTietPhieuXuatKhoId = chiTiet.ChiTietPhieuXuatKhoId,
				PhieuXuatKhoId = chiTiet.PhieuXuatKhoId,
				MaPhieuXuat = phieuXuat.MaPhieuXuat,
				NguyenVatLieuId = chiTiet.NguyenVatLieuId,
				MaNguyenVatLieu = nguyenVatLieu.MaNguyenVatLieu,
				TenNguyenVatLieu = nguyenVatLieu.TenNguyenVatLieu,
				SoLuongXuat = chiTiet.SoLuongXuat,
				TonHienTai = nguyenVatLieu.TonHienTai,
				GhiChu = chiTiet.GhiChu
			}
		});
	}

	// DELETE: api/ChiTietPhieuXuatKho/5
	[HttpDelete("{id:int}")]
	public async Task<IActionResult> DeleteChiTietPhieuXuatKho(int id)
	{
		var chiTiet = await _context.ChiTietPhieuXuatKhos
			.Include(ct => ct.PhieuXuatKho)
			.FirstOrDefaultAsync(ct => ct.ChiTietPhieuXuatKhoId == id);

		if (chiTiet == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy chi tiết phiếu xuất kho."
			});
		}

		if (IsDaDuyet(chiTiet.PhieuXuatKho.TrangThai))
		{
			return BadRequest(new
			{
				message = "Phiếu xuất đã duyệt, không được xóa chi tiết."
			});
		}

		_context.ChiTietPhieuXuatKhos.Remove(chiTiet);
		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Xóa chi tiết phiếu xuất kho thành công."
		});
	}

	private static bool IsDaDuyet(string? trangThai)
	{
		return string.Equals(trangThai?.Trim(), "DaDuyet", StringComparison.OrdinalIgnoreCase)
			|| string.Equals(trangThai?.Trim(), "Đã duyệt", StringComparison.OrdinalIgnoreCase)
			|| string.Equals(trangThai?.Trim(), "Da duyet", StringComparison.OrdinalIgnoreCase);
	}
}

public class ChiTietPhieuXuatKhoRequest
{
	public int PhieuXuatKhoId { get; set; }

	public int NguyenVatLieuId { get; set; }

	public decimal SoLuongXuat { get; set; }

	public string? GhiChu { get; set; }
}

public class ChiTietPhieuXuatKhoResponse
{
	public int ChiTietPhieuXuatKhoId { get; set; }

	public int PhieuXuatKhoId { get; set; }

	public string? MaPhieuXuat { get; set; }

	public int NguyenVatLieuId { get; set; }

	public string? MaNguyenVatLieu { get; set; }

	public string? TenNguyenVatLieu { get; set; }

	public decimal SoLuongXuat { get; set; }

	public decimal TonHienTai { get; set; }

	public string? GhiChu { get; set; }
}