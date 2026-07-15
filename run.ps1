param(
    [Parameter(Position = 0)]
    [ValidateSet("help", "local", "docker-local", "prod", "down", "logs", "status", "doctor", "build")]
    [string]$Mode = "help"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-EnvFilePath {
    param([ValidateSet("local", "production")][string]$EnvironmentName)

    return Join-Path $Root "server\.env.$EnvironmentName"
}

function Convert-EnvFileToPowerShellCommand {
    param([string]$Path)

    if (!(Test-Path $Path)) {
        throw "Missing environment file: $Path"
    }

    $commands = @()
    foreach ($line in Get-Content $Path) {
        $trimmed = $line.Trim()
        if (!$trimmed -or $trimmed.StartsWith("#") -or !$trimmed.Contains("=")) {
            continue
        }

        $parts = $trimmed.Split("=", 2)
        $key = $parts[0].Trim()
        $value = $parts[1]
        $escapedValue = $value.Replace("'", "''")
        $commands += "`$env:$key='$escapedValue'"
    }

    return ($commands -join "; ")
}

function Start-DevProcess {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command",
        "Set-Location '$WorkingDirectory'; `$Host.UI.RawUI.WindowTitle = '$Title'; $Command"
    ) | Out-Null
}

function Invoke-Compose {
    param(
        [string[]]$Arguments,
        [ValidateSet("local", "production")][string]$EnvironmentName = "local"
    )

    Push-Location $Root
    try {
        $envFile = Get-EnvFilePath $EnvironmentName
        & docker compose --env-file $envFile @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "docker compose failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

function Test-UrlReady {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -lt 500
    }
    catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            return $statusCode -lt 500
        }
        return $false
    }
}

function Wait-UrlReady {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 120
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-UrlReady $Url) {
            Write-Host "Ready: $Url"
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "Timed out waiting for $Url"
}

switch ($Mode) {
    "help" {
        Write-Host "Usage:"
        Write-Host "  .\run.ps1 local          # Start backend, client, admin in dev mode"
        Write-Host "  .\run.ps1 docker-local   # Start local Docker stack"
        Write-Host "  .\run.ps1 prod           # Build backend jar and start production Docker stack"
        Write-Host "  .\run.ps1 down           # Stop Docker stack"
        Write-Host "  .\run.ps1 logs           # Follow Docker logs"
        Write-Host "  .\run.ps1 status         # Show Docker container status"
        Write-Host "  .\run.ps1 doctor         # Check containers, logs, and local URLs"
        Write-Host ""
        Write-Host "Command Prompt wrapper:"
        Write-Host "  run.cmd docker-local"
    }

    "local" {
        $localEnv = Convert-EnvFileToPowerShellCommand (Get-EnvFilePath "local")
        $serverCommand = "$localEnv; .\mvnw.cmd spring-boot:run"

        Start-DevProcess "quiz-server" "$Root\server" $serverCommand
        Start-DevProcess "quiz-client" "$Root\client" "`$env:PORT=3000; npm.cmd start"
        Start-DevProcess "quiz-admin" "$Root\admin" "`$env:PORT=3001; npm.cmd start"

        Write-Host "Local dev started:"
        Write-Host "  API:    http://localhost:8080"
        Write-Host "  Client: http://localhost:3000"
        Write-Host "  Admin:  http://localhost:3001"
    }

    "docker-local" {
        Invoke-Compose @("-f", "docker-compose.yml", "-f", "docker-compose.local.yml", "up", "-d", "--build") -EnvironmentName "local"
        Wait-UrlReady "http://localhost:8080"
        Invoke-Compose @("-f", "docker-compose.yml", "-f", "docker-compose.local.yml", "restart", "nginx") -EnvironmentName "local"
        Wait-UrlReady "http://api.localhost"
        Write-Host "Docker local started:"
        Write-Host "  Client: http://localhost"
        Write-Host "  Admin:  http://admin.localhost"
        Write-Host "  API:    http://api.localhost"
        Write-Host ""
        Write-Host "Direct ports are also available:"
        Write-Host "  API:    http://localhost:8080"
        Write-Host "  Client: http://localhost:3000"
        Write-Host "  Admin:  http://localhost:3001"
        Write-Host ""
        Write-Host "If a page is not reachable, run:"
        Write-Host "  run.cmd logs"
    }

    "prod" {
        $prodEnv = Convert-EnvFileToPowerShellCommand (Get-EnvFilePath "production")
        Push-Location "$Root\server"
        try {
            powershell -NoProfile -ExecutionPolicy Bypass -Command "$prodEnv; .\mvnw.cmd clean package -DskipTests"
        }
        finally {
            Pop-Location
        }

        Invoke-Compose @("up", "-d", "--build") -EnvironmentName "production"
        Wait-UrlReady "http://localhost:8080"
        Invoke-Compose @("restart", "nginx") -EnvironmentName "production"
        Write-Host "Production stack started:"
        Write-Host "  Client: https://quizvnua.com"
        Write-Host "  Admin:  https://admin.quizvnua.com"
        Write-Host "  API:    https://api.quizvnua.com"
    }

    "build" {
        Push-Location "$Root\server"
        try {
            & .\mvnw.cmd clean package -DskipTests
        }
        finally {
            Pop-Location
        }

        Push-Location "$Root\client"
        try {
            & npm.cmd run build
        }
        finally {
            Pop-Location
        }

        Push-Location "$Root\admin"
        try {
            & npm.cmd run build
        }
        finally {
            Pop-Location
        }
    }

    "down" {
        Invoke-Compose @("-f", "docker-compose.yml", "-f", "docker-compose.local.yml", "down") -EnvironmentName "local"
    }

    "logs" {
        Invoke-Compose @("-f", "docker-compose.yml", "-f", "docker-compose.local.yml", "logs", "-f") -EnvironmentName "local"
    }

    "status" {
        Invoke-Compose @("-f", "docker-compose.yml", "-f", "docker-compose.local.yml", "ps") -EnvironmentName "local"
    }

    "doctor" {
        Write-Host "Docker containers:"
        Invoke-Compose @("-f", "docker-compose.yml", "-f", "docker-compose.local.yml", "ps") -EnvironmentName "local"

        Write-Host ""
        Write-Host "Recent logs:"
        Invoke-Compose @("-f", "docker-compose.yml", "-f", "docker-compose.local.yml", "logs", "--tail=80", "backend", "user", "admin") -EnvironmentName "local"

        Write-Host ""
        Write-Host "URL checks:"
        foreach ($url in @("http://localhost:3000", "http://localhost:3001", "http://localhost:8080")) {
            try {
                $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
                if ($response.StatusCode -ge 500) {
                    Write-Host "  FAIL $url -> HTTP $($response.StatusCode)"
                } else {
                    Write-Host "  OK   $url -> HTTP $($response.StatusCode)"
                }
            }
            catch {
                if ($_.Exception.Response) {
                    $statusCode = [int]$_.Exception.Response.StatusCode
                    if ($statusCode -ge 500) {
                        Write-Host "  FAIL $url -> HTTP $statusCode"
                    } else {
                        Write-Host "  OK   $url -> HTTP $statusCode"
                    }
                } else {
                    Write-Host "  FAIL $url -> $($_.Exception.Message)"
                }
            }
        }

        Write-Host ""
        Write-Host "Nginx local URL checks:"
        foreach ($url in @("http://localhost", "http://admin.localhost", "http://api.localhost")) {
            try {
                $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
                if ($response.StatusCode -ge 500) {
                    Write-Host "  FAIL $url -> HTTP $($response.StatusCode)"
                } else {
                    Write-Host "  OK   $url -> HTTP $($response.StatusCode)"
                }
            }
            catch {
                if ($_.Exception.Response) {
                    $statusCode = [int]$_.Exception.Response.StatusCode
                    if ($statusCode -ge 500) {
                        Write-Host "  FAIL $url -> HTTP $statusCode"
                    } else {
                        Write-Host "  OK   $url -> HTTP $statusCode"
                    }
                } else {
                    Write-Host "  FAIL $url -> $($_.Exception.Message)"
                }
            }
        }
    }
}
