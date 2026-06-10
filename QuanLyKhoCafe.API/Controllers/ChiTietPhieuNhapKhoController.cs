using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ChiTietPhieuNhapKhoController : ControllerBase
{
	private readonly QuanLyKhoCafeDbContext _context;

	public ChiTietPhieuNhapKhoController(QuanLyKhoCafeDbContext context)
	{
		_context = context;
	}

	// GET: api/ChiTietPhieuNhapKho
	[HttpGet]
	public async Task<ActionResult<IEnumerable<ChiTietPhieuNhapKhoResponse>>> GetChiTietPhieuNhapKhos()
	{
		var data = await _context.ChiTietPhieuNhapKhos
			.AsNoTracking()
			.Select(ct => new ChiTietPhieuNhapKhoResponse
			{
				ChiTietPhieuNhapKhoId = ct.ChiTietPhieuNhapKhoId,
				PhieuNhapKhoId = ct.PhieuNhapKhoId,
				MaPhieuNhap = ct.PhieuNhapKho.MaPhieuNhap,
				NguyenVatLieuId = ct.NguyenVatLieuId,
				SoLuongNhap = ct.SoLuongNhap,
				DonGia = ct.DonGia,
				ThanhTien = ct.SoLuongNhap * (ct.DonGia ?? 0),
				GhiChu = ct.GhiChu
			})
			.ToListAsync();

		return Ok(data);
	}

	// GET: api/ChiTietPhieuNhapKho/5
	[HttpGet("{id:int}")]
	public async Task<ActionResult<ChiTietPhieuNhapKhoResponse>> GetChiTietPhieuNhapKho(int id)
	{
		var chiTiet = await _context.ChiTietPhieuNhapKhos
			.AsNoTracking()
			.Where(ct => ct.ChiTietPhieuNhapKhoId == id)
			.Select(ct => new ChiTietPhieuNhapKhoResponse
			{
				ChiTietPhieuNhapKhoId = ct.ChiTietPhieuNhapKhoId,
				PhieuNhapKhoId = ct.PhieuNhapKhoId,
				MaPhieuNhap = ct.PhieuNhapKho.MaPhieuNhap,
				NguyenVatLieuId = ct.NguyenVatLieuId,
				SoLuongNhap = ct.SoLuongNhap,
				DonGia = ct.DonGia,
				ThanhTien = ct.SoLuongNhap * (ct.DonGia ?? 0),
				GhiChu = ct.GhiChu
			})
			.FirstOrDefaultAsync();

		if (chiTiet == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy chi tiết phiếu nhập kho."
			});
		}

		return Ok(chiTiet);
	}

	// GET: api/ChiTietPhieuNhapKho/phieu-nhap/5
	[HttpGet("phieu-nhap/{phieuNhapKhoId:int}")]
	public async Task<ActionResult<IEnumerable<ChiTietPhieuNhapKhoResponse>>> GetChiTietTheoPhieuNhap(int phieuNhapKhoId)
	{
		var phieuNhapTonTai = await _context.PhieuNhapKhos
			.AnyAsync(p => p.PhieuNhapKhoId == phieuNhapKhoId);

		if (!phieuNhapTonTai)
		{
			return NotFound(new
			{
				message = "Không tìm thấy phiếu nhập kho."
			});
		}

		var data = await _context.ChiTietPhieuNhapKhos
			.AsNoTracking()
			.Where(ct => ct.PhieuNhapKhoId == phieuNhapKhoId)
			.Select(ct => new ChiTietPhieuNhapKhoResponse
			{
				ChiTietPhieuNhapKhoId = ct.ChiTietPhieuNhapKhoId,
				PhieuNhapKhoId = ct.PhieuNhapKhoId,
				MaPhieuNhap = ct.PhieuNhapKho.MaPhieuNhap,
				NguyenVatLieuId = ct.NguyenVatLieuId,
				SoLuongNhap = ct.SoLuongNhap,
				DonGia = ct.DonGia,
				ThanhTien = ct.SoLuongNhap * (ct.DonGia ?? 0),
				GhiChu = ct.GhiChu
			})
			.ToListAsync();

		return Ok(data);
	}

	// POST: api/ChiTietPhieuNhapKho
	[HttpPost]
	public async Task<ActionResult<ChiTietPhieuNhapKhoResponse>> PostChiTietPhieuNhapKho(
		[FromBody] ChiTietPhieuNhapKhoRequest request)
	{
		if (request.SoLuongNhap <= 0)
		{
			return BadRequest(new
			{
				message = "Số lượng nhập phải lớn hơn 0."
			});
		}

		if (request.DonGia < 0)
		{
			return BadRequest(new
			{
				message = "Đơn giá không được nhỏ hơn 0."
			});
		}

		var phieuNhap = await _context.PhieuNhapKhos
			.FirstOrDefaultAsync(p => p.PhieuNhapKhoId == request.PhieuNhapKhoId);

		if (phieuNhap == null)
		{
			return BadRequest(new
			{
				message = "Phiếu nhập kho không tồn tại."
			});
		}

		if (phieuNhap.TrangThai != "ChoDuyet")
		{
			return BadRequest(new
			{
				message = "Chỉ được thêm chi tiết cho phiếu nhập đang ở trạng thái Chờ duyệt."
			});
		}

		var nguyenVatLieuTonTai = await _context.NguyenVatLieus
			.AnyAsync(nvl => nvl.NguyenVatLieuId == request.NguyenVatLieuId);

		if (!nguyenVatLieuTonTai)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu không tồn tại."
			});
		}

		var daTonTaiTrongPhieu = await _context.ChiTietPhieuNhapKhos
			.AnyAsync(ct =>
				ct.PhieuNhapKhoId == request.PhieuNhapKhoId &&
				ct.NguyenVatLieuId == request.NguyenVatLieuId);

		if (daTonTaiTrongPhieu)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu này đã có trong phiếu nhập. Vui lòng cập nhật số lượng thay vì thêm mới."
			});
		}

		var chiTiet = new ChiTietPhieuNhapKho
		{
			PhieuNhapKhoId = request.PhieuNhapKhoId,
			NguyenVatLieuId = request.NguyenVatLieuId,
			SoLuongNhap = request.SoLuongNhap,
			DonGia = request.DonGia,
			GhiChu = request.GhiChu
		};

		_context.ChiTietPhieuNhapKhos.Add(chiTiet);
		await _context.SaveChangesAsync();

		var response = new ChiTietPhieuNhapKhoResponse
		{
			ChiTietPhieuNhapKhoId = chiTiet.ChiTietPhieuNhapKhoId,
			PhieuNhapKhoId = chiTiet.PhieuNhapKhoId,
			MaPhieuNhap = phieuNhap.MaPhieuNhap,
			NguyenVatLieuId = chiTiet.NguyenVatLieuId,
			SoLuongNhap = chiTiet.SoLuongNhap,
			DonGia = chiTiet.DonGia,
			ThanhTien = chiTiet.SoLuongNhap * (chiTiet.DonGia ?? 0),
			GhiChu = chiTiet.GhiChu
		};

		return CreatedAtAction(
			nameof(GetChiTietPhieuNhapKho),
			new { id = chiTiet.ChiTietPhieuNhapKhoId },
			response
		);
	}

	// PUT: api/ChiTietPhieuNhapKho/5
	[HttpPut("{id:int}")]
	public async Task<IActionResult> PutChiTietPhieuNhapKho(
		int id,
		[FromBody] ChiTietPhieuNhapKhoRequest request)
	{
		if (request.SoLuongNhap <= 0)
		{
			return BadRequest(new
			{
				message = "Số lượng nhập phải lớn hơn 0."
			});
		}

		if (request.DonGia < 0)
		{
			return BadRequest(new
			{
				message = "Đơn giá không được nhỏ hơn 0."
			});
		}

		var chiTiet = await _context.ChiTietPhieuNhapKhos
			.FirstOrDefaultAsync(ct => ct.ChiTietPhieuNhapKhoId == id);

		if (chiTiet == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy chi tiết phiếu nhập kho."
			});
		}

		var phieuNhap = await _context.PhieuNhapKhos
			.FirstOrDefaultAsync(p => p.PhieuNhapKhoId == request.PhieuNhapKhoId);

		if (phieuNhap == null)
		{
			return BadRequest(new
			{
				message = "Phiếu nhập kho không tồn tại."
			});
		}

		if (phieuNhap.TrangThai != "ChoDuyet")
		{
			return BadRequest(new
			{
				message = "Chỉ được cập nhật chi tiết khi phiếu nhập đang ở trạng thái Chờ duyệt."
			});
		}

		var nguyenVatLieuTonTai = await _context.NguyenVatLieus
			.AnyAsync(nvl => nvl.NguyenVatLieuId == request.NguyenVatLieuId);

		if (!nguyenVatLieuTonTai)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu không tồn tại."
			});
		}

		var biTrungNguyenVatLieu = await _context.ChiTietPhieuNhapKhos
			.AnyAsync(ct =>
				ct.ChiTietPhieuNhapKhoId != id &&
				ct.PhieuNhapKhoId == request.PhieuNhapKhoId &&
				ct.NguyenVatLieuId == request.NguyenVatLieuId);

		if (biTrungNguyenVatLieu)
		{
			return BadRequest(new
			{
				message = "Nguyên vật liệu này đã có trong phiếu nhập."
			});
		}

		chiTiet.PhieuNhapKhoId = request.PhieuNhapKhoId;
		chiTiet.NguyenVatLieuId = request.NguyenVatLieuId;
		chiTiet.SoLuongNhap = request.SoLuongNhap;
		chiTiet.DonGia = request.DonGia;
		chiTiet.GhiChu = request.GhiChu;

		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Cập nhật chi tiết phiếu nhập kho thành công.",
			data = new ChiTietPhieuNhapKhoResponse
			{
				ChiTietPhieuNhapKhoId = chiTiet.ChiTietPhieuNhapKhoId,
				PhieuNhapKhoId = chiTiet.PhieuNhapKhoId,
				MaPhieuNhap = phieuNhap.MaPhieuNhap,
				NguyenVatLieuId = chiTiet.NguyenVatLieuId,
				SoLuongNhap = chiTiet.SoLuongNhap,
				DonGia = chiTiet.DonGia,
				ThanhTien = chiTiet.SoLuongNhap * (chiTiet.DonGia ?? 0),
				GhiChu = chiTiet.GhiChu
			}
		});
	}

	// DELETE: api/ChiTietPhieuNhapKho/5
	[HttpDelete("{id:int}")]
	public async Task<IActionResult> DeleteChiTietPhieuNhapKho(int id)
	{
		var chiTiet = await _context.ChiTietPhieuNhapKhos
			.Include(ct => ct.PhieuNhapKho)
			.FirstOrDefaultAsync(ct => ct.ChiTietPhieuNhapKhoId == id);

		if (chiTiet == null)
		{
			return NotFound(new
			{
				message = "Không tìm thấy chi tiết phiếu nhập kho."
			});
		}

		if (chiTiet.PhieuNhapKho.TrangThai != "ChoDuyet")
		{
			return BadRequest(new
			{
				message = "Chỉ được xóa chi tiết khi phiếu nhập đang ở trạng thái Chờ duyệt."
			});
		}

		_context.ChiTietPhieuNhapKhos.Remove(chiTiet);
		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Xóa chi tiết phiếu nhập kho thành công."
		});
	}
}

public class ChiTietPhieuNhapKhoRequest
{
	public int PhieuNhapKhoId { get; set; }

	public int NguyenVatLieuId { get; set; }

	public decimal SoLuongNhap { get; set; }

	public decimal? DonGia { get; set; }

	public string? GhiChu { get; set; }
}

public class ChiTietPhieuNhapKhoResponse
{
	public int ChiTietPhieuNhapKhoId { get; set; }

	public int PhieuNhapKhoId { get; set; }

	public string? MaPhieuNhap { get; set; }

	public int NguyenVatLieuId { get; set; }

	public decimal SoLuongNhap { get; set; }

	public decimal? DonGia { get; set; }

	public decimal ThanhTien { get; set; }

	public string? GhiChu { get; set; }
}
