using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class PhieuXuatKhoController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public PhieuXuatKhoController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/PhieuXuatKho
		[HttpGet]
		public async Task<IActionResult> LayDanhSach()
		{
			var danhSach = await _context.PhieuXuatKhos
				.Include(x => x.NguoiLap)
				.Include(x => x.NguoiDuyet)
				.Include(x => x.YeuCauXuatKho)
				.Include(x => x.ChiTietPhieuXuatKhos)
					.ThenInclude(ct => ct.NguyenVatLieu)
				.OrderByDescending(x => x.NgayXuat)
				.Select(x => new
				{
					x.PhieuXuatKhoId,
					x.MaPhieuXuat,
					x.YeuCauXuatKhoId,
					MaYeuCau = x.YeuCauXuatKho != null ? x.YeuCauXuatKho.MaYeuCau : null,
					x.NguoiLapId,
					TenNguoiLap = x.NguoiLap != null ? x.NguoiLap.HoTen : null,
					x.NguoiDuyetId,
					TenNguoiDuyet = x.NguoiDuyet != null ? x.NguoiDuyet.HoTen : null,
					x.NgayXuat,
					x.NgayDuyet,
					x.LyDoXuat,
					x.TrangThai,
					x.GhiChu,
					ChiTiet = x.ChiTietPhieuXuatKhos.Select(ct => new
					{
						ct.ChiTietPhieuXuatKhoId,
						ct.NguyenVatLieuId,
						TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
						ct.SoLuongXuat,
						ct.GhiChu
					})
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/PhieuXuatKho/1
		[HttpGet("{id}")]
		public async Task<IActionResult> LayTheoId(int id)
		{
			var phieu = await _context.PhieuXuatKhos
				.Include(x => x.NguoiLap)
				.Include(x => x.NguoiDuyet)
				.Include(x => x.YeuCauXuatKho)
				.Include(x => x.ChiTietPhieuXuatKhos)
					.ThenInclude(ct => ct.NguyenVatLieu)
				.Where(x => x.PhieuXuatKhoId == id)
				.Select(x => new
				{
					x.PhieuXuatKhoId,
					x.MaPhieuXuat,
					x.YeuCauXuatKhoId,
					MaYeuCau = x.YeuCauXuatKho != null ? x.YeuCauXuatKho.MaYeuCau : null,
					x.NguoiLapId,
					TenNguoiLap = x.NguoiLap != null ? x.NguoiLap.HoTen : null,
					x.NguoiDuyetId,
					TenNguoiDuyet = x.NguoiDuyet != null ? x.NguoiDuyet.HoTen : null,
					x.NgayXuat,
					x.NgayDuyet,
					x.LyDoXuat,
					x.TrangThai,
					x.GhiChu,
					ChiTiet = x.ChiTietPhieuXuatKhos.Select(ct => new
					{
						ct.ChiTietPhieuXuatKhoId,
						ct.NguyenVatLieuId,
						TenNguyenVatLieu = ct.NguyenVatLieu != null ? ct.NguyenVatLieu.TenNguyenVatLieu : null,
						ct.SoLuongXuat,
						ct.GhiChu
					})
				})
				.FirstOrDefaultAsync();

			if (phieu == null)
			{
				return NotFound("Không tìm thấy phiếu xuất kho.");
			}

			return Ok(phieu);
		}

		// POST: api/PhieuXuatKho
		[HttpPost]
		public async Task<IActionResult> TaoPhieuXuat([FromBody] TaoPhieuXuatKhoDto dto)
		{
			if (dto == null)
			{
				return BadRequest("Dữ liệu phiếu xuất kho không hợp lệ.");
			}

			if (dto.NguoiLapId <= 0)
			{
				return BadRequest("Người lập phiếu không hợp lệ.");
			}

			var nguoiLap = await _context.NguoiDungs.FindAsync(dto.NguoiLapId);

			if (nguoiLap == null)
			{
				return BadRequest("Người lập phiếu không tồn tại.");
			}

			List<TaoChiTietPhieuXuatKhoDto> danhSachChiTiet =
				dto.ChiTiet ?? new List<TaoChiTietPhieuXuatKhoDto>();

			if (dto.YeuCauXuatKhoId != null && dto.YeuCauXuatKhoId > 0 && !danhSachChiTiet.Any())
			{
				var yeuCau = await _context.YeuCauXuatKhos
					.Include(x => x.ChiTietYeuCauXuatKhos)
					.FirstOrDefaultAsync(x => x.YeuCauXuatKhoId == dto.YeuCauXuatKhoId);

				if (yeuCau == null)
				{
					return BadRequest("Yêu cầu xuất kho không tồn tại.");
				}

				if (yeuCau.TrangThai != "ChoXuLy")
				{
					return BadRequest("Chỉ có thể lập phiếu từ yêu cầu đang chờ xử lý.");
				}

				danhSachChiTiet = yeuCau.ChiTietYeuCauXuatKhos
					.Select(x => new TaoChiTietPhieuXuatKhoDto
					{
						NguyenVatLieuId = x.NguyenVatLieuId,
						SoLuongXuat = x.SoLuongYeuCau,
						GhiChu = x.GhiChu
					})
					.ToList();
			}

			if (!danhSachChiTiet.Any())
			{
				return BadRequest("Phiếu xuất kho phải có ít nhất một nguyên vật liệu.");
			}

			foreach (var item in danhSachChiTiet)
			{
				if (item.NguyenVatLieuId <= 0)
				{
					return BadRequest("Nguyên vật liệu không hợp lệ.");
				}

				if (item.SoLuongXuat <= 0)
				{
					return BadRequest("Số lượng xuất phải lớn hơn 0.");
				}

				var nguyenVatLieu = await _context.NguyenVatLieus.FindAsync(item.NguyenVatLieuId);

				if (nguyenVatLieu == null)
				{
					return BadRequest($"Nguyên vật liệu Id = {item.NguyenVatLieuId} không tồn tại.");
				}

				if (nguyenVatLieu.TrangThai == "NgungSuDung")
				{
					return BadRequest($"Nguyên vật liệu {nguyenVatLieu.TenNguyenVatLieu} đã ngưng sử dụng.");
				}
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				var phieu = new PhieuXuatKho
				{
					MaPhieuXuat = TaoMaPhieuXuat(),
					YeuCauXuatKhoId = dto.YeuCauXuatKhoId,
					NguoiLapId = dto.NguoiLapId,
					NgayXuat = DateTime.Now,
					LyDoXuat = string.IsNullOrWhiteSpace(dto.LyDoXuat) ? "XuatPhaChe" : dto.LyDoXuat,
					TrangThai = "ChoDuyet",
					GhiChu = dto.GhiChu
				};

				_context.PhieuXuatKhos.Add(phieu);
				await _context.SaveChangesAsync();

				foreach (var item in danhSachChiTiet)
				{
					var chiTiet = new ChiTietPhieuXuatKho
					{
						PhieuXuatKhoId = phieu.PhieuXuatKhoId,
						NguyenVatLieuId = item.NguyenVatLieuId,
						SoLuongXuat = item.SoLuongXuat,
						GhiChu = item.GhiChu
					};

					_context.ChiTietPhieuXuatKhos.Add(chiTiet);
				}

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Tạo phiếu xuất kho thành công.",
					data = new
					{
						phieu.PhieuXuatKhoId,
						phieu.MaPhieuXuat,
						phieu.YeuCauXuatKhoId,
						phieu.NguoiLapId,
						phieu.NgayXuat,
						phieu.LyDoXuat,
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
					message = "Có lỗi xảy ra khi tạo phiếu xuất kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/PhieuXuatKho/1/duyet
		[HttpPut("{id}/duyet")]
		public async Task<IActionResult> DuyetPhieuXuat(int id, [FromBody] DuyetPhieuXuatKhoDto dto)
		{
			if (dto == null || dto.NguoiDuyetId <= 0)
			{
				return BadRequest("Người duyệt không hợp lệ.");
			}

			var phieu = await _context.PhieuXuatKhos
				.Include(x => x.ChiTietPhieuXuatKhos)
				.FirstOrDefaultAsync(x => x.PhieuXuatKhoId == id);

			if (phieu == null)
			{
				return NotFound("Không tìm thấy phiếu xuất kho.");
			}

			if (phieu.TrangThai == "DaDuyet")
			{
				return BadRequest("Phiếu xuất kho đã được duyệt trước đó.");
			}

			if (phieu.TrangThai == "TuChoi")
			{
				return BadRequest("Không thể duyệt phiếu đã bị từ chối.");
			}

			if (phieu.TrangThai != "ChoDuyet")
			{
				return BadRequest("Chỉ có thể duyệt phiếu xuất kho đang ở trạng thái Chờ duyệt.");
			}

			var nguoiDuyet = await _context.NguoiDungs.FindAsync(dto.NguoiDuyetId);

			if (nguoiDuyet == null)
			{
				return BadRequest("Người duyệt không tồn tại.");
			}

			if (!phieu.ChiTietPhieuXuatKhos.Any())
			{
				return BadRequest("Phiếu xuất kho chưa có chi tiết nguyên vật liệu.");
			}

			using var transaction = await _context.Database.BeginTransactionAsync();

			try
			{
				foreach (var chiTiet in phieu.ChiTietPhieuXuatKhos)
				{
					var nguyenVatLieu = await _context.NguyenVatLieus
						.FirstOrDefaultAsync(x => x.NguyenVatLieuId == chiTiet.NguyenVatLieuId);

					if (nguyenVatLieu == null)
					{
						await transaction.RollbackAsync();
						return BadRequest($"Nguyên vật liệu Id = {chiTiet.NguyenVatLieuId} không tồn tại.");
					}

					if (nguyenVatLieu.TonHienTai < chiTiet.SoLuongXuat)
					{
						await transaction.RollbackAsync();
						return BadRequest($"Tồn kho của {nguyenVatLieu.TenNguyenVatLieu} không đủ để xuất.");
					}

					var tonTruoc = nguyenVatLieu.TonHienTai;
					var tonSau = tonTruoc - chiTiet.SoLuongXuat;

					nguyenVatLieu.TonHienTai = tonSau;

					var lichSu = new LichSuTonKho
					{
						NguyenVatLieuId = nguyenVatLieu.NguyenVatLieuId,

						// DB không nhận "XuatKho", nên dùng "Xuat"
						LoaiGiaoDich = "Xuat",

						BangLienQuan = "PhieuXuatKho",
						BanGhiLienQuanId = phieu.PhieuXuatKhoId,
						SoLuongThayDoi = -chiTiet.SoLuongXuat,
						TonTruoc = tonTruoc,
						TonSau = tonSau,
						NguoiThucHienId = dto.NguoiDuyetId,
						ThoiGian = DateTime.Now,
						GhiChu = $"Duyệt phiếu xuất {phieu.MaPhieuXuat}"
					};

					_context.LichSuTonKhos.Add(lichSu);
				}

				phieu.TrangThai = "DaDuyet";
				phieu.NguoiDuyetId = dto.NguoiDuyetId;
				phieu.NgayDuyet = DateTime.Now;

				// Không cập nhật YeuCauXuatKho.TrangThai tại đây
				// để tránh lỗi CHECK constraint CK_YeuCauXuatKho_TrangThai.

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return Ok(new
				{
					message = "Duyệt phiếu xuất kho thành công. Tồn kho đã được trừ.",
					data = new
					{
						phieu.PhieuXuatKhoId,
						phieu.MaPhieuXuat,
						phieu.TrangThai,
						phieu.NguoiDuyetId,
						phieu.NgayDuyet
					}
				});
			}
			catch (Exception ex)
			{
				await transaction.RollbackAsync();

				return BadRequest(new
				{
					message = "Có lỗi xảy ra khi duyệt phiếu xuất kho.",
					error = ex.Message,
					innerError = ex.InnerException?.Message
				});
			}
		}

		// PUT: api/PhieuXuatKho/1/tu-choi
		[HttpPut("{id}/tu-choi")]
		public async Task<IActionResult> TuChoiPhieuXuat(int id, [FromBody] TuChoiPhieuXuatKhoDto dto)
		{
			var phieu = await _context.PhieuXuatKhos.FindAsync(id);

			if (phieu == null)
			{
				return NotFound("Không tìm thấy phiếu xuất kho.");
			}

			if (phieu.TrangThai == "DaDuyet")
			{
				return BadRequest("Không thể từ chối phiếu đã duyệt.");
			}

			if (phieu.TrangThai == "TuChoi")
			{
				return BadRequest("Phiếu xuất kho đã bị từ chối trước đó.");
			}

			phieu.TrangThai = "TuChoi";
			phieu.GhiChu = dto == null || string.IsNullOrWhiteSpace(dto.LyDoTuChoi)
				? phieu.GhiChu
				: dto.LyDoTuChoi;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Từ chối phiếu xuất kho thành công.",
				data = new
				{
					phieu.PhieuXuatKhoId,
					phieu.MaPhieuXuat,
					phieu.TrangThai,
					phieu.GhiChu
				}
			});
		}

		private static string TaoMaPhieuXuat()
		{
			return "PXK" + DateTime.Now.ToString("yyyyMMddHHmmss");
		}
	}

	public class TaoPhieuXuatKhoDto
	{
		public int? YeuCauXuatKhoId { get; set; }

		public int NguoiLapId { get; set; }

		public string? LyDoXuat { get; set; }

		public string? GhiChu { get; set; }

		public List<TaoChiTietPhieuXuatKhoDto> ChiTiet { get; set; } = new();
	}

	public class TaoChiTietPhieuXuatKhoDto
	{
		public int NguyenVatLieuId { get; set; }

		public decimal SoLuongXuat { get; set; }

		public string? GhiChu { get; set; }
	}

	public class DuyetPhieuXuatKhoDto
	{
		public int NguoiDuyetId { get; set; }
	}

	public class TuChoiPhieuXuatKhoDto
	{
		public string? LyDoTuChoi { get; set; }
	}
}