<#
    BCE - minimal static dev server

    Serves this folder over http://localhost:<port>/ with no dependencies.
    Uses a raw TcpListener rather than HttpListener so it runs without
    administrator rights or a URL ACL reservation.

    Usage:   powershell -ExecutionPolicy Bypass -File .\serve.ps1
             powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8081

    Stop with Ctrl+C.
#>

param(
    [int]$Port = 8080,
    [string]$Root = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.webp' = 'image/webp'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
    '.txt'  = 'text/plain; charset=utf-8'
}

$rootFull = (Resolve-Path -LiteralPath $Root).Path

try {
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
} catch {
    Write-Host "Could not bind port $Port. Try another, e.g. -Port 8081" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  BCE site running at  http://localhost:$Port/" -ForegroundColor Green
Write-Host "  Serving              $rootFull"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""

function Send-Response {
    param($Stream, [int]$Status, [string]$Reason, [string]$ContentType, [byte[]]$Body)

    $header  = "HTTP/1.1 $Status $Reason`r`n"
    $header += "Content-Type: $ContentType`r`n"
    $header += "Content-Length: $($Body.Length)`r`n"
    $header += "Cache-Control: no-cache, no-store, must-revalidate`r`n"
    $header += "Connection: close`r`n`r`n"

    $hb = [Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($hb, 0, $hb.Length)
    if ($Body.Length) { $Stream.Write($Body, 0, $Body.Length) }
    $Stream.Flush()
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 5000
            $client.SendTimeout    = 30000
            $stream = $client.GetStream()

            $buffer = New-Object byte[] 8192
            $read = $stream.Read($buffer, 0, $buffer.Length)
            if ($read -le 0) { continue }

            $request = [Text.Encoding]::ASCII.GetString($buffer, 0, $read)
            $requestLine = ($request -split "`r`n")[0]
            $parts = $requestLine -split ' '
            if ($parts.Count -lt 2) { continue }

            $method = $parts[0]
            $target = $parts[1]

            # Drop the query string - service.html?s=aircon must map to service.html
            $path = $target.Split('?')[0]
            $path = [Uri]::UnescapeDataString($path)
            if ($path.EndsWith('/')) { $path += 'index.html' }

            $relative = $path.TrimStart('/') -replace '/', '\'
            $candidate = Join-Path $rootFull $relative

            $served = $false
            if (Test-Path -LiteralPath $candidate -PathType Leaf) {
                $full = (Resolve-Path -LiteralPath $candidate).Path
                # Refuse anything that escapes the served folder
                if ($full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
                    $ext  = [IO.Path]::GetExtension($full).ToLower()
                    $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
                    $body = [IO.File]::ReadAllBytes($full)

                    if ($method -eq 'HEAD') { $body = New-Object byte[] 0 }
                    Send-Response $stream 200 'OK' $type $body
                    Write-Host ("  200  " + $path) -ForegroundColor DarkGray
                    $served = $true
                }
            }

            if (-not $served) {
                $safe = $path -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;'
                $html = "<!doctype html><meta charset=utf-8><title>404</title>" +
                        "<body style='font:16px system-ui;padding:48px'>" +
                        "<h1>404 - Not found</h1><p><code>$safe</code></p>" +
                        "<p><a href='/'>Back to the homepage</a></p>"
                $body = [Text.Encoding]::UTF8.GetBytes($html)
                Send-Response $stream 404 'Not Found' 'text/html; charset=utf-8' $body
                Write-Host ("  404  " + $path) -ForegroundColor Yellow
            }
        } catch {
            # A browser closing a connection early is normal; keep serving.
        } finally {
            if ($client) { $client.Close() }
        }
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Yellow
}
