using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class PhieuKiemKeKhoController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		private const string TRANG_THAI_CHO_XAC_NHAN = "ChoXacNhan";
		private const string TRANG_THAI_DA_XAC_NHAN = "DaXacNhan";
		private const string TRANG_THAI_TU_CHOI = "TuChoi";

		public PhieuKiemKeKhoController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/PhieuKiemKeKho
		[HttpGet]
		public async Task<IActionResult> GetPhieuKiemKeKhos()
		{
			var danhSach = await _context.PhieuKiemKeKhos
				.AsNoTracking()
				.OrderByDescending(pkk => pkk.PhieuKiemKeKhoId)
				.Select(pkk => new
				{
					pkk.PhieuKiemKeKhoId,
					pkk.MaPhieuKiemKe,

					pkk.NguoiKiemKeId,
					TenNguoiKiemKe = pkk.NguoiKiemKe.HoTen,

					pkk.NguoiXacNhanId,
					TenNguoiXacNhan = pkk.NguoiXacNhan != null
						? pkk.NguoiXacNhan.HoTen
						: null,

					pkk.NgayKiemKe,
					pkk.NgayXacNhan,
					pkk.TrangThai,
					pkk.GhiChu,

					SoDongChiTiet = pkk.ChiTietPhieuKiemKeKhos.Count
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/PhieuKiemKeKho/5
		[HttpGet("{id:int}")]
		public async Task<IActionResult> GetPhieuKiemKeKho(int id)
		{
			var data = await LayPhieuKiemKeResponse(id);

			if (data == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy phiếu kiểm kê kho."
				});
			}

			return Ok(data);
		}

		// POST: api/PhieuKiemKeKho
		[HttpPost]
		public async Task<IActionResult> PostPhieuKiemKeKho([FromBody] TaoPhieuKiemKeKhoDto dto)
		{
			if (dto == null)
			{
				return BadRequest(new
				{
					message = "Dữ liệu phiếu kiểm kê không hợp lệ."
				});
			}

			if (dto.NguoiKiemKeId <= 0)
			{
				return BadRequest(new
				{
					message = "Vui lòng chọn người kiểm kê."
				});
			}

			var nguoiKiemKeTonTai = await _context.NguoiDungs
				.AnyAsync(nd => nd.NguoiDungId == dto.NguoiKiemKeId);

			if (!nguoiKiemKeTonTai)
			{
				return BadRequest(new
				{
					message = "Người kiểm kê không tồn tại."
				});
			}

			if (dto.ChiTiet == null || dto.ChiTiet.Count == 0)
			{
				return BadRequest(new
				{
					message = "Phiếu kiểm kê phải có ít nhất một nguyên vật liệu."
				});
			}

			var nguyenVatLieuIds = dto.ChiTiet
				.Select(ct => ct.NguyenVatLieuId)
				.ToList();

			if (nguyenVatLieuIds.Any(id => id <= 0))
			{
				return BadRequest(new
				{
					message = "Nguyên vật liệu không hợp lệ."
				});
			}

			var idTrung = nguyenVatLieuIds
				.GroupBy(id => id)
				.Where(g => g.Count() > 1)
				.Select(g => g.Key)
				.FirstOrDefault();

			if (idTrung > 0)
			{
				return BadRequest(new
				{
					message = $"Nguyên vật liệu ID = {idTrung} bị nhập trùng trong phiếu kiểm kê."
				});
			}

			if (dto.ChiTiet.Any(ct => ct.SoLuongThucTe < 0))
			{
				return BadRequest(new
				{
					message = "Số lượng thực tế không được nhỏ hơn 0."
				});
			}

			var nguyenVatLieuMap = await _context.NguyenVatLieus
				.Where(nvl => nguyenVatLieuIds.Contains(nvl.NguyenVatLieuId))
				.ToDictionaryAsync(nvl => nvl.NguyenVatLieuId);

			foreach (var id in nguyenVatLieuIds)
			{
				if (!nguyenVatLieuMap.ContainsKey(id))
				{
					return BadRequest(new
					{
						message = $"Nguyên vật liệu ID = {id} không tồn tại."
					});
				}
			}

			foreach (var item in dto.ChiTiet)
			{
				var nguyenVatLieu = nguyenVatLieuMap[item.NguyenVatLieuId];
				var chenhLech = item.SoLuongThucTe - nguyenVatLieu.TonHienTai;

				if (chenhLech != 0 && string.IsNullOrWhiteSpace(item.LyDoChenhLech))
				{
					return BadRequest(new
					{
						message = $"Nguyên vật liệu {nguyenVatLieu.TenNguyenVatLieu} có chênh lệch nên phải nhập lý do chênh lệch."
					});
				}
			}

			var maPhieu = string.IsNullOrWhiteSpace(dto.MaPhieuKiemKe)
				? TaoMaPhieuKiemKe()
				: dto.MaPhieuKiemKe.Trim();

			var maPhieuDaTonTai = await _context.PhieuKiemKeKhos
				.AnyAsync(pkk => pkk.MaPhieuKiemKe == maPhieu);

			if (maPhieuDaTonTai)
			{
				return BadRequest(new
				{
					message = "Mã phiếu kiểm kê đã tồn tại."
				});
			}

			await using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				var phieu = new PhieuKiemKeKho
				{
					MaPhieuKiemKe = maPhieu,
					NguoiKiemKeId = dto.NguoiKiemKeId,
					NgayKiemKe = DateTime.Now,
					TrangThai = TRANG_THAI_CHO_XAC_NHAN,
					GhiChu = dto.GhiChu
				};

				foreach (var item in dto.ChiTiet)
				{
					var nguyenVatLieu = nguyenVatLieuMap[item.NguyenVatLieuId];

					phieu.ChiTietPhieuKiemKeKhos.Add(new ChiTietPhieuKiemKeKho
					{
						NguyenVatLieuId = item.NguyenVatLieuId,

						// Lấy tồn hệ thống từ DB, không cho frontend tự gửi
						SoLuongHeThong = nguyenVatLieu.TonHienTai,

						SoLuongThucTe = item.SoLuongThucTe,
						LyDoChenhLech = item.LyDoChenhLech
					});
				}

				_context.PhieuKiemKeKhos.Add(phieu);
				await _context.SaveChangesAsync();

				await transaction.CommitAsync();

				var data = await LayPhieuKiemKeResponse(phieu.PhieuKiemKeKhoId);

				return Ok(new
				{
					message = "Tạo phiếu kiểm kê kho thành công.",
					data
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi tạo phiếu kiểm kê kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/PhieuKiemKeKho/5/xac-nhan
		[HttpPut("{id:int}/xac-nhan")]
		public async Task<IActionResult> XacNhanPhieuKiemKeKho(int id, [FromBody] XacNhanPhieuKiemKeKhoDto dto)
		{
			if (dto == null || dto.NguoiXacNhanId <= 0)
			{
				return BadRequest(new
				{
					message = "Vui lòng chọn người xác nhận."
				});
			}

			var nguoiXacNhanTonTai = await _context.NguoiDungs
				.AnyAsync(nd => nd.NguoiDungId == dto.NguoiXacNhanId);

			if (!nguoiXacNhanTonTai)
			{
				return BadRequest(new
				{
					message = "Người xác nhận không tồn tại."
				});
			}

			var phieu = await _context.PhieuKiemKeKhos
				.Include(p => p.ChiTietPhieuKiemKeKhos)
				.FirstOrDefaultAsync(p => p.PhieuKiemKeKhoId == id);

			if (phieu == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy phiếu kiểm kê kho."
				});
			}

			if (phieu.TrangThai != TRANG_THAI_CHO_XAC_NHAN)
			{
				return BadRequest(new
				{
					message = "Chỉ được xác nhận phiếu kiểm kê đang chờ xác nhận."
				});
			}

			if (!phieu.ChiTietPhieuKiemKeKhos.Any())
			{
				return BadRequest(new
				{
					message = "Phiếu kiểm kê phải có ít nhất một nguyên vật liệu."
				});
			}

			var nguyenVatLieuIds = phieu.ChiTietPhieuKiemKeKhos
				.Select(ct => ct.NguyenVatLieuId)
				.Distinct()
				.ToList();

			var nguyenVatLieuMap = await _context.NguyenVatLieus
				.Where(nvl => nguyenVatLieuIds.Contains(nvl.NguyenVatLieuId))
				.ToDictionaryAsync(nvl => nvl.NguyenVatLieuId);

			await using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				var thoiGian = DateTime.Now;

				foreach (var chiTiet in phieu.ChiTietPhieuKiemKeKhos)
				{
					if (!nguyenVatLieuMap.TryGetValue(chiTiet.NguyenVatLieuId, out var nguyenVatLieu))
					{
						return BadRequest(new
						{
							message = $"Không tìm thấy nguyên vật liệu ID = {chiTiet.NguyenVatLieuId}."
						});
					}

					var tonTruoc = nguyenVatLieu.TonHienTai;
					var tonSau = chiTiet.SoLuongThucTe;
					var soLuongThayDoi = tonSau - tonTruoc;

					if (soLuongThayDoi != 0)
					{
						nguyenVatLieu.TonHienTai = tonSau;

						_context.LichSuTonKhos.Add(new LichSuTonKho
						{
							NguyenVatLieuId = nguyenVatLieu.NguyenVatLieuId,
							LoaiGiaoDich = "KiemKe",
							BangLienQuan = "PhieuKiemKeKho",
							BanGhiLienQuanId = phieu.PhieuKiemKeKhoId,
							SoLuongThayDoi = soLuongThayDoi,
							TonTruoc = tonTruoc,
							TonSau = tonSau,
							NguoiThucHienId = dto.NguoiXacNhanId,
							ThoiGian = thoiGian,
							GhiChu = string.IsNullOrWhiteSpace(chiTiet.LyDoChenhLech)
								? $"Điều chỉnh tồn theo phiếu kiểm kê {phieu.MaPhieuKiemKe}"
								: chiTiet.LyDoChenhLech
						});
					}
				}

				phieu.TrangThai = TRANG_THAI_DA_XAC_NHAN;
				phieu.NguoiXacNhanId = dto.NguoiXacNhanId;
				phieu.NgayXacNhan = thoiGian;

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				var data = await LayPhieuKiemKeResponse(id);

				return Ok(new
				{
					message = "Xác nhận phiếu kiểm kê kho thành công. Tồn kho đã được cập nhật.",
					data
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi xác nhận phiếu kiểm kê kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/PhieuKiemKeKho/5/tu-choi
		[HttpPut("{id:int}/tu-choi")]
		public async Task<IActionResult> TuChoiPhieuKiemKeKho(int id, [FromBody] TuChoiPhieuKiemKeKhoDto dto)
		{
			if (dto == null || dto.NguoiXacNhanId <= 0)
			{
				return BadRequest(new
				{
					message = "Vui lòng chọn người từ chối."
				});
			}

			var phieu = await _context.PhieuKiemKeKhos
				.FirstOrDefaultAsync(p => p.PhieuKiemKeKhoId == id);

			if (phieu == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy phiếu kiểm kê kho."
				});
			}

			if (phieu.TrangThai != TRANG_THAI_CHO_XAC_NHAN)
			{
				return BadRequest(new
				{
					message = "Chỉ được từ chối phiếu kiểm kê đang chờ xác nhận."
				});
			}

			var nguoiXacNhanTonTai = await _context.NguoiDungs
				.AnyAsync(nd => nd.NguoiDungId == dto.NguoiXacNhanId);

			if (!nguoiXacNhanTonTai)
			{
				return BadRequest(new
				{
					message = "Người từ chối không tồn tại."
				});
			}

			phieu.TrangThai = TRANG_THAI_TU_CHOI;
			phieu.NguoiXacNhanId = dto.NguoiXacNhanId;
			phieu.NgayXacNhan = DateTime.Now;

			if (!string.IsNullOrWhiteSpace(dto.GhiChu))
			{
				phieu.GhiChu = dto.GhiChu;
			}

			await _context.SaveChangesAsync();

			var data = await LayPhieuKiemKeResponse(id);

			return Ok(new
			{
				message = "Từ chối phiếu kiểm kê kho thành công.",
				data
			});
		}

		// DELETE: api/PhieuKiemKeKho/5
		[HttpDelete("{id:int}")]
		public async Task<IActionResult> DeletePhieuKiemKeKho(int id)
		{
			var phieu = await _context.PhieuKiemKeKhos
				.Include(p => p.ChiTietPhieuKiemKeKhos)
				.FirstOrDefaultAsync(p => p.PhieuKiemKeKhoId == id);

			if (phieu == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy phiếu kiểm kê kho để xóa."
				});
			}

			if (phieu.TrangThai == TRANG_THAI_DA_XAC_NHAN)
			{
				return BadRequest(new
				{
					message = "Không thể xóa phiếu kiểm kê đã xác nhận vì đã ảnh hưởng tồn kho."
				});
			}

			await using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				_context.ChiTietPhieuKiemKeKhos.RemoveRange(phieu.ChiTietPhieuKiemKeKhos);
				_context.PhieuKiemKeKhos.Remove(phieu);

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Xóa phiếu kiểm kê kho thành công."
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi xóa phiếu kiểm kê kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		private async Task<object?> LayPhieuKiemKeResponse(int id)
		{
			return await _context.PhieuKiemKeKhos
				.AsNoTracking()
				.Where(pkk => pkk.PhieuKiemKeKhoId == id)
				.Select(pkk => new
				{
					pkk.PhieuKiemKeKhoId,
					pkk.MaPhieuKiemKe,

					pkk.NguoiKiemKeId,
					TenNguoiKiemKe = pkk.NguoiKiemKe.HoTen,

					pkk.NguoiXacNhanId,
					TenNguoiXacNhan = pkk.NguoiXacNhan != null
						? pkk.NguoiXacNhan.HoTen
						: null,

					pkk.NgayKiemKe,
					pkk.NgayXacNhan,
					pkk.TrangThai,
					pkk.GhiChu,

					ChiTiet = pkk.ChiTietPhieuKiemKeKhos
						.OrderBy(ct => ct.ChiTietPhieuKiemKeKhoId)
						.Select(ct => new
						{
							ct.ChiTietPhieuKiemKeKhoId,
							ct.NguyenVatLieuId,
							MaNguyenVatLieu = ct.NguyenVatLieu.MaNguyenVatLieu,
							TenNguyenVatLieu = ct.NguyenVatLieu.TenNguyenVatLieu,
							TenDonVi = ct.NguyenVatLieu.DonViTinh.TenDonVi,
							ct.SoLuongHeThong,
							ct.SoLuongThucTe,
							ct.ChenhLech,
							ct.LyDoChenhLech
						})
						.ToList()
				})
				.FirstOrDefaultAsync();
		}

		private static string TaoMaPhieuKiemKe()
		{
			return "PKK" + DateTime.Now.ToString("yyyyMMddHHmmss");
		}
	}

	public class TaoPhieuKiemKeKhoDto
	{
		public string? MaPhieuKiemKe { get; set; }

		public int NguoiKiemKeId { get; set; }

		public string? GhiChu { get; set; }

		public List<TaoChiTietKiemKeDto> ChiTiet { get; set; } = new();
	}

	public class TaoChiTietKiemKeDto
	{
		public int NguyenVatLieuId { get; set; }

		public decimal SoLuongThucTe { get; set; }

		public string? LyDoChenhLech { get; set; }
	}

	public class XacNhanPhieuKiemKeKhoDto
	{
		public int NguoiXacNhanId { get; set; }
	}

	public class TuChoiPhieuKiemKeKhoDto
	{
		public int NguoiXacNhanId { get; set; }

		public string? GhiChu { get; set; }
	}
}