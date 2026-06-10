$port = 5173

while (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
  $port++
}

$url = "http://localhost:$port/"

Start-Job -ScriptBlock {
  param($targetUrl)

  Start-Sleep -Seconds 2
  Start-Process $targetUrl
} -ArgumentList $url | Out-Null

npx vite --host localhost --port $port --strictPort
