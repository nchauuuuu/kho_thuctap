using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class VaiTroController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public VaiTroController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		// GET: api/VaiTro
		[HttpGet]
		public async Task<ActionResult<IEnumerable<VaiTro>>> GetVaiTros()
		{
			return await _context.VaiTros
				.OrderBy(vt => vt.VaiTroId)
				.ToListAsync();
		}

		// GET: api/VaiTro/5
		[HttpGet("{id}")]
		public async Task<ActionResult<VaiTro>> GetVaiTro(int id)
		{
			var vaiTro = await _context.VaiTros.FindAsync(id);

			if (vaiTro == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy vai trò"
				});
			}

			return vaiTro;
		}

		// POST: api/VaiTro
		[HttpPost]
		public async Task<ActionResult<VaiTro>> PostVaiTro(VaiTro vaiTro)
		{
			if (string.IsNullOrWhiteSpace(vaiTro.TenVaiTro))
			{
				return BadRequest(new
				{
					message = "Tên vai trò không được để trống"
				});
			}

			var tenVaiTroDaTonTai = await _context.VaiTros
				.AnyAsync(vt => vt.TenVaiTro == vaiTro.TenVaiTro);

			if (tenVaiTroDaTonTai)
			{
				return BadRequest(new
				{
					message = "Tên vai trò đã tồn tại"
				});
			}

			_context.VaiTros.Add(vaiTro);
			await _context.SaveChangesAsync();

			return CreatedAtAction(
				nameof(GetVaiTro),
				new { id = vaiTro.VaiTroId },
				vaiTro
			);
		}

		// PUT: api/VaiTro/5
		[HttpPut("{id}")]
		public async Task<IActionResult> PutVaiTro(int id, VaiTro vaiTro)
		{
			if (id != vaiTro.VaiTroId)
			{
				return BadRequest(new
				{
					message = "Id trên URL không khớp với Id trong body"
				});
			}

			if (string.IsNullOrWhiteSpace(vaiTro.TenVaiTro))
			{
				return BadRequest(new
				{
					message = "Tên vai trò không được để trống"
				});
			}

			var vaiTroCu = await _context.VaiTros.FindAsync(id);

			if (vaiTroCu == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy vai trò để cập nhật"
				});
			}

			var tenVaiTroDaTonTai = await _context.VaiTros
				.AnyAsync(vt => vt.TenVaiTro == vaiTro.TenVaiTro && vt.VaiTroId != id);

			if (tenVaiTroDaTonTai)
			{
				return BadRequest(new
				{
					message = "Tên vai trò đã tồn tại"
				});
			}

			vaiTroCu.TenVaiTro = vaiTro.TenVaiTro;
			vaiTroCu.MoTa = vaiTro.MoTa;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Cập nhật vai trò thành công",
				data = vaiTroCu
			});
		}

		// DELETE: api/VaiTro/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteVaiTro(int id)
		{
			var vaiTro = await _context.VaiTros.FindAsync(id);

			if (vaiTro == null)
			{
				return NotFound(new
				{
					message = "Không tìm thấy vai trò để xóa"
				});
			}

			var dangDuocNguoiDungSuDung = await _context.NguoiDungs
				.AnyAsync(nd => nd.VaiTroId == id);

			if (dangDuocNguoiDungSuDung)
			{
				return BadRequest(new
				{
					message = "Không thể xóa vai trò vì đang có người dùng sử dụng"
				});
			}

			_context.VaiTros.Remove(vaiTro);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Xóa vai trò thành công"
			});
		}
	}
}