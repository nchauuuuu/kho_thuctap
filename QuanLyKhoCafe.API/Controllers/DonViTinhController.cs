using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class DonViTinhController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public DonViTinhController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/DonViTinh
		[HttpGet]
		public async Task<IActionResult> LayDanhSach()
		{
			var danhSach = await _context.DonViTinhs
				.Select(x => new
				{
					x.DonViTinhId,
					x.TenDonVi
				})
				.ToListAsync();

			return Ok(danhSach);
		}

		// GET: api/DonViTinh/1
		[HttpGet("{id}")]
		public async Task<IActionResult> LayTheoId(int id)
		{
			var donViTinh = await _context.DonViTinhs.FindAsync(id);

			if (donViTinh == null)
			{
				return NotFound("Không tìm thấy đơn vị tính.");
			}

			return Ok(donViTinh);
		}

		// POST: api/DonViTinh
		[HttpPost]
		public async Task<IActionResult> ThemMoi([FromBody] TaoDonViTinhDto dto)
		{
			var tenDaTonTai = await _context.DonViTinhs
				.AnyAsync(x => x.TenDonVi == dto.TenDonVi);

			if (tenDaTonTai)
			{
				return BadRequest("Tên đơn vị tính đã tồn tại.");
			}

			var donViTinh = new DonViTinh
			{
				TenDonVi = dto.TenDonVi
			};

			_context.DonViTinhs.Add(donViTinh);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Thêm đơn vị tính thành công.",
				data = donViTinh
			});
		}

		// PUT: api/DonViTinh/1
		[HttpPut("{id}")]
		public async Task<IActionResult> CapNhat(int id, [FromBody] TaoDonViTinhDto dto)
		{
			var donViTinh = await _context.DonViTinhs.FindAsync(id);

			if (donViTinh == null)
			{
				return NotFound("Không tìm thấy đơn vị tính.");
			}

			var tenDaTonTai = await _context.DonViTinhs
				.AnyAsync(x => x.TenDonVi == dto.TenDonVi && x.DonViTinhId != id);

			if (tenDaTonTai)
			{
				return BadRequest("Tên đơn vị tính đã tồn tại.");
			}

			donViTinh.TenDonVi = dto.TenDonVi;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Cập nhật đơn vị tính thành công.",
				data = donViTinh
			});
		}

		// DELETE: api/DonViTinh/1
		[HttpDelete("{id}")]
		public async Task<IActionResult> Xoa(int id)
		{
			var donViTinh = await _context.DonViTinhs.FindAsync(id);

			if (donViTinh == null)
			{
				return NotFound("Không tìm thấy đơn vị tính.");
			}

			var dangDuocSuDung = await _context.NguyenVatLieus
				.AnyAsync(x => x.DonViTinhId == id);

			if (dangDuocSuDung)
			{
				return BadRequest("Không thể xóa vì đơn vị tính đang được sử dụng.");
			}

			_context.DonViTinhs.Remove(donViTinh);
			await _context.SaveChangesAsync();

			return Ok("Xóa đơn vị tính thành công.");
		}
	}

	public class TaoDonViTinhDto
	{
		public string TenDonVi { get; set; } = null!;
	}
}