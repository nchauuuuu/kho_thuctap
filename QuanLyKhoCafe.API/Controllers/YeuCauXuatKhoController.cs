using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class YeuCauXuatKhoController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public YeuCauXuatKhoController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/YeuCauXuatKho
		[HttpGet]
		public async Task<IActionResult> LayDanhSach()
		{
			var danhSach = await _context.YeuCauXuatKhos
				.Include(x => x.NguoiYeuCau)
				.Include(x => x.ChiTietYeuCauXuatKhos)
					.ThenInclude(ct => ct.NguyenVatLieu)
				.OrderByDescending(x => x.NgayYeuCau)
				.Select(x => new
				{
					x.YeuCauXuatKhoId,
					x.MaYeuCau,
					x.NguoiYeuCauId,
					TenNguoiYeuCau = x.NguoiYeuCau != null ? x.NguoiYeuCau.HoTen : null,
					NguoiDuyetId = (int?)null,
					TenNguoiDuyet = x.TrangThai == "DaDuyet" ? "Đã duyệt" : null,
					x.NgayYeuCau,
					NgayDuyet = (DateTime?)null,
					x.TrangThai,
					x.GhiChu,
					ChiTiet = x.ChiTietYeuCauXuatKhos.Select(ct => new
					{
						ct.ChiTietYeuCauXuatKhoId,
						ct.NguyenVatLieuId,
						MaNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.MaNguyenVatLieu : null,
						TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
						TonHienTai = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TonHienTai : 0,
						ct.SoLuongYeuCau,
						ct.GhiChu
					})
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/YeuCauXuatKho/1
		[HttpGet("{id}")]
		public async Task<IActionResult> LayTheoId(int id)
		{
			var yeuCau = await _context.YeuCauXuatKhos
				.Include(x => x.NguoiYeuCau)
				.Include(x => x.ChiTietYeuCauXuatKhos)
					.ThenInclude(ct => ct.NguyenVatLieu)
				.Where(x => x.YeuCauXuatKhoId == id)
				.Select(x => new
				{
					x.YeuCauXuatKhoId,
					x.MaYeuCau,
					x.NguoiYeuCauId,
					TenNguoiYeuCau = x.NguoiYeuCau != null ? x.NguoiYeuCau.HoTen : null,
					NguoiDuyetId = (int?)null,
					TenNguoiDuyet = x.TrangThai == "DaDuyet" ? "Đã duyệt" : null,
					x.NgayYeuCau,
					NgayDuyet = (DateTime?)null,
					x.TrangThai,
					x.GhiChu,
					ChiTiet = x.ChiTietYeuCauXuatKhos.Select(ct => new
					{
						ct.ChiTietYeuCauXuatKhoId,
						ct.NguyenVatLieuId,
						MaNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.MaNguyenVatLieu : null,
						TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
						TonHienTai = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TonHienTai : 0,
						ct.SoLuongYeuCau,
						ct.GhiChu
					})
				})
				.FirstOrDefaultAsync();

			if (yeuCau == null)
			{
				return NotFound("Không tìm thấy yêu cầu xuất kho.");
			}

			return Ok(yeuCau);
		}

		// POST: api/YeuCauXuatKho
		[HttpPost]
		public async Task<IActionResult> TaoYeuCau([FromBody] TaoYeuCauXuatKhoDto dto)
		{
			if (dto == null)
			{
				return BadRequest("Dữ liệu yêu cầu xuất kho không hợp lệ.");
			}

			if (dto.ChiTiet == null || !dto.ChiTiet.Any())
			{
				return BadRequest("Yêu cầu xuất kho phải có ít nhất một nguyên vật liệu.");
			}

			var nguoiYeuCau = await _context.NguoiDungs
				.FirstOrDefaultAsync(x => x.NguoiDungId == dto.NguoiYeuCauId);

			if (nguoiYeuCau == null)
			{
				return BadRequest("Người yêu cầu không tồn tại.");
			}

			foreach (var item in dto.ChiTiet)
			{
				if (item.SoLuongYeuCau <= 0)
				{
					return BadRequest("Số lượng yêu cầu phải lớn hơn 0.");
				}

				var nguyenVatLieu = await _context.NguyenVatLieus
					.FirstOrDefaultAsync(x => x.NguyenVatLieuId == item.NguyenVatLieuId);

				if (nguyenVatLieu == null)
				{
					return BadRequest($"Nguyên vật liệu Id = {item.NguyenVatLieuId} không tồn tại.");
				}

				if (nguyenVatLieu.TrangThai == "NgungSuDung")
				{
					return BadRequest($"Nguyên vật liệu {nguyenVatLieu.TenNguyenVatLieu} đã ngưng sử dụng.");
				}

				if (item.SoLuongYeuCau > nguyenVatLieu.TonHienTai)
				{
					return BadRequest(
						$"Nguyên vật liệu {nguyenVatLieu.TenNguyenVatLieu} không đủ tồn kho. Tồn hiện tại: {nguyenVatLieu.TonHienTai}."
					);
				}
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				var yeuCau = new YeuCauXuatKho
				{
					MaYeuCau = TaoMaYeuCau(),
					NguoiYeuCauId = dto.NguoiYeuCauId,
					NgayYeuCau = DateTime.Now,
					TrangThai = "ChoXuLy",
					GhiChu = dto.GhiChu
				};

				_context.YeuCauXuatKhos.Add(yeuCau);
				await _context.SaveChangesAsync();

				foreach (var item in dto.ChiTiet)
				{
					var chiTiet = new ChiTietYeuCauXuatKho
					{
						YeuCauXuatKhoId = yeuCau.YeuCauXuatKhoId,
						NguyenVatLieuId = item.NguyenVatLieuId,
						SoLuongYeuCau = item.SoLuongYeuCau,
						GhiChu = item.GhiChu
					};

					_context.ChiTietYeuCauXuatKhos.Add(chiTiet);
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Tạo yêu cầu xuất kho thành công.",
					data = new
					{
						yeuCau.YeuCauXuatKhoId,
						yeuCau.MaYeuCau,
						yeuCau.NguoiYeuCauId,
						yeuCau.NgayYeuCau,
						yeuCau.TrangThai,
						yeuCau.GhiChu
					}
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi tạo yêu cầu xuất kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/YeuCauXuatKho/1/duyet
		[HttpPut("{id}/duyet")]
		public async Task<IActionResult> DuyetYeuCau(
			int id,
			[FromBody] DuyetYeuCauXuatKhoDto dto
		)
		{
			if (dto == null || dto.NguoiDuyetId <= 0)
			{
				return BadRequest("Người duyệt không hợp lệ.");
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				var yeuCau = await _context.YeuCauXuatKhos
					.Include(x => x.ChiTietYeuCauXuatKhos)
					.FirstOrDefaultAsync(x => x.YeuCauXuatKhoId == id);

				if (yeuCau == null)
				{
					return NotFound("Không tìm thấy yêu cầu xuất kho.");
				}

				if (yeuCau.TrangThai == "DaDuyet")
				{
					return BadRequest("Yêu cầu xuất kho đã được duyệt trước đó.");
				}

				if (yeuCau.TrangThai == "TuChoi")
				{
					return BadRequest("Không thể duyệt yêu cầu đã bị từ chối.");
				}

				if (yeuCau.TrangThai == "DaLapPhieu")
				{
					return BadRequest("Yêu cầu xuất kho đã lập phiếu, không thể duyệt lại.");
				}

				if (yeuCau.TrangThai != "ChoXuLy")
				{
					return BadRequest("Chỉ có thể duyệt yêu cầu đang chờ xử lý.");
				}

				if (yeuCau.ChiTietYeuCauXuatKhos == null || !yeuCau.ChiTietYeuCauXuatKhos.Any())
				{
					return BadRequest("Yêu cầu xuất kho phải có ít nhất một nguyên vật liệu.");
				}

				var nguoiDuyet = await _context.NguoiDungs
					.FirstOrDefaultAsync(x => x.NguoiDungId == dto.NguoiDuyetId);

				if (nguoiDuyet == null)
				{
					return BadRequest("Người duyệt không tồn tại.");
				}

				foreach (var chiTiet in yeuCau.ChiTietYeuCauXuatKhos)
				{
					if (chiTiet.SoLuongYeuCau <= 0)
					{
						return BadRequest(
							$"Số lượng yêu cầu của nguyên vật liệu ID = {chiTiet.NguyenVatLieuId} không hợp lệ."
						);
					}

					var nguyenVatLieu = await _context.NguyenVatLieus
						.FirstOrDefaultAsync(x => x.NguyenVatLieuId == chiTiet.NguyenVatLieuId);

					if (nguyenVatLieu == null)
					{
						return BadRequest(
							$"Không tìm thấy nguyên vật liệu ID = {chiTiet.NguyenVatLieuId}."
						);
					}

					if (nguyenVatLieu.TrangThai == "NgungSuDung")
					{
						return BadRequest(
							$"Nguyên vật liệu {nguyenVatLieu.TenNguyenVatLieu} đã ngưng sử dụng."
						);
					}

					if (chiTiet.SoLuongYeuCau > nguyenVatLieu.TonHienTai)
					{
						return BadRequest(
							$"Nguyên vật liệu {nguyenVatLieu.TenNguyenVatLieu} không đủ tồn kho. Tồn hiện tại: {nguyenVatLieu.TonHienTai}, số lượng yêu cầu: {chiTiet.SoLuongYeuCau}."
						);
					}
				}

				foreach (var chiTiet in yeuCau.ChiTietYeuCauXuatKhos)
				{
					var nguyenVatLieu = await _context.NguyenVatLieus
						.FirstOrDefaultAsync(x => x.NguyenVatLieuId == chiTiet.NguyenVatLieuId);

					if (nguyenVatLieu != null)
					{
						nguyenVatLieu.TonHienTai -= chiTiet.SoLuongYeuCau;
					}
				}

				yeuCau.TrangThai = "DaDuyet";

				if (string.IsNullOrWhiteSpace(yeuCau.GhiChu))
				{
					yeuCau.GhiChu = $"Đã duyệt bởi người dùng ID {dto.NguoiDuyetId}.";
				}
				else
				{
					yeuCau.GhiChu += $" | Đã duyệt bởi người dùng ID {dto.NguoiDuyetId}.";
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Duyệt yêu cầu xuất kho thành công. Tồn kho đã được trừ."
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi duyệt yêu cầu xuất kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/YeuCauXuatKho/1/tu-choi
		[HttpPut("{id}/tu-choi")]
		public async Task<IActionResult> TuChoiYeuCau(
			int id,
			[FromBody] TuChoiYeuCauXuatKhoDto dto
		)
		{
			var yeuCau = await _context.YeuCauXuatKhos.FindAsync(id);

			if (yeuCau == null)
			{
				return NotFound("Không tìm thấy yêu cầu xuất kho.");
			}

			if (yeuCau.TrangThai != "ChoXuLy")
			{
				return BadRequest("Chỉ có thể từ chối yêu cầu đang chờ xử lý.");
			}

			yeuCau.TrangThai = "TuChoi";
			yeuCau.GhiChu = string.IsNullOrWhiteSpace(dto?.LyDoTuChoi)
				? yeuCau.GhiChu
				: dto.LyDoTuChoi;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Từ chối yêu cầu xuất kho thành công.",
				data = yeuCau
			});
		}

		// PUT: api/YeuCauXuatKho/1/da-lap-phieu
		[HttpPut("{id}/da-lap-phieu")]
		public async Task<IActionResult> DanhDauDaLapPhieu(int id)
		{
			var yeuCau = await _context.YeuCauXuatKhos.FindAsync(id);

			if (yeuCau == null)
			{
				return NotFound("Không tìm thấy yêu cầu xuất kho.");
			}

			if (yeuCau.TrangThai != "ChoXuLy")
			{
				return BadRequest("Chỉ có thể cập nhật yêu cầu đang chờ xử lý.");
			}

			yeuCau.TrangThai = "DaLapPhieu";

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Đã cập nhật trạng thái yêu cầu xuất kho thành đã lập phiếu.",
				data = yeuCau
			});
		}

		// DELETE: api/YeuCauXuatKho/1
		[HttpDelete("{id}")]
		public async Task<IActionResult> XoaYeuCau(int id)
		{
			var yeuCau = await _context.YeuCauXuatKhos
				.Include(x => x.ChiTietYeuCauXuatKhos)
				.FirstOrDefaultAsync(x => x.YeuCauXuatKhoId == id);

			if (yeuCau == null)
			{
				return NotFound("Không tìm thấy yêu cầu xuất kho.");
			}

			var daCoPhieuXuat = await _context.PhieuXuatKhos
				.AnyAsync(x => x.YeuCauXuatKhoId == id);

			if (daCoPhieuXuat)
			{
				return BadRequest("Không thể xóa yêu cầu xuất kho vì đã có phiếu xuất kho liên quan.");
			}

			if (yeuCau.TrangThai == "DaDuyet")
			{
				return BadRequest("Không thể xóa yêu cầu xuất kho đã duyệt vì tồn kho đã bị trừ.");
			}

			if (yeuCau.TrangThai == "DaLapPhieu")
			{
				return BadRequest("Không thể xóa yêu cầu xuất kho đã lập phiếu.");
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				if (yeuCau.ChiTietYeuCauXuatKhos.Any())
				{
					_context.ChiTietYeuCauXuatKhos.RemoveRange(yeuCau.ChiTietYeuCauXuatKhos);
				}

				_context.YeuCauXuatKhos.Remove(yeuCau);

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Xóa yêu cầu xuất kho thành công."
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi xóa yêu cầu xuất kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		private static string TaoMaYeuCau()
		{
			return "YCXK" + DateTime.Now.ToString("yyyyMMddHHmmss");
		}
	}

	public class TaoYeuCauXuatKhoDto
	{
		public int NguoiYeuCauId { get; set; }

		public string? GhiChu { get; set; }

		public List<TaoChiTietYeuCauXuatKhoDto> ChiTiet { get; set; } = new();
	}

	public class TaoChiTietYeuCauXuatKhoDto
	{
		public int NguyenVatLieuId { get; set; }

		public decimal SoLuongYeuCau { get; set; }

		public string? GhiChu { get; set; }
	}

	public class DuyetYeuCauXuatKhoDto
	{
		public int NguoiDuyetId { get; set; }
	}

	public class TuChoiYeuCauXuatKhoDto
	{
		public string? LyDoTuChoi { get; set; }
	}
}