using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace QuanLyKhoCafe.API.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class NguoiDungController : ControllerBase
	{
		private readonly QuanLyKhoCafeDbContext _context;

		public NguoiDungController(QuanLyKhoCafeDbContext context)
		{
			_context = context;
		}

		private static string HashMatKhau(string matKhau)
		{
			using var sha256 = SHA256.Create();

			// Dùng Encoding.Unicode để khớp với SQL: HASHBYTES('SHA2_256', N'123456')
			var bytes = Encoding.Unicode.GetBytes(matKhau);
			var hashBytes = sha256.ComputeHash(bytes);

			return Convert.ToHexString(hashBytes);
		}

		private static string HashMatKhauUtf8(string matKhau)
		{
			using var sha256 = SHA256.Create();
			var bytes = Encoding.UTF8.GetBytes(matKhau);
			return Convert.ToHexString(sha256.ComputeHash(bytes));
		}

		private static bool KiemTraMatKhau(string matKhauNhap, string matKhauLuu)
		{
			var stored = (matKhauLuu ?? "").Trim();

			return string.Equals(stored, HashMatKhau(matKhauNhap), StringComparison.OrdinalIgnoreCase)
				|| string.Equals(stored, HashMatKhauUtf8(matKhauNhap), StringComparison.OrdinalIgnoreCase)
				|| string.Equals(stored, matKhauNhap, StringComparison.Ordinal);
		}

		// POST: api/NguoiDung/dang-nhap
		[HttpPost("dang-nhap")]
		public async Task<IActionResult> DangNhap([FromBody] DangNhapDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Email))
			{
				return BadRequest(new { message = "Email không được để trống." });
			}

			if (string.IsNullOrWhiteSpace(dto.MatKhau))
			{
				return BadRequest(new { message = "Mật khẩu không được để trống." });
			}

			var email = dto.Email.Trim().ToLower();
			var matKhau = dto.MatKhau.Trim();

			var nguoiDung = await _context.NguoiDungs
				.Include(x => x.VaiTro)
				.AsNoTracking()
				.FirstOrDefaultAsync(x => x.Email.ToLower() == email);

			if (nguoiDung == null)
			{
				return BadRequest(new { message = "Email hoặc mật khẩu không đúng." });
			}

			if (!KiemTraMatKhau(matKhau, nguoiDung.MatKhauHash))
			{
				return BadRequest(new { message = "Email hoặc mật khẩu không đúng." });
			}

			if (nguoiDung.TrangThai == "Khoa")
			{
				return BadRequest(new { message = "Tài khoản đã bị khóa." });
			}

			return Ok(new DangNhapResponseDto
			{
				NguoiDungId = nguoiDung.NguoiDungId,
				HoTen = nguoiDung.HoTen,
				Email = nguoiDung.Email,
				SoDienThoai = nguoiDung.SoDienThoai,
				VaiTroId = nguoiDung.VaiTroId,
				TenVaiTro = nguoiDung.VaiTro.TenVaiTro,
				TrangThai = nguoiDung.TrangThai
			});
		}

		// GET: api/NguoiDung
		[HttpGet]
		public async Task<ActionResult<IEnumerable<NguoiDungResponseDto>>> GetNguoiDungs()
		{
			var data = await _context.NguoiDungs
				.AsNoTracking()
				.OrderByDescending(x => x.NguoiDungId)
				.Select(x => new NguoiDungResponseDto
				{
					NguoiDungId = x.NguoiDungId,
					HoTen = x.HoTen,
					Email = x.Email,
					SoDienThoai = x.SoDienThoai,
					VaiTroId = x.VaiTroId,
					TenVaiTro = x.VaiTro.TenVaiTro,
					TrangThai = x.TrangThai,
					NgayTao = x.NgayTao
				})
				.ToListAsync();

			return Ok(data);
		}

		// GET: api/NguoiDung/5
		[HttpGet("{id}")]
		public async Task<ActionResult<NguoiDungResponseDto>> GetNguoiDung(int id)
		{
			var nguoiDung = await _context.NguoiDungs
				.AsNoTracking()
				.Where(x => x.NguoiDungId == id)
				.Select(x => new NguoiDungResponseDto
				{
					NguoiDungId = x.NguoiDungId,
					HoTen = x.HoTen,
					Email = x.Email,
					SoDienThoai = x.SoDienThoai,
					VaiTroId = x.VaiTroId,
					TenVaiTro = x.VaiTro.TenVaiTro,
					TrangThai = x.TrangThai,
					NgayTao = x.NgayTao
				})
				.FirstOrDefaultAsync();

			if (nguoiDung == null)
			{
				return NotFound("Không tìm thấy người dùng.");
			}

			return Ok(nguoiDung);
		}

		// POST: api/NguoiDung
		[HttpPost]
		public async Task<ActionResult<NguoiDungResponseDto>> CreateNguoiDung([FromBody] NguoiDungCreateDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.HoTen))
			{
				return BadRequest("Họ tên không được để trống.");
			}

			if (string.IsNullOrWhiteSpace(dto.Email))
			{
				return BadRequest("Email không được để trống.");
			}

			if (string.IsNullOrWhiteSpace(dto.MatKhau))
			{
				return BadRequest("Mật khẩu không được để trống.");
			}

			if (dto.VaiTroId <= 0)
			{
				return BadRequest("Vai trò không hợp lệ.");
			}

			var vaiTro = await _context.VaiTros
				.FirstOrDefaultAsync(x => x.VaiTroId == dto.VaiTroId);

			if (vaiTro == null)
			{
				return BadRequest("Vai trò không tồn tại.");
			}

			var email = dto.Email.Trim().ToLower();

			var emailTonTai = await _context.NguoiDungs
				.AnyAsync(x => x.Email.ToLower() == email);

			if (emailTonTai)
			{
				return BadRequest("Email đã tồn tại.");
			}

			var nguoiDung = new NguoiDung
			{
				HoTen = dto.HoTen.Trim(),
				Email = dto.Email.Trim(),
				MatKhauHash = HashMatKhau(dto.MatKhau.Trim()),
				SoDienThoai = string.IsNullOrWhiteSpace(dto.SoDienThoai) ? null : dto.SoDienThoai.Trim(),
				VaiTroId = dto.VaiTroId,
				TrangThai = string.IsNullOrWhiteSpace(dto.TrangThai) ? "HoatDong" : dto.TrangThai.Trim(),
				NgayTao = DateTime.Now
			};

			_context.NguoiDungs.Add(nguoiDung);
			await _context.SaveChangesAsync();

			var result = new NguoiDungResponseDto
			{
				NguoiDungId = nguoiDung.NguoiDungId,
				HoTen = nguoiDung.HoTen,
				Email = nguoiDung.Email,
				SoDienThoai = nguoiDung.SoDienThoai,
				VaiTroId = nguoiDung.VaiTroId,
				TenVaiTro = vaiTro.TenVaiTro,
				TrangThai = nguoiDung.TrangThai,
				NgayTao = nguoiDung.NgayTao
			};

			return CreatedAtAction(nameof(GetNguoiDung), new { id = nguoiDung.NguoiDungId }, result);
		}

		// PUT: api/NguoiDung/5
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateNguoiDung(int id, [FromBody] NguoiDungUpdateDto dto)
		{
			var nguoiDung = await _context.NguoiDungs.FindAsync(id);

			if (nguoiDung == null)
			{
				return NotFound("Không tìm thấy người dùng.");
			}

			if (string.IsNullOrWhiteSpace(dto.HoTen))
			{
				return BadRequest("Họ tên không được để trống.");
			}

			if (string.IsNullOrWhiteSpace(dto.Email))
			{
				return BadRequest("Email không được để trống.");
			}

			if (dto.VaiTroId <= 0)
			{
				return BadRequest("Vai trò không hợp lệ.");
			}

			var vaiTroTonTai = await _context.VaiTros
				.AnyAsync(x => x.VaiTroId == dto.VaiTroId);

			if (!vaiTroTonTai)
			{
				return BadRequest("Vai trò không tồn tại.");
			}

			var email = dto.Email.Trim().ToLower();

			var emailTonTai = await _context.NguoiDungs
				.AnyAsync(x => x.NguoiDungId != id && x.Email.ToLower() == email);

			if (emailTonTai)
			{
				return BadRequest("Email đã tồn tại.");
			}

			nguoiDung.HoTen = dto.HoTen.Trim();
			nguoiDung.Email = dto.Email.Trim();
			nguoiDung.SoDienThoai = string.IsNullOrWhiteSpace(dto.SoDienThoai) ? null : dto.SoDienThoai.Trim();
			nguoiDung.VaiTroId = dto.VaiTroId;

			if (!string.IsNullOrWhiteSpace(dto.TrangThai))
			{
				nguoiDung.TrangThai = dto.TrangThai.Trim();
			}

			if (!string.IsNullOrWhiteSpace(dto.MatKhau))
			{
				nguoiDung.MatKhauHash = HashMatKhau(dto.MatKhau.Trim());
			}

			await _context.SaveChangesAsync();

			return Ok("Cập nhật người dùng thành công.");
		}

		// DELETE: api/NguoiDung/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteNguoiDung(int id)
		{
			var nguoiDung = await _context.NguoiDungs.FindAsync(id);

			if (nguoiDung == null)
			{
				return NotFound("Không tìm thấy người dùng.");
			}

			try
			{
				_context.NguoiDungs.Remove(nguoiDung);
				await _context.SaveChangesAsync();

				return Ok("Xóa người dùng thành công.");
			}
			catch (DbUpdateException)
			{
				return BadRequest("Không thể xóa người dùng vì người dùng này đã phát sinh dữ liệu trong hệ thống.");
			}
		}
	}

	public class DangNhapDto
	{
		public string Email { get; set; } = null!;

		public string MatKhau { get; set; } = null!;
	}

	public class DangNhapResponseDto
	{
		public int NguoiDungId { get; set; }

		public string HoTen { get; set; } = null!;

		public string Email { get; set; } = null!;

		public string? SoDienThoai { get; set; }

		public int VaiTroId { get; set; }

		public string TenVaiTro { get; set; } = null!;

		public string TrangThai { get; set; } = null!;
	}

	public class NguoiDungCreateDto
	{
		public string HoTen { get; set; } = null!;

		public string Email { get; set; } = null!;

		public string MatKhau { get; set; } = null!;

		public string? SoDienThoai { get; set; }

		public int VaiTroId { get; set; }

		public string? TrangThai { get; set; } = "HoatDong";
	}

	public class NguoiDungUpdateDto
	{
		public string HoTen { get; set; } = null!;

		public string Email { get; set; } = null!;

		public string? MatKhau { get; set; }

		public string? SoDienThoai { get; set; }

		public int VaiTroId { get; set; }

		public string? TrangThai { get; set; }
	}

	public class NguoiDungResponseDto
	{
		public int NguoiDungId { get; set; }

		public string HoTen { get; set; } = null!;

		public string Email { get; set; } = null!;

		public string? SoDienThoai { get; set; }

		public int VaiTroId { get; set; }

		public string? TenVaiTro { get; set; }

		public string TrangThai { get; set; } = null!;

		public DateTime NgayTao { get; set; }
	}
}
