using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class PhieuNhapKhoController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public PhieuNhapKhoController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/PhieuNhapKho
		[HttpGet]
		public async Task<IActionResult> LayDanhSach()
		{
			var danhSach = await _context.PhieuNhapKhos
				.Include(x => x.NhaCungCap)
				.Include(x => x.NguoiLap)
				.Include(x => x.NguoiDuyet)
				.Include(x => x.ChiTietPhieuNhapKhos)
					.ThenInclude(ct => ct.NguyenVatLieu)
				.OrderByDescending(x => x.NgayNhap)
				.Select(x => new
				{
					x.PhieuNhapKhoId,
					x.MaPhieuNhap,
					x.NhaCungCapId,
					TenNhaCungCap = x.NhaCungCap != null ? x.NhaCungCap.TenNhaCungCap : null,
					x.NguoiLapId,
					TenNguoiLap = x.NguoiLap != null ? x.NguoiLap.HoTen : null,
					x.NguoiDuyetId,
					TenNguoiDuyet = x.NguoiDuyet != null ? x.NguoiDuyet.HoTen : null,
					x.NgayNhap,
					x.NgayDuyet,
					x.TrangThai,
					x.GhiChu,
					TongTien = x.ChiTietPhieuNhapKhos.Sum(ct => ct.SoLuongNhap * (ct.DonGia ?? 0)),
					ChiTiet = x.ChiTietPhieuNhapKhos.Select(ct => new
					{
						ct.ChiTietPhieuNhapKhoId,
						ct.NguyenVatLieuId,
						MaNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.MaNguyenVatLieu : null,
						TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
						ct.SoLuongNhap,
						ct.DonGia,
						ThanhTien = ct.SoLuongNhap * (ct.DonGia ?? 0),
						ct.GhiChu
					})
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/PhieuNhapKho/1
		[HttpGet("{id}")]
		public async Task<IActionResult> LayTheoId(int id)
		{
			var phieu = await _context.PhieuNhapKhos
				.Include(x => x.NhaCungCap)
				.Include(x => x.NguoiLap)
				.Include(x => x.NguoiDuyet)
				.Include(x => x.ChiTietPhieuNhapKhos)
					.ThenInclude(ct => ct.NguyenVatLieu)
				.Where(x => x.PhieuNhapKhoId == id)
				.Select(x => new
				{
					x.PhieuNhapKhoId,
					x.MaPhieuNhap,
					x.NhaCungCapId,
					TenNhaCungCap = x.NhaCungCap != null ? x.NhaCungCap.TenNhaCungCap : null,
					x.NguoiLapId,
					TenNguoiLap = x.NguoiLap != null ? x.NguoiLap.HoTen : null,
					x.NguoiDuyetId,
					TenNguoiDuyet = x.NguoiDuyet != null ? x.NguoiDuyet.HoTen : null,
					x.NgayNhap,
					x.NgayDuyet,
					x.TrangThai,
					x.GhiChu,
					TongTien = x.ChiTietPhieuNhapKhos.Sum(ct => ct.SoLuongNhap * (ct.DonGia ?? 0)),
					ChiTiet = x.ChiTietPhieuNhapKhos.Select(ct => new
					{
						ct.ChiTietPhieuNhapKhoId,
						ct.NguyenVatLieuId,
						MaNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.MaNguyenVatLieu : null,
						TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
						ct.SoLuongNhap,
						ct.DonGia,
						ThanhTien = ct.SoLuongNhap * (ct.DonGia ?? 0),
						ct.GhiChu
					})
				})
				.FirstOrDefaultAsync();

			if (phieu == null)
			{
				return NotFound("Không tìm thấy phiếu nhập kho.");
			}

			return Ok(phieu);
		}

		// POST: api/PhieuNhapKho
		[HttpPost]
		public async Task<IActionResult> TaoPhieuNhap([FromBody] TaoPhieuNhapKhoDto dto)
		{
			var validationError = await ValidatePhieuNhapDto(dto);
			if (validationError != null) return BadRequest(validationError);

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				var phieu = new PhieuNhapKho
				{
					MaPhieuNhap = TaoMaPhieuNhap(),
					NhaCungCapId = dto!.NhaCungCapId,
					NguoiLapId = dto.NguoiLapId,
					NgayNhap = dto.NgayNhap ?? DateTime.Now,
					TrangThai = "ChoDuyet",
					GhiChu = dto.GhiChu
				};

				_context.PhieuNhapKhos.Add(phieu);
				await _context.SaveChangesAsync();

				foreach (var item in dto.ChiTiet)
				{
					var chiTiet = new ChiTietPhieuNhapKho
					{
						PhieuNhapKhoId = phieu.PhieuNhapKhoId,
						NguyenVatLieuId = item.NguyenVatLieuId,
						SoLuongNhap = item.SoLuongNhap,
						DonGia = item.DonGia,
						GhiChu = item.GhiChu
					};

					_context.ChiTietPhieuNhapKhos.Add(chiTiet);
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Tạo phiếu nhập kho thành công.",
					tongTien = TinhTongTien(dto.ChiTiet),
					data = new
					{
						phieu.PhieuNhapKhoId,
						phieu.MaPhieuNhap,
						phieu.NhaCungCapId,
						phieu.NguoiLapId,
						phieu.NgayNhap,
						phieu.TrangThai,
						phieu.GhiChu
					}
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi tạo phiếu nhập kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/PhieuNhapKho/1
		[HttpPut("{id}")]
		public async Task<IActionResult> CapNhatPhieuNhap(int id, [FromBody] TaoPhieuNhapKhoDto dto)
		{
			var validationError = await ValidatePhieuNhapDto(dto);
			if (validationError != null) return BadRequest(validationError);

			var phieu = await _context.PhieuNhapKhos
				.Include(x => x.ChiTietPhieuNhapKhos)
				.FirstOrDefaultAsync(x => x.PhieuNhapKhoId == id);

			if (phieu == null)
			{
				return NotFound("Không tìm thấy phiếu nhập kho.");
			}

			if (phieu.TrangThai == "DaDuyet")
			{
				return BadRequest("Phiếu đã duyệt không thể sửa.");
			}

			if (phieu.TrangThai != "ChoDuyet")
			{
				return BadRequest("Chỉ được sửa phiếu đang ở trạng thái Chờ duyệt.");
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				phieu.NhaCungCapId = dto!.NhaCungCapId;
				phieu.NguoiLapId = dto.NguoiLapId;
				phieu.NgayNhap = dto.NgayNhap ?? phieu.NgayNhap;
				phieu.GhiChu = dto.GhiChu;

				if (phieu.ChiTietPhieuNhapKhos.Any())
				{
					_context.ChiTietPhieuNhapKhos.RemoveRange(phieu.ChiTietPhieuNhapKhos);
				}

				foreach (var item in dto.ChiTiet)
				{
					_context.ChiTietPhieuNhapKhos.Add(new ChiTietPhieuNhapKho
					{
						PhieuNhapKhoId = phieu.PhieuNhapKhoId,
						NguyenVatLieuId = item.NguyenVatLieuId,
						SoLuongNhap = item.SoLuongNhap,
						DonGia = item.DonGia,
						GhiChu = item.GhiChu
					});
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Cập nhật phiếu nhập kho thành công.",
					tongTien = TinhTongTien(dto.ChiTiet)
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi cập nhật phiếu nhập kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/PhieuNhapKho/1/duyet
		[HttpPut("{id}/duyet")]
		public async Task<IActionResult> DuyetPhieuNhapKho(
			int id,
			[FromBody] DuyetPhieuNhapKhoDto dto
		)
		{
			if (dto == null || dto.NguoiDuyetId <= 0)
			{
				return BadRequest("Người duyệt không hợp lệ.");
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				var phieu = await _context.PhieuNhapKhos
					.Include(x => x.ChiTietPhieuNhapKhos)
					.FirstOrDefaultAsync(x => x.PhieuNhapKhoId == id);

				if (phieu == null)
				{
					return BadRequest("Không tìm thấy phiếu nhập kho.");
				}

				if (phieu.TrangThai == "DaDuyet")
				{
					return BadRequest("Phiếu nhập kho đã được duyệt trước đó.");
				}

				if (phieu.TrangThai == "DaHuy")
				{
					return BadRequest("Không thể duyệt phiếu đã hủy.");
				}

				if (phieu.TrangThai != "ChoDuyet")
				{
					return BadRequest("Chỉ được duyệt phiếu đang ở trạng thái Chờ duyệt.");
				}

				if (phieu.ChiTietPhieuNhapKhos == null || !phieu.ChiTietPhieuNhapKhos.Any())
				{
					return BadRequest("Phiếu nhập kho phải có ít nhất một nguyên vật liệu.");
				}

				var nguoiDuyet = await _context.NguoiDungs
					.Include(x => x.VaiTro)
					.FirstOrDefaultAsync(x => x.NguoiDungId == dto.NguoiDuyetId);

				if (nguoiDuyet == null)
				{
					return BadRequest("Người duyệt không tồn tại.");
				}

				if (NormalizeRole(nguoiDuyet.VaiTro?.TenVaiTro) != "quanlytiem")
				{
					return BadRequest("Chỉ Quản lý tiệm được duyệt phiếu nhập kho.");
				}

				foreach (var chiTiet in phieu.ChiTietPhieuNhapKhos)
				{
					if (chiTiet.SoLuongNhap <= 0)
					{
						return BadRequest(
							$"Số lượng nhập của nguyên vật liệu ID = {chiTiet.NguyenVatLieuId} không hợp lệ."
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

					var tonTruoc = nguyenVatLieu.TonHienTai;
					nguyenVatLieu.TonHienTai += chiTiet.SoLuongNhap;

					_context.LichSuTonKhos.Add(new LichSuTonKho
					{
						NguyenVatLieuId = chiTiet.NguyenVatLieuId,
						LoaiGiaoDich = "NhapKho",
						BangLienQuan = "PhieuNhapKho",
						BanGhiLienQuanId = phieu.PhieuNhapKhoId,
						SoLuongThayDoi = chiTiet.SoLuongNhap,
						TonTruoc = tonTruoc,
						TonSau = nguyenVatLieu.TonHienTai,
						NguoiThucHienId = dto.NguoiDuyetId,
						ThoiGian = DateTime.Now,
						GhiChu = $"Duyệt phiếu nhập {phieu.MaPhieuNhap}"
					});
				}

				phieu.NguoiDuyetId = dto.NguoiDuyetId;
				phieu.NgayDuyet = DateTime.Now;
				phieu.TrangThai = "DaDuyet";

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Duyệt phiếu nhập kho thành công."
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi duyệt phiếu nhập kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/PhieuNhapKho/1/tu-choi
		[HttpPut("{id}/tu-choi")]
		public async Task<IActionResult> TuChoiPhieuNhap(
			int id,
			[FromBody] TuChoiPhieuNhapKhoDto dto
		)
		{
			var phieu = await _context.PhieuNhapKhos.FindAsync(id);

			if (phieu == null)
			{
				return NotFound("Không tìm thấy phiếu nhập kho.");
			}

			if (phieu.TrangThai == "DaDuyet")
			{
				return BadRequest("Không thể từ chối phiếu đã duyệt.");
			}

			phieu.TrangThai = "DaHuy";
			phieu.GhiChu = string.IsNullOrWhiteSpace(dto?.LyDoTuChoi)
				? phieu.GhiChu
				: dto.LyDoTuChoi;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Từ chối phiếu nhập kho thành công.",
				data = phieu
			});
		}

		// DELETE: api/PhieuNhapKho/1
		[HttpDelete("{id}")]
		public async Task<IActionResult> XoaPhieuNhap(int id)
		{
			var phieu = await _context.PhieuNhapKhos
				.Include(x => x.ChiTietPhieuNhapKhos)
				.FirstOrDefaultAsync(x => x.PhieuNhapKhoId == id);

			if (phieu == null)
			{
				return NotFound("Không tìm thấy phiếu nhập kho.");
			}

			if (phieu.TrangThai == "DaDuyet")
			{
				return BadRequest("Phiếu đã duyệt không thể xóa.");
			}

			if (phieu.TrangThai != "ChoDuyet")
			{
				return BadRequest("Chỉ được xóa phiếu đang ở trạng thái Chờ duyệt.");
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				if (phieu.ChiTietPhieuNhapKhos.Any())
				{
					_context.ChiTietPhieuNhapKhos.RemoveRange(phieu.ChiTietPhieuNhapKhos);
				}

				_context.PhieuNhapKhos.Remove(phieu);

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Xóa phiếu nhập kho thành công."
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi xóa phiếu nhập kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		private static string TaoMaPhieuNhap()
		{
			return "PNK" + DateTime.Now.ToString("yyyyMMddHHmmss");
		}

		private async Task<string?> ValidatePhieuNhapDto(TaoPhieuNhapKhoDto? dto)
		{
			if (dto == null)
			{
				return "Dữ liệu phiếu nhập không hợp lệ.";
			}

			if (dto.NhaCungCapId == null || dto.NhaCungCapId <= 0)
			{
				return "Vui lòng chọn nhà cung cấp.";
			}

			if (dto.NguoiLapId <= 0)
			{
				return "Vui lòng chọn người lập phiếu.";
			}

			if (dto.NgayNhap == null)
			{
				return "Ngày nhập không được rỗng.";
			}

			var nguoiLap = await _context.NguoiDungs.FindAsync(dto.NguoiLapId);
			if (nguoiLap == null)
			{
				return "Người lập phiếu không tồn tại.";
			}

			var nhaCungCap = await _context.NhaCungCaps.FindAsync(dto.NhaCungCapId);
			if (nhaCungCap == null)
			{
				return "Nhà cung cấp không tồn tại.";
			}

			if (dto.ChiTiet == null || !dto.ChiTiet.Any())
			{
				return "Phiếu nhập phải có ít nhất một nguyên vật liệu.";
			}

			var duplicated = dto.ChiTiet
				.GroupBy(x => x.NguyenVatLieuId)
				.FirstOrDefault(g => g.Key > 0 && g.Count() > 1);

			if (duplicated != null)
			{
				return "Nguyên vật liệu bị trùng trong phiếu nhập.";
			}

			foreach (var item in dto.ChiTiet)
			{
				if (item.NguyenVatLieuId <= 0)
				{
					return "Mỗi dòng chi tiết phải có nguyên vật liệu hợp lệ.";
				}

				if (item.SoLuongNhap <= 0)
				{
					return "Số lượng nhập phải lớn hơn 0.";
				}

				if (item.DonGia < 0)
				{
					return "Đơn giá nhập không được âm.";
				}

				var nguyenVatLieu = await _context.NguyenVatLieus.FindAsync(item.NguyenVatLieuId);

				if (nguyenVatLieu == null)
				{
					return $"Nguyên vật liệu Id = {item.NguyenVatLieuId} không tồn tại.";
				}

				if (nguyenVatLieu.TrangThai == "NgungSuDung")
				{
					return $"Nguyên vật liệu {nguyenVatLieu.TenNguyenVatLieu} đã ngưng sử dụng.";
				}
			}

			return null;
		}

		private static decimal TinhTongTien(IEnumerable<TaoChiTietPhieuNhapKhoDto> chiTiet)
		{
			return chiTiet.Sum(x => x.SoLuongNhap * (x.DonGia ?? 0));
		}

		private static string NormalizeRole(string? role)
		{
			return string.Concat((role ?? "")
					.Normalize(System.Text.NormalizationForm.FormD)
					.Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark))
				.ToLower()
				.Replace(" ", "");
		}
	}

	public class TaoPhieuNhapKhoDto
	{
		public int? NhaCungCapId { get; set; }

		public int NguoiLapId { get; set; }

		public DateTime? NgayNhap { get; set; }

		public string? GhiChu { get; set; }

		public List<TaoChiTietPhieuNhapKhoDto> ChiTiet { get; set; } = new();
	}

	public class TaoChiTietPhieuNhapKhoDto
	{
		public int NguyenVatLieuId { get; set; }

		public decimal SoLuongNhap { get; set; }

		public decimal? DonGia { get; set; }

		public string? GhiChu { get; set; }
	}

	public class DuyetPhieuNhapKhoDto
	{
		public int NguoiDuyetId { get; set; }
	}

	public class TuChoiPhieuNhapKhoDto
	{
		public string? LyDoTuChoi { get; set; }
	}
}
