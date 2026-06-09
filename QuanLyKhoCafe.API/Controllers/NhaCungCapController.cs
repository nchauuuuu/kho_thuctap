using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NhaCungCapController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public NhaCungCapController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/NhaCungCap
		[HttpGet]
		public async Task<IActionResult> LayDanhSach()
		{
			var danhSach = await _context.NhaCungCaps
				.Select(x => new
				{
					x.NhaCungCapId,
					x.TenNhaCungCap,
					x.SoDienThoai,
					x.DiaChi,
					x.NhomNguyenLieuCungCap,
					x.GhiChu,
					x.TrangThai
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/NhaCungCap/1
		[HttpGet("{id}")]
		public async Task<IActionResult> LayTheoId(int id)
		{
			var nhaCungCap = await _context.NhaCungCaps
				.Where(x => x.NhaCungCapId == id)
				.Select(x => new
				{
					x.NhaCungCapId,
					x.TenNhaCungCap,
					x.SoDienThoai,
					x.DiaChi,
					x.NhomNguyenLieuCungCap,
					x.GhiChu,
					x.TrangThai
				})
				.FirstOrDefaultAsync();

			if (nhaCungCap == null)
			{
				return NotFound("Không tìm thấy nhà cung cấp.");
			}

			return Ok(nhaCungCap);
		}

		// POST: api/NhaCungCap
		[HttpPost]
		public async Task<IActionResult> ThemMoi([FromBody] TaoNhaCungCapDto dto)
		{
			var nhaCungCap = new NhaCungCap
			{
				TenNhaCungCap = dto.TenNhaCungCap,
				SoDienThoai = dto.SoDienThoai,
				DiaChi = dto.DiaChi,
				NhomNguyenLieuCungCap = dto.NhomNguyenLieuCungCap,
				GhiChu = dto.GhiChu,
				TrangThai = string.IsNullOrWhiteSpace(dto.TrangThai) ? "DangHopTac" : dto.TrangThai
			};

			_context.NhaCungCaps.Add(nhaCungCap);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Thêm nhà cung cấp thành công.",
				data = nhaCungCap
			});
		}

		// PUT: api/NhaCungCap/1
		[HttpPut("{id}")]
		public async Task<IActionResult> CapNhat(int id, [FromBody] CapNhatNhaCungCapDto dto)
		{
			var nhaCungCap = await _context.NhaCungCaps.FindAsync(id);

			if (nhaCungCap == null)
			{
				return NotFound("Không tìm thấy nhà cung cấp.");
			}

			nhaCungCap.TenNhaCungCap = dto.TenNhaCungCap;
			nhaCungCap.SoDienThoai = dto.SoDienThoai;
			nhaCungCap.DiaChi = dto.DiaChi;
			nhaCungCap.NhomNguyenLieuCungCap = dto.NhomNguyenLieuCungCap;
			nhaCungCap.GhiChu = dto.GhiChu;
			nhaCungCap.TrangThai = dto.TrangThai;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Cập nhật nhà cung cấp thành công.",
				data = nhaCungCap
			});
		}

		// DELETE: api/NhaCungCap/1
		[HttpDelete("{id}")]
		public async Task<IActionResult> Xoa(int id)
		{
			var nhaCungCap = await _context.NhaCungCaps.FindAsync(id);

			if (nhaCungCap == null)
			{
				return NotFound("Không tìm thấy nhà cung cấp.");
			}

			// Không xóa cứng, chỉ đổi trạng thái
			nhaCungCap.TrangThai = "NgungHopTac";

			await _context.SaveChangesAsync();

			return Ok("Ngưng hợp tác nhà cung cấp thành công.");
		}
	}

	public class TaoNhaCungCapDto
	{
		public string TenNhaCungCap { get; set; } = null!;

		public string? SoDienThoai { get; set; }

		public string? DiaChi { get; set; }

		public string? NhomNguyenLieuCungCap { get; set; }

		public string? GhiChu { get; set; }

		public string? TrangThai { get; set; }
	}

	public class CapNhatNhaCungCapDto
	{
		public string TenNhaCungCap { get; set; } = null!;

		public string? SoDienThoai { get; set; }

		public string? DiaChi { get; set; }

		public string? NhomNguyenLieuCungCap { get; set; }

		public string? GhiChu { get; set; }

		public string TrangThai { get; set; } = "DangHopTac";
	}
}