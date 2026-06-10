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
		policy.SetIsOriginAllowed(origin =>
			  {
				  if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
				  {
					  return false;
				  }

				  return (uri.Host == "localhost" || uri.Host == "127.0.0.1")
					  && uri.Port >= 5173
					  && uri.Port <= 5199;
			  })
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

if (app.Environment.IsDevelopment())
{
	await DevDataSeeder.SeedAsync(app.Services);
}

app.Run();
