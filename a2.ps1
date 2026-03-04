# ==========================================
# Phase 3: Create Empty Files + Folders
# StrictMode-safe + Professional error output
# Run from project root
# ==========================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host ("[OK] Created folder: {0}" -f $Path)
    } else {
        Write-Host ("[SKIP] Folder exists: {0}" -f $Path)
    }
}

function Ensure-File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    # StrictMode-safe initialization
    $parent = $null

    $parent = Split-Path -Parent $Path
    if ($null -ne $parent -and $parent.Trim().Length -gt 0) {
        if (-not (Test-Path -LiteralPath $parent)) {
            Ensure-Directory -Path $parent
        }
    }

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType File -Path $Path -Force | Out-Null
        Write-Host ("[OK] Created file:   {0}" -f $Path)
    } else {
        Write-Host ("[SKIP] File exists:   {0}" -f $Path)
    }
}

try {
    Write-Host ""
    Write-Host "--- Phase 3 scaffolding: creating folders/files ---"
    Write-Host ""

    # Base folders
    $dirs = @(
        "src",
        "src/routes",
        "src/controllers",
        "src/services",
        "src/validators"
    )

    foreach ($d in $dirs) {
        Ensure-Directory -Path $d
    }

    # Phase 3 empty files
    $files = @(
        # Routes
        "src/routes/categories.routes.js",
        "src/routes/books.routes.js",
        "src/routes/cart.routes.js",
        "src/routes/wishlist.routes.js",

        # Controllers
        "src/controllers/categories.controller.js",
        "src/controllers/books.controller.js",
        "src/controllers/cart.controller.js",
        "src/controllers/wishlist.controller.js",

        # Services
        "src/services/books.service.js",
        "src/services/cart.service.js",
        "src/services/wishlist.service.js",

        # Validators
        "src/validators/books.validator.js",
        "src/validators/cart.validator.js",
        "src/validators/wishlist.validator.js"
    )

    foreach ($f in $files) {
        Ensure-File -Path $f
    }

    Write-Host ""
    Write-Host "[DONE] Phase 3 empty scaffolding created successfully."
    Write-Host ""

    Write-Host "--- Verify created Phase 3 files ---"
    Get-ChildItem -Path "src" -Recurse -File |
        Where-Object { $_.FullName -match "routes|controllers|services|validators" } |
        Select-Object FullName

} catch {
    Write-Host ""
    Write-Host "[ERROR] Phase 3 scaffolding failed:"
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Stack trace:"
    Write-Host $_.Exception.StackTrace
    exit 1
}