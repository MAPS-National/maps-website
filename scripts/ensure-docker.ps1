# predev helper: make sure the Docker daemon is up, then start the MinIO stack.
# If Docker Desktop is closed we launch it and poll until the daemon answers
# (cold start is ~20-40s). Best-effort: any failure exits 0 so `npm run dev`
# still boots the frontend without S3.

$ErrorActionPreference = 'SilentlyContinue'

function Test-Daemon { docker info *> $null; return ($LASTEXITCODE -eq 0) }

if (-not (Test-Daemon)) {
  Write-Host 'Docker daemon down, starting Docker Desktop...'
  Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  $deadline = (Get-Date).AddSeconds(90)
  while (-not (Test-Daemon)) {
    if ((Get-Date) -gt $deadline) { Write-Host 'Docker did not come up in 90s, skipping MinIO.'; exit 0 }
    Start-Sleep -Seconds 3
  }
  Write-Host 'Docker daemon ready.'
}

docker compose up -d
exit 0
