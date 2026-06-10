using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace QuanLyKhoCafe.API.Data;

public static class DevDataSeeder
{
	public static async Task SeedAsync(IServiceProvider serviceProvider)
	{
		using var scope = serviceProvider.CreateScope();
		var context = scope.ServiceProvider.GetRequiredService<QuanLyKhoCafeDbContext>();

		if (!await context.Database.CanConnectAsync())
		{
			return;
		}

		var quanLyTiem = await EnsureRoleAsync(context, "QuanLyTiem", "Quản lý tiệm");
		await EnsureRoleAsync(context, "NhanVienKho", "Nhân viên kho");
		await EnsureRoleAsync(context, "NhanVienPhaChe", "Nhân viên pha chế");

		await EnsureUserAsync(
			context,
			email: "quanly@kho.cafe",
			password: "123456",
			hoTen: "Quản lý tiệm",
			vaiTroId: quanLyTiem.VaiTroId
		);
	}

	private static async Task<VaiTro> EnsureRoleAsync(
		QuanLyKhoCafeDbContext context,
		string tenVaiTro,
		string moTa
	)
	{
		var role = await context.VaiTros.FirstOrDefaultAsync(x => x.TenVaiTro == tenVaiTro);

		if (role != null)
		{
			return role;
		}

		role = new VaiTro
		{
			TenVaiTro = tenVaiTro,
			MoTa = moTa
		};

		context.VaiTros.Add(role);
		await context.SaveChangesAsync();

		return role;
	}

	private static async Task EnsureUserAsync(
		QuanLyKhoCafeDbContext context,
		string email,
		string password,
		string hoTen,
		int vaiTroId
	)
	{
		var normalizedEmail = email.Trim().ToLower();
		var passwordHash = HashMatKhau(password);

		var user = await context.NguoiDungs
			.FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail);

		if (user == null)
		{
			context.NguoiDungs.Add(new NguoiDung
			{
				HoTen = hoTen,
				Email = email,
				MatKhauHash = passwordHash,
				SoDienThoai = null,
				VaiTroId = vaiTroId,
				TrangThai = "HoatDong",
				NgayTao = DateTime.Now
			});
		}
		else
		{
			user.MatKhauHash = passwordHash;
			user.VaiTroId = vaiTroId;
			user.TrangThai = "HoatDong";
		}

		await context.SaveChangesAsync();
	}

	private static string HashMatKhau(string matKhau)
	{
		using var sha256 = SHA256.Create();
		var bytes = Encoding.Unicode.GetBytes(matKhau);
		return Convert.ToHexString(sha256.ComputeHash(bytes));
	}
}
