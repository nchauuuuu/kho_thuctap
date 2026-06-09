using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Models;

namespace QuanLyKhoCafe.API.Data;

public partial class QuanLyKhoCafeDbContext : DbContext
{
	public QuanLyKhoCafeDbContext()
	{
	}

	public QuanLyKhoCafeDbContext(DbContextOptions<QuanLyKhoCafeDbContext> options)
		: base(options)
	{
	}

	public virtual DbSet<ChiTietPhieuKiemKeKho> ChiTietPhieuKiemKeKhos { get; set; }

	public virtual DbSet<ChiTietPhieuNhapKho> ChiTietPhieuNhapKhos { get; set; }

	public virtual DbSet<ChiTietPhieuXuatKho> ChiTietPhieuXuatKhos { get; set; }

	public virtual DbSet<ChiTietYeuCauXuatKho> ChiTietYeuCauXuatKhos { get; set; }

	public virtual DbSet<DonViTinh> DonViTinhs { get; set; }

	public virtual DbSet<LichSuTonKho> LichSuTonKhos { get; set; }

	public virtual DbSet<NguoiDung> NguoiDungs { get; set; }

	public virtual DbSet<NguyenVatLieu> NguyenVatLieus { get; set; }

	public virtual DbSet<NhaCungCap> NhaCungCaps { get; set; }

	public virtual DbSet<NhomNguyenVatLieu> NhomNguyenVatLieus { get; set; }

	public virtual DbSet<PhieuKiemKeKho> PhieuKiemKeKhos { get; set; }

	public virtual DbSet<PhieuNhapKho> PhieuNhapKhos { get; set; }

	public virtual DbSet<PhieuXuatKho> PhieuXuatKhos { get; set; }

	public virtual DbSet<VaiTro> VaiTros { get; set; }

	public virtual DbSet<VwCanhBaoTonKho> VwCanhBaoTonKhos { get; set; }

	public virtual DbSet<YeuCauXuatKho> YeuCauXuatKhos { get; set; }

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.Entity<ChiTietPhieuKiemKeKho>(entity =>
		{
			entity.HasKey(e => e.ChiTietPhieuKiemKeKhoId).HasName("PK__ChiTietP__BB64F3AFF5F251EB");

			entity.Property(e => e.ChenhLech).HasComputedColumnSql("([SoLuongThucTe]-[SoLuongHeThong])", true);

			entity.HasOne(d => d.NguyenVatLieu).WithMany(p => p.ChiTietPhieuKiemKeKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietPhieuKiemKeKho_NguyenVatLieu");

			entity.HasOne(d => d.PhieuKiemKeKho).WithMany(p => p.ChiTietPhieuKiemKeKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietPhieuKiemKeKho_PhieuKiemKeKho");
		});

		modelBuilder.Entity<ChiTietPhieuNhapKho>(entity =>
		{
			entity.HasKey(e => e.ChiTietPhieuNhapKhoId).HasName("PK__ChiTietP__320416E80A4CBC60");

			entity.HasOne(d => d.NguyenVatLieu).WithMany(p => p.ChiTietPhieuNhapKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietPhieuNhapKho_NguyenVatLieu");

			entity.HasOne(d => d.PhieuNhapKho).WithMany(p => p.ChiTietPhieuNhapKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietPhieuNhapKho_PhieuNhapKho");
		});

		modelBuilder.Entity<ChiTietPhieuXuatKho>(entity =>
		{
			entity.HasKey(e => e.ChiTietPhieuXuatKhoId).HasName("PK__ChiTietP__18FB01880871FA24");

			entity.HasOne(d => d.NguyenVatLieu).WithMany(p => p.ChiTietPhieuXuatKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietPhieuXuatKho_NguyenVatLieu");

			entity.HasOne(d => d.PhieuXuatKho).WithMany(p => p.ChiTietPhieuXuatKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietPhieuXuatKho_PhieuXuatKho");
		});

		modelBuilder.Entity<ChiTietYeuCauXuatKho>(entity =>
		{
			entity.HasKey(e => e.ChiTietYeuCauXuatKhoId).HasName("PK__ChiTietY__DA4DE678AB5CF0E3");

			entity.HasOne(d => d.NguyenVatLieu).WithMany(p => p.ChiTietYeuCauXuatKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietYeuCauXuatKho_NguyenVatLieu");

			entity.HasOne(d => d.YeuCauXuatKho).WithMany(p => p.ChiTietYeuCauXuatKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_ChiTietYeuCauXuatKho_YeuCauXuatKho");
		});

		modelBuilder.Entity<DonViTinh>(entity =>
		{
			entity.HasKey(e => e.DonViTinhId).HasName("PK__DonViTin__2B93D40E3DFF12D8");
		});

		modelBuilder.Entity<LichSuTonKho>(entity =>
		{
			entity.HasKey(e => e.LichSuTonKhoId).HasName("PK__LichSuTo__62073DF585321E2E");

			entity.Property(e => e.ThoiGian).HasDefaultValueSql("(sysdatetime())");

			entity.HasOne(d => d.NguoiThucHien).WithMany(p => p.LichSuTonKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_LichSuTonKho_NguoiDung");

			entity.HasOne(d => d.NguyenVatLieu).WithMany(p => p.LichSuTonKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_LichSuTonKho_NguyenVatLieu");
		});

		modelBuilder.Entity<NguoiDung>(entity =>
		{
			entity.HasKey(e => e.NguoiDungId).HasName("PK__NguoiDun__C4BBA4BDA0950D3E");

			entity.Property(e => e.NgayTao).HasDefaultValueSql("(sysdatetime())");
			entity.Property(e => e.TrangThai).HasDefaultValue("HoatDong");

			entity.HasOne(d => d.VaiTro).WithMany(p => p.NguoiDungs)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_NguoiDung_VaiTro");
		});

		modelBuilder.Entity<NguyenVatLieu>(entity =>
		{
			entity.HasKey(e => e.NguyenVatLieuId).HasName("PK__NguyenVa__7FC15EF60A53D06D");

			entity.Property(e => e.TrangThai).HasDefaultValue("DangSuDung");

			entity.HasOne(d => d.DonViTinh).WithMany(p => p.NguyenVatLieus)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_NguyenVatLieu_DonViTinh");

			entity.HasOne(d => d.NhomNguyenVatLieu).WithMany(p => p.NguyenVatLieus)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_NguyenVatLieu_NhomNguyenVatLieu");
		});

		modelBuilder.Entity<NhaCungCap>(entity =>
		{
			entity.HasKey(e => e.NhaCungCapId).HasName("PK__NhaCungC__8B891747E2A8F4AC");

			entity.Property(e => e.TrangThai).HasDefaultValue("DangHopTac");
		});

		modelBuilder.Entity<NhomNguyenVatLieu>(entity =>
		{
			entity.HasKey(e => e.NhomNguyenVatLieuId).HasName("PK__NhomNguy__1F445FA84BD77BA2");
		});

		modelBuilder.Entity<PhieuKiemKeKho>(entity =>
		{
			entity.HasKey(e => e.PhieuKiemKeKhoId).HasName("PK__PhieuKie__303A35C75929996E");

			entity.Property(e => e.NgayKiemKe).HasDefaultValueSql("(sysdatetime())");
			entity.Property(e => e.TrangThai).HasDefaultValue("ChoXacNhan");

			entity.HasOne(d => d.NguoiKiemKe).WithMany(p => p.PhieuKiemKeKhoNguoiKiemKes)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_PhieuKiemKeKho_NguoiKiemKe");

			entity.HasOne(d => d.NguoiXacNhan).WithMany(p => p.PhieuKiemKeKhoNguoiXacNhans)
				.HasConstraintName("FK_PhieuKiemKeKho_NguoiXacNhan");
		});

		modelBuilder.Entity<PhieuNhapKho>(entity =>
		{
			entity.HasKey(e => e.PhieuNhapKhoId).HasName("PK__PhieuNha__F08B404C896BF0E2");

			entity.Property(e => e.NgayNhap).HasDefaultValueSql("(sysdatetime())");
			entity.Property(e => e.TrangThai).HasDefaultValue("Nhap");

			entity.HasOne(d => d.NguoiDuyet).WithMany(p => p.PhieuNhapKhoNguoiDuyets)
				.HasConstraintName("FK_PhieuNhapKho_NguoiDuyet");

			entity.HasOne(d => d.NguoiLap).WithMany(p => p.PhieuNhapKhoNguoiLaps)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_PhieuNhapKho_NguoiLap");

			entity.HasOne(d => d.NhaCungCap).WithMany(p => p.PhieuNhapKhos)
				.HasConstraintName("FK_PhieuNhapKho_NhaCungCap");
		});

		modelBuilder.Entity<PhieuXuatKho>(entity =>
		{
			entity.HasKey(e => e.PhieuXuatKhoId).HasName("PK__PhieuXua__3041C2F222DCF694");

			entity.Property(e => e.LyDoXuat).HasDefaultValue("XuatPhaChe");
			entity.Property(e => e.NgayXuat).HasDefaultValueSql("(sysdatetime())");
			entity.Property(e => e.TrangThai).HasDefaultValue("Nhap");

			entity.HasOne(d => d.NguoiDuyet).WithMany(p => p.PhieuXuatKhoNguoiDuyets)
				.HasConstraintName("FK_PhieuXuatKho_NguoiDuyet");

			entity.HasOne(d => d.NguoiLap).WithMany(p => p.PhieuXuatKhoNguoiLaps)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_PhieuXuatKho_NguoiLap");

			entity.HasOne(d => d.YeuCauXuatKho).WithMany(p => p.PhieuXuatKhos)
				.HasConstraintName("FK_PhieuXuatKho_YeuCauXuatKho");
		});

		modelBuilder.Entity<VaiTro>(entity =>
		{
			entity.HasKey(e => e.VaiTroId).HasName("PK__VaiTro__4775811608524410");
		});

		modelBuilder.Entity<VwCanhBaoTonKho>(entity =>
		{
			entity.ToView("vw_CanhBaoTonKho");
		});

		modelBuilder.Entity<YeuCauXuatKho>(entity =>
		{
			entity.HasKey(e => e.YeuCauXuatKhoId).HasName("PK__YeuCauXu__85195DDCBD966F13");

			entity.Property(e => e.NgayYeuCau).HasDefaultValueSql("(sysdatetime())");
			entity.Property(e => e.TrangThai).HasDefaultValue("ChoXuLy");

			entity.HasOne(d => d.NguoiYeuCau).WithMany(p => p.YeuCauXuatKhos)
				.OnDelete(DeleteBehavior.ClientSetNull)
				.HasConstraintName("FK_YeuCauXuatKho_NguoiDung");
		});

		OnModelCreatingPartial(modelBuilder);
	}

	partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}