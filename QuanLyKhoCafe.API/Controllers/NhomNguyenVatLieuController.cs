using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NhomNguyenVatLieuController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public NhomNguyenVatLieuController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/NhomNguyenVatLieu
		[HttpGet]
		public async Task<IActionResult> LayDanhSach()
		{
			var danhSach = await _context.NhomNguyenVatLieus
				.Select(x => new
				{
					x.NhomNguyenVatLieuId,
					x.TenNhom,
					x.MoTa
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/NhomNguyenVatLieu/1
		[HttpGet("{id}")]
		public async Task<IActionResult> LayTheoId(int id)
		{
			var nhom = await _context.NhomNguyenVatLieus.FindAsync(id);

			if (nhom == null)
			{
				return NotFound("Không tìm thấy nhóm nguyên vật liệu.");
			}

			return Ok(nhom);
		}

		// POST: api/NhomNguyenVatLieu
		[HttpPost]
		public async Task<IActionResult> ThemMoi([FromBody] TaoNhomNguyenVatLieuDto dto)
		{
			var tenDaTonTai = await _context.NhomNguyenVatLieus
				.AnyAsync(x => x.TenNhom == dto.TenNhom);

			if (tenDaTonTai)
			{
				return BadRequest("Tên nhóm nguyên vật liệu đã tồn tại.");
			}

			var nhom = new NhomNguyenVatLieu
			{
				TenNhom = dto.TenNhom,
				MoTa = dto.MoTa
			};

			_context.NhomNguyenVatLieus.Add(nhom);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Thêm nhóm nguyên vật liệu thành công.",
				data = nhom
			});
		}

		// PUT: api/NhomNguyenVatLieu/1
		[HttpPut("{id}")]
		public async Task<IActionResult> CapNhat(int id, [FromBody] TaoNhomNguyenVatLieuDto dto)
		{
			var nhom = await _context.NhomNguyenVatLieus.FindAsync(id);

			if (nhom == null)
			{
				return NotFound("Không tìm thấy nhóm nguyên vật liệu.");
			}

			var tenDaTonTai = await _context.NhomNguyenVatLieus
				.AnyAsync(x => x.TenNhom == dto.TenNhom && x.NhomNguyenVatLieuId != id);

			if (tenDaTonTai)
			{
				return BadRequest("Tên nhóm nguyên vật liệu đã tồn tại.");
			}

			nhom.TenNhom = dto.TenNhom;
			nhom.MoTa = dto.MoTa;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Cập nhật nhóm nguyên vật liệu thành công.",
				data = nhom
			});
		}

		// DELETE: api/NhomNguyenVatLieu/1
		[HttpDelete("{id}")]
		public async Task<IActionResult> Xoa(int id)
		{
			var nhom = await _context.NhomNguyenVatLieus.FindAsync(id);

			if (nhom == null)
			{
				return NotFound("Không tìm thấy nhóm nguyên vật liệu.");
			}

			var dangDuocSuDung = await _context.NguyenVatLieus
				.AnyAsync(x => x.NhomNguyenVatLieuId == id);

			if (dangDuocSuDung)
			{
				return BadRequest("Không thể xóa vì nhóm nguyên vật liệu đang được sử dụng.");
			}

			_context.NhomNguyenVatLieus.Remove(nhom);
			await _context.SaveChangesAsync();

			return Ok("Xóa nhóm nguyên vật liệu thành công.");
		}
	}

	public class TaoNhomNguyenVatLieuDto
	{
		public string TenNhom { get; set; } = null!;

		public string? MoTa { get; set; }
	}
}