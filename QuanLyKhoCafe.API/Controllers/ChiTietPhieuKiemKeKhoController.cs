using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ChiTietPhieuKiemKeKhoController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public ChiTietPhieuKiemKeKhoController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/ChiTietPhieuKiemKeKho
		[HttpGet]
		public async Task<IActionResult> GetChiTietPhieuKiemKeKhos()
		{
			var danhSach = await _context.ChiTietPhieuKiemKeKhos
				.OrderByDescending(ct => ct.ChiTietPhieuKiemKeKhoId)
				.Select(ct => new
				{
					ct.ChiTietPhieuKiemKeKhoId,
					ct.PhieuKiemKeKhoId,
					MaPhieuKiemKe = ct.PhieuKiemKeKho != null ? ct.PhieuKiemKeKho.MaPhieuKiemKe : null,
					ct.NguyenVatLieuId,
					MaNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.MaNguyenVatLieu : null,
					TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
					ct.SoLuongHeThong,
					ct.SoLuongThucTe,
					ct.ChenhLech,
					ct.LyDoChenhLech
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/ChiTietPhieuKiemKeKho/5
		[HttpGet("{id}")]
		public async Task<IActionResult> GetChiTietPhieuKiemKeKho(int id)
		{
			var chiTiet = await _context.ChiTietPhieuKiemKeKhos
				.Where(ct => ct.ChiTietPhieuKiemKeKhoId == id)
				.Select(ct => new
				{
					ct.ChiTietPhieuKiemKeKhoId,
					ct.PhieuKiemKeKhoId,
					MaPhieuKiemKe = ct.PhieuKiemKeKho != null ? ct.PhieuKiemKeKho.MaPhieuKiemKe : null,
					ct.NguyenVatLieuId,
					MaNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.MaNguyenVatLieu : null,
					TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
					ct.SoLuongHeThong,
					ct.SoLuongThucTe,
					ct.ChenhLech,
					ct.LyDoChenhLech
				})
				.FirstOrDefaultAsync();

			if (chiTiet == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy chi tiết phiếu kiểm kê kho"
				});
			}

			return Ok(chiTiet);
		}

		// GET: api/ChiTietPhieuKiemKeKho/TheoPhieu/2
		[HttpGet("TheoPhieu/{phieuKiemKeKhoId}")]
		public async Task<IActionResult> GetChiTietTheoPhieu(int phieuKiemKeKhoId)
		{
			var phieuTonTai = await _context.PhieuKiemKeKhos
				.AnyAsync(p => p.PhieuKiemKeKhoId == phieuKiemKeKhoId);

			if (!phieuTonTai)
			{
				return NotFound(new
				{
					message = "Không tìm thấy phiếu kiểm kê kho"
				});
			}

			var danhSach = await _context.ChiTietPhieuKiemKeKhos
				.Where(ct => ct.PhieuKiemKeKhoId == phieuKiemKeKhoId)
				.OrderBy(ct => ct.ChiTietPhieuKiemKeKhoId)
				.Select(ct => new
				{
					ct.ChiTietPhieuKiemKeKhoId,
					ct.PhieuKiemKeKhoId,
					MaPhieuKiemKe = ct.PhieuKiemKeKho != null ? ct.PhieuKiemKeKho.MaPhieuKiemKe : null,
					ct.NguyenVatLieuId,
					MaNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.MaNguyenVatLieu : null,
					TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
					ct.SoLuongHeThong,
					ct.SoLuongThucTe,
					ct.ChenhLech,
					ct.LyDoChenhLech
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// POST: api/ChiTietPhieuKiemKeKho
		[HttpPost]
		public async Task<IActionResult> PostChiTietPhieuKiemKeKho([FromBody] TaoChiTietPhieuKiemKeKhoDto dto)
		{
			if (dto == null)
			{
				return BadRequest(new
				{
					message = "Dữ liệu chi tiết kiểm kê không hợp lệ"
				});
			}

			if (dto.PhieuKiemKeKhoId <= 0)
			{
				return BadRequest(new
				{
					message = "Phiếu kiểm kê không hợp lệ"
				});
			}

			if (dto.NguyenVatLieuId <= 0)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu không hợp lệ"
				});
			}

			if (dto.SoLuongThucTe < 0)
			{
				return BadRequest(new
				{
					message = "Số lượng thực tế không được nhỏ hơn 0"
				});
			}

			var phieu = await _context.PhieuKiemKeKhos
				.FirstOrDefaultAsync(p => p.PhieuKiemKeKhoId == dto.PhieuKiemKeKhoId);

			if (phieu == null)
			{
				return BadRequest(new
				{
					message = "Phiếu kiểm kê kho không tồn tại"
				});
			}

			if (phieu.TrangThai != "ChoXacNhan")
			{
				return BadRequest(new
				{
					message = "Chỉ được thêm chi tiết cho phiếu kiểm kê đang chờ xác nhận"
				});
			}

			var nguyenVatLieu = await _context.NguyenVatLieus
				.FirstOrDefaultAsync(nvl => nvl.NguyenVatLieuId == dto.NguyenVatLieuId);

			if (nguyenVatLieu == null)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu không tồn tại"
				});
			}

			var daTonTaiChiTiet = await _context.ChiTietPhieuKiemKeKhos
				.AnyAsync(ct =>
					ct.PhieuKiemKeKhoId == dto.PhieuKiemKeKhoId &&
					ct.NguyenVatLieuId == dto.NguyenVatLieuId
				);

			if (daTonTaiChiTiet)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu này đã có trong phiếu kiểm kê"
				});
			}

			try
			{
				var chiTiet = new ChiTietPhieuKiemKeKho
				{
					PhieuKiemKeKhoId = dto.PhieuKiemKeKhoId,
					NguyenVatLieuId = dto.NguyenVatLieuId,
					SoLuongHeThong = nguyenVatLieu.TonHienTai,
					SoLuongThucTe = dto.SoLuongThucTe,
					ChenhLech = dto.SoLuongThucTe - nguyenVatLieu.TonHienTai,
					LyDoChenhLech = dto.LyDoChenhLech
				};

				_context.ChiTietPhieuKiemKeKhos.Add(chiTiet);
				await _context.SaveChangesAsync();

				return Ok(new
				{
					message = "Tạo chi tiết phiếu kiểm kê kho thành công",
					data = new
					{
						chiTiet.ChiTietPhieuKiemKeKhoId,
						chiTiet.PhieuKiemKeKhoId,
						chiTiet.NguyenVatLieuId,
						chiTiet.SoLuongHeThong,
						chiTiet.SoLuongThucTe,
						chiTiet.ChenhLech,
						chiTiet.LyDoChenhLech
					}
				});
			}
			catch (Exception ex)
			{
				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi tạo chi tiết kiểm kê",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/ChiTietPhieuKiemKeKho/5
		[HttpPut("{id}")]
		public async Task<IActionResult> PutChiTietPhieuKiemKeKho(int id, [FromBody] CapNhatChiTietPhieuKiemKeKhoDto dto)
		{
			if (dto == null)
			{
				return BadRequest(new
				{
					message = "Dữ liệu cập nhật không hợp lệ"
				});
			}

			if (dto.ChiTietPhieuKiemKeKhoId > 0 && dto.ChiTietPhieuKiemKeKhoId != id)
			{
				return BadRequest(new
				{
					message = "Id trên URL không khớp với Id trong body"
				});
			}

			if (dto.PhieuKiemKeKhoId <= 0)
			{
				return BadRequest(new
				{
					message = "Phiếu kiểm kê không hợp lệ"
				});
			}

			if (dto.NguyenVatLieuId <= 0)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu không hợp lệ"
				});
			}

			if (dto.SoLuongThucTe < 0)
			{
				return BadRequest(new
				{
					message = "Số lượng thực tế không được nhỏ hơn 0"
				});
			}

			var chiTietCu = await _context.ChiTietPhieuKiemKeKhos.FindAsync(id);

			if (chiTietCu == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy chi tiết phiếu kiểm kê kho để cập nhật"
				});
			}

			var phieu = await _context.PhieuKiemKeKhos
				.FirstOrDefaultAsync(p => p.PhieuKiemKeKhoId == dto.PhieuKiemKeKhoId);

			if (phieu == null)
			{
				return BadRequest(new
				{
					message = "Phiếu kiểm kê kho không tồn tại"
				});
			}

			if (phieu.TrangThai != "ChoXacNhan")
			{
				return BadRequest(new
				{
					message = "Chỉ được cập nhật chi tiết cho phiếu kiểm kê đang chờ xác nhận"
				});
			}

			var nguyenVatLieu = await _context.NguyenVatLieus
				.FirstOrDefaultAsync(nvl => nvl.NguyenVatLieuId == dto.NguyenVatLieuId);

			if (nguyenVatLieu == null)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu không tồn tại"
				});
			}

			var daTonTaiChiTiet = await _context.ChiTietPhieuKiemKeKhos
				.AnyAsync(ct =>
					ct.PhieuKiemKeKhoId == dto.PhieuKiemKeKhoId &&
					ct.NguyenVatLieuId == dto.NguyenVatLieuId &&
					ct.ChiTietPhieuKiemKeKhoId != id
				);

			if (daTonTaiChiTiet)
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu này đã có trong phiếu kiểm kê"
				});
			}

			try
			{
				chiTietCu.PhieuKiemKeKhoId = dto.PhieuKiemKeKhoId;
				chiTietCu.NguyenVatLieuId = dto.NguyenVatLieuId;
				chiTietCu.SoLuongHeThong = nguyenVatLieu.TonHienTai;
				chiTietCu.SoLuongThucTe = dto.SoLuongThucTe;
				chiTietCu.ChenhLech = dto.SoLuongThucTe - nguyenVatLieu.TonHienTai;
				chiTietCu.LyDoChenhLech = dto.LyDoChenhLech;

				await _context.SaveChangesAsync();

				return Ok(new
				{
					message = "Cập nhật chi tiết phiếu kiểm kê kho thành công",
					data = new
					{
						chiTietCu.ChiTietPhieuKiemKeKhoId,
						chiTietCu.PhieuKiemKeKhoId,
						chiTietCu.NguyenVatLieuId,
						chiTietCu.SoLuongHeThong,
						chiTietCu.SoLuongThucTe,
						chiTietCu.ChenhLech,
						chiTietCu.LyDoChenhLech
					}
				});
			}
			catch (Exception ex)
			{
				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi cập nhật chi tiết kiểm kê",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// DELETE: api/ChiTietPhieuKiemKeKho/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteChiTietPhieuKiemKeKho(int id)
		{
			var chiTiet = await _context.ChiTietPhieuKiemKeKhos
				.Include(ct => ct.PhieuKiemKeKho)
				.FirstOrDefaultAsync(ct => ct.ChiTietPhieuKiemKeKhoId == id);

			if (chiTiet == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy chi tiết phiếu kiểm kê kho để xóa"
				});
			}

			if (chiTiet.PhieuKiemKeKho != null && chiTiet.PhieuKiemKeKho.TrangThai != "ChoXacNhan")
			{
				return BadRequest(new
				{
					message = "Chỉ được xóa chi tiết của phiếu kiểm kê đang chờ xác nhận"
				});
			}

			_context.ChiTietPhieuKiemKeKhos.Remove(chiTiet);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Xóa chi tiết phiếu kiểm kê kho thành công"
			});
		}
	}

	public class TaoChiTietPhieuKiemKeKhoDto
	{
		public int PhieuKiemKeKhoId { get; set; }

		public int NguyenVatLieuId { get; set; }

		public decimal SoLuongThucTe { get; set; }

		public string? LyDoChenhLech { get; set; }
	}

	public class CapNhatChiTietPhieuKiemKeKhoDto
	{
		public int ChiTietPhieuKiemKeKhoId { get; set; }

		public int PhieuKiemKeKhoId { get; set; }

		public int NguyenVatLieuId { get; set; }

		public decimal SoLuongThucTe { get; set; }

		public string? LyDoChenhLech { get; set; }
	}
}