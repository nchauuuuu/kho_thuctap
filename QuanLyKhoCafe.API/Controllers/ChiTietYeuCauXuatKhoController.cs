using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ChiTietYeuCauXuatKhoController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public ChiTietYeuCauXuatKhoController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/ChiTietYeuCauXuatKho
		[HttpGet]
		public async Task<IActionResult> GetChiTietYeuCauXuatKhos()
		{
			var danhSach = await _context.ChiTietYeuCauXuatKhos
				.OrderBy(ct => ct.ChiTietYeuCauXuatKhoId)
				.Select(ct => new
				{
					ct.ChiTietYeuCauXuatKhoId,
					ct.YeuCauXuatKhoId,
					MaYeuCau = ct.YeuCauXuatKho.MaYeuCau,
					ct.NguyenVatLieuId,
					MaNguyenVatLieu = ct.NguyenVatLieu.MaNguyenVatLieu,
					TenNguyenVatLieu = ct.NguyenVatLieu.TenNguyenVatLieu,
					TonHienTai = ct.NguyenVatLieu.TonHienTai,
					ct.SoLuongYeuCau,
					ct.GhiChu
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/ChiTietYeuCauXuatKho/5
		[HttpGet("{id}")]
		public async Task<IActionResult> GetChiTietYeuCauXuatKho(int id)
		{
			var chiTiet = await _context.ChiTietYeuCauXuatKhos
				.Where(ct => ct.ChiTietYeuCauXuatKhoId == id)
				.Select(ct => new
				{
					ct.ChiTietYeuCauXuatKhoId,
					ct.YeuCauXuatKhoId,
					MaYeuCau = ct.YeuCauXuatKho.MaYeuCau,
					ct.NguyenVatLieuId,
					MaNguyenVatLieu = ct.NguyenVatLieu.MaNguyenVatLieu,
					TenNguyenVatLieu = ct.NguyenVatLieu.TenNguyenVatLieu,
					TonHienTai = ct.NguyenVatLieu.TonHienTai,
					ct.SoLuongYeuCau,
					ct.GhiChu
				})
				.FirstOrDefaultAsync();

			if (chiTiet == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy chi tiết yêu cầu xuất kho"
				});
			}

			return Ok(chiTiet);
		}

		// GET: api/ChiTietYeuCauXuatKho/TheoYeuCau/1
		[HttpGet("TheoYeuCau/{yeuCauXuatKhoId}")]
		public async Task<IActionResult> GetChiTietTheoYeuCau(int yeuCauXuatKhoId)
		{
			var yeuCauTonTai = await _context.YeuCauXuatKhos
				.AnyAsync(yc => yc.YeuCauXuatKhoId == yeuCauXuatKhoId);

			if (!yeuCauTonTai)
			{
				return NotFound(new
				{
					message = "Không tìm thấy yêu cầu xuất kho"
				});
			}

			var danhSach = await _context.ChiTietYeuCauXuatKhos
				.Where(ct => ct.YeuCauXuatKhoId == yeuCauXuatKhoId)
				.OrderBy(ct => ct.ChiTietYeuCauXuatKhoId)
				.Select(ct => new
				{
					ct.ChiTietYeuCauXuatKhoId,
					ct.YeuCauXuatKhoId,
					MaYeuCau = ct.YeuCauXuatKho.MaYeuCau,
					ct.NguyenVatLieuId,
					MaNguyenVatLieu = ct.NguyenVatLieu.MaNguyenVatLieu,
					TenNguyenVatLieu = ct.NguyenVatLieu.TenNguyenVatLieu,
					TonHienTai = ct.NguyenVatLieu.TonHienTai,
					ct.SoLuongYeuCau,
					ct.GhiChu
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// POST: api/ChiTietYeuCauXuatKho
		[HttpPost]
		public async Task<IActionResult> PostChiTietYeuCauXuatKho(ChiTietYeuCauXuatKho chiTiet)
		{
			var yeuCauTonTai = await _context.YeuCauXuatKhos
				.AnyAsync(yc => yc.YeuCauXuatKhoId == chiTiet.YeuCauXuatKhoId);

			if (!yeuCauTonTai)
			{
				return BadRequest(new
				{
					message = "Yêu cầu xuất kho không tồn tại"
				});
			}

			var nguyenVatLieuTonTai = await _context.NguyenVatLieus
				.AnyAsync(nvl => nvl.NguyenVatLieuId == chiTiet.NguyenVatLieuId);

			if (!nguyenVatLieuTonTai)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu không tồn tại"
				});
			}

			if (chiTiet.SoLuongYeuCau <= 0)
			{
				return BadRequest(new
				{
					message = "Số lượng yêu cầu phải lớn hơn 0"
				});
			}

			var daTonTaiChiTiet = await _context.ChiTietYeuCauXuatKhos
				.AnyAsync(ct => ct.YeuCauXuatKhoId == chiTiet.YeuCauXuatKhoId
							 && ct.NguyenVatLieuId == chiTiet.NguyenVatLieuId);

			if (daTonTaiChiTiet)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu này đã có trong yêu cầu xuất kho"
				});
			}

			chiTiet.ChiTietYeuCauXuatKhoId = 0;
			chiTiet.NguyenVatLieu = null!;
			chiTiet.YeuCauXuatKho = null!;

			_context.ChiTietYeuCauXuatKhos.Add(chiTiet);
			await _context.SaveChangesAsync();

			return CreatedAtAction(
				nameof(GetChiTietYeuCauXuatKho),
				new { id = chiTiet.ChiTietYeuCauXuatKhoId },
				new
				{
					message = "Tạo chi tiết yêu cầu xuất kho thành công",
					data = new
					{
						chiTiet.ChiTietYeuCauXuatKhoId,
						chiTiet.YeuCauXuatKhoId,
						chiTiet.NguyenVatLieuId,
						chiTiet.SoLuongYeuCau,
						chiTiet.GhiChu
					}
				}
			);
		}

		// PUT: api/ChiTietYeuCauXuatKho/5
		[HttpPut("{id}")]
		public async Task<IActionResult> PutChiTietYeuCauXuatKho(int id, ChiTietYeuCauXuatKho chiTiet)
		{
			if (id != chiTiet.ChiTietYeuCauXuatKhoId)
			{
				return BadRequest(new
				{
					message = "Id trên URL không khớp với Id trong body"
				});
			}

			var chiTietCu = await _context.ChiTietYeuCauXuatKhos.FindAsync(id);

			if (chiTietCu == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy chi tiết yêu cầu xuất kho để cập nhật"
				});
			}

			var yeuCauTonTai = await _context.YeuCauXuatKhos
				.AnyAsync(yc => yc.YeuCauXuatKhoId == chiTiet.YeuCauXuatKhoId);

			if (!yeuCauTonTai)
			{
				return BadRequest(new
				{
					message = "Yêu cầu xuất kho không tồn tại"
				});
			}

			var nguyenVatLieuTonTai = await _context.NguyenVatLieus
				.AnyAsync(nvl => nvl.NguyenVatLieuId == chiTiet.NguyenVatLieuId);

			if (!nguyenVatLieuTonTai)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu không tồn tại"
				});
			}

			if (chiTiet.SoLuongYeuCau <= 0)
			{
				return BadRequest(new
				{
					message = "Số lượng yêu cầu phải lớn hơn 0"
				});
			}

			var daTonTaiChiTiet = await _context.ChiTietYeuCauXuatKhos
				.AnyAsync(ct => ct.YeuCauXuatKhoId == chiTiet.YeuCauXuatKhoId
							 && ct.NguyenVatLieuId == chiTiet.NguyenVatLieuId
							 && ct.ChiTietYeuCauXuatKhoId != id);

			if (daTonTaiChiTiet)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu này đã có trong yêu cầu xuất kho"
				});
			}

			chiTietCu.YeuCauXuatKhoId = chiTiet.YeuCauXuatKhoId;
			chiTietCu.NguyenVatLieuId = chiTiet.NguyenVatLieuId;
			chiTietCu.SoLuongYeuCau = chiTiet.SoLuongYeuCau;
			chiTietCu.GhiChu = chiTiet.GhiChu;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Cập nhật chi tiết yêu cầu xuất kho thành công",
				data = new
				{
					chiTietCu.ChiTietYeuCauXuatKhoId,
					chiTietCu.YeuCauXuatKhoId,
					chiTietCu.NguyenVatLieuId,
					chiTietCu.SoLuongYeuCau,
					chiTietCu.GhiChu
				}
			});
		}

		// DELETE: api/ChiTietYeuCauXuatKho/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteChiTietYeuCauXuatKho(int id)
		{
			var chiTiet = await _context.ChiTietYeuCauXuatKhos.FindAsync(id);

			if (chiTiet == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy chi tiết yêu cầu xuất kho để xóa"
				});
			}

			_context.ChiTietYeuCauXuatKhos.Remove(chiTiet);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Xóa chi tiết yêu cầu xuất kho thành công"
			});
		}
	}
}