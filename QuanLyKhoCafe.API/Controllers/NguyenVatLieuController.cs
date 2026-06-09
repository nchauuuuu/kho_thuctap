using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NguyenVatLieuController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public NguyenVatLieuController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/NguyenVatLieu
		[HttpGet]
		public async Task<IActionResult> LayDanhSach()
		{
			var danhSach = await _context.NguyenVatLieus
				.Include(x => x.NhomNguyenVatLieu)
				.Include(x => x.DonViTinh)
				.Select(x => new
				{
					x.NguyenVatLieuId,
					x.MaNguyenVatLieu,
					x.TenNguyenVatLieu,
					x.NhomNguyenVatLieuId,
					TenNhom = x.NhomNguyenVatLieu.TenNhom,
					x.DonViTinhId,
					TenDonVi = x.DonViTinh.TenDonVi,
					x.TonHienTai,
					x.TonToiThieu,
					x.TrangThai,
					x.GhiChu
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/NguyenVatLieu/1
		[HttpGet("{id}")]
		public async Task<IActionResult> LayTheoId(int id)
		{
			var nguyenVatLieu = await _context.NguyenVatLieus
				.Include(x => x.NhomNguyenVatLieu)
				.Include(x => x.DonViTinh)
				.Where(x => x.NguyenVatLieuId == id)
				.Select(x => new
				{
					x.NguyenVatLieuId,
					x.MaNguyenVatLieu,
					x.TenNguyenVatLieu,
					x.NhomNguyenVatLieuId,
					TenNhom = x.NhomNguyenVatLieu.TenNhom,
					x.DonViTinhId,
					TenDonVi = x.DonViTinh.TenDonVi,
					x.TonHienTai,
					x.TonToiThieu,
					x.TrangThai,
					x.GhiChu
				})
				.FirstOrDefaultAsync();

			if (nguyenVatLieu == null)
			{
				return NotFound("Không tìm thấy nguyên vật liệu.");
			}

			return Ok(nguyenVatLieu);
		}

		// POST: api/NguyenVatLieu
		[HttpPost]
		public async Task<IActionResult> ThemMoi([FromBody] TaoNguyenVatLieuDto dto)
		{
			var maDaTonTai = await _context.NguyenVatLieus
				.AnyAsync(x => x.MaNguyenVatLieu == dto.MaNguyenVatLieu);

			if (maDaTonTai)
			{
				return BadRequest("Mã nguyên vật liệu đã tồn tại.");
			}

			var nguyenVatLieu = new NguyenVatLieu
			{
				MaNguyenVatLieu = dto.MaNguyenVatLieu,
				TenNguyenVatLieu = dto.TenNguyenVatLieu,
				NhomNguyenVatLieuId = dto.NhomNguyenVatLieuId,
				DonViTinhId = dto.DonViTinhId,
				TonHienTai = dto.TonHienTai,
				TonToiThieu = dto.TonToiThieu,
				TrangThai = string.IsNullOrWhiteSpace(dto.TrangThai) ? "DangSuDung" : dto.TrangThai,
				GhiChu = dto.GhiChu
			};

			_context.NguyenVatLieus.Add(nguyenVatLieu);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Thêm nguyên vật liệu thành công.",
				data = nguyenVatLieu
			});
		}

		// PUT: api/NguyenVatLieu/1
		[HttpPut("{id}")]
		public async Task<IActionResult> CapNhat(int id, [FromBody] CapNhatNguyenVatLieuDto dto)
		{
			var nguyenVatLieu = await _context.NguyenVatLieus.FindAsync(id);

			if (nguyenVatLieu == null)
			{
				return NotFound("Không tìm thấy nguyên vật liệu.");
			}

			var maDaTonTai = await _context.NguyenVatLieus
				.AnyAsync(x => x.MaNguyenVatLieu == dto.MaNguyenVatLieu && x.NguyenVatLieuId != id);

			if (maDaTonTai)
			{
				return BadRequest("Mã nguyên vật liệu đã tồn tại.");
			}

			nguyenVatLieu.MaNguyenVatLieu = dto.MaNguyenVatLieu;
			nguyenVatLieu.TenNguyenVatLieu = dto.TenNguyenVatLieu;
			nguyenVatLieu.NhomNguyenVatLieuId = dto.NhomNguyenVatLieuId;
			nguyenVatLieu.DonViTinhId = dto.DonViTinhId;
			nguyenVatLieu.TonToiThieu = dto.TonToiThieu;
			nguyenVatLieu.TrangThai = dto.TrangThai;
			nguyenVatLieu.GhiChu = dto.GhiChu;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Cập nhật nguyên vật liệu thành công.",
				data = nguyenVatLieu
			});
		}

		// DELETE: api/NguyenVatLieu/1
		[HttpDelete("{id}")]
		public async Task<IActionResult> Xoa(int id)
		{
			var nguyenVatLieu = await _context.NguyenVatLieus.FindAsync(id);

			if (nguyenVatLieu == null)
			{
				return NotFound("Không tìm thấy nguyên vật liệu.");
			}

			// Không xóa cứng, chỉ đổi trạng thái để tránh mất lịch sử kho
			nguyenVatLieu.TrangThai = "NgungSuDung";

			await _context.SaveChangesAsync();

			return Ok("Ngưng sử dụng nguyên vật liệu thành công.");
		}
	}

	public class TaoNguyenVatLieuDto
	{
		public string MaNguyenVatLieu { get; set; } = null!;

		public string TenNguyenVatLieu { get; set; } = null!;

		public int NhomNguyenVatLieuId { get; set; }

		public int DonViTinhId { get; set; }

		public decimal TonHienTai { get; set; }

		public decimal TonToiThieu { get; set; }

		public string? TrangThai { get; set; }

		public string? GhiChu { get; set; }
	}

	public class CapNhatNguyenVatLieuDto
	{
		public string MaNguyenVatLieu { get; set; } = null!;

		public string TenNguyenVatLieu { get; set; } = null!;

		public int NhomNguyenVatLieuId { get; set; }

		public int DonViTinhId { get; set; }

		public decimal TonToiThieu { get; set; }

		public string TrangThai { get; set; } = "DangSuDung";

		public string? GhiChu { get; set; }
	}
}