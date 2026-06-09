using Microsoft.EntityFrameworkCore;
using QuanLyKhoCafe.API.Data;
using QuanLyKhoCafe.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext của bro nếu có thì giữ nguyên
builder.Services.AddDbContext<QuanLyKhoCafeDbContext>(options =>
	options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS cho React
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowReactApp", policy =>
	{
		policy.WithOrigins("http://localhost:5173")
			  .AllowAnyHeader()
			  .AllowAnyMethod();
	});
});

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Bắt buộc đặt trước Authorization và MapControllers
app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();