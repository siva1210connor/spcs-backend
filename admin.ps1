# ==========================================
# Admin Phase A - Step 1: Empty Scaffolding
# Creates admin module folders + empty files
# Run from project root (spcs-backend)
# ==========================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Directory {
  param([Parameter(Mandatory = $true)][string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    Write-Host ("[OK] Folder: {0}" -f $Path)
  } else {
    Write-Host ("[SKIP] Folder exists: {0}" -f $Path)
  }
}

function Ensure-File {
  param([Parameter(Mandatory = $true)][string]$Path)

  $parent = $null
  $parent = Split-Path -Parent $Path

  if ($null -ne $parent -and $parent.Trim().Length -gt 0) {
    if (-not (Test-Path -LiteralPath $parent)) {
      Ensure-Directory -Path $parent
    }
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType File -Path $Path -Force | Out-Null
    Write-Host ("[OK] File:   {0}" -f $Path)
  } else {
    Write-Host ("[SKIP] File exists: {0}" -f $Path)
  }
}

try {
  Write-Host ""
  Write-Host "--- Admin Phase A: Creating scaffolding (empty files) ---"
  Write-Host ""

  # Base admin folders
  $dirs = @(
    "src/admin",
    "src/admin/routes",
    "src/admin/controllers",
    "src/admin/services",
    "src/admin/validators"
  )

  foreach ($d in $dirs) { Ensure-Directory -Path $d }

  # Admin files for the API set you provided (create now, fill later)
  $files = @(
    # Admin route aggregator
    "src/admin/routes/index.js",

    # Admin core
    "src/admin/routes/me.routes.js",
    "src/admin/controllers/me.controller.js",
    "src/admin/services/me.service.js",
    "src/admin/validators/me.validator.js",

    # Dashboard + slider
    "src/admin/routes/dashboard.routes.js",
    "src/admin/controllers/dashboard.controller.js",
    "src/admin/services/dashboard.service.js",
    "src/admin/validators/dashboard.validator.js",

    # Orders (refund + list/detail/toggle/delete separated by types)
    "src/admin/routes/orders.routes.js",
    "src/admin/controllers/orders.controller.js",
    "src/admin/services/orders.service.js",
    "src/admin/validators/orders.validator.js",

    # Customers
    "src/admin/routes/customers.routes.js",
    "src/admin/controllers/customers.controller.js",
    "src/admin/services/customers.service.js",
    "src/admin/validators/customers.validator.js",

    # Books management
    "src/admin/routes/books.routes.js",
    "src/admin/controllers/books.controller.js",
    "src/admin/services/books.service.js",
    "src/admin/validators/books.validator.js",

    # Offers
    "src/admin/routes/offers.routes.js",
    "src/admin/controllers/offers.controller.js",
    "src/admin/services/offers.service.js",
    "src/admin/validators/offers.validator.js",

    # Rules
    "src/admin/routes/rules.routes.js",
    "src/admin/controllers/rules.controller.js",
    "src/admin/services/rules.service.js",
    "src/admin/validators/rules.validator.js",

    # News & Events
    "src/admin/routes/events.routes.js",
    "src/admin/controllers/events.controller.js",
    "src/admin/services/events.service.js",
    "src/admin/validators/events.validator.js",

    # Awards
    "src/admin/routes/awards.routes.js",
    "src/admin/controllers/awards.controller.js",
    "src/admin/services/awards.service.js",
    "src/admin/validators/awards.validator.js",

    # Gallery Albums + Gallery
    "src/admin/routes/gallery.routes.js",
    "src/admin/controllers/gallery.controller.js",
    "src/admin/services/gallery.service.js",
    "src/admin/validators/gallery.validator.js",

    # Downloads
    "src/admin/routes/downloads.routes.js",
    "src/admin/controllers/downloads.controller.js",
    "src/admin/services/downloads.service.js",
    "src/admin/validators/downloads.validator.js",

    # Ads
    "src/admin/routes/ads.routes.js",
    "src/admin/controllers/ads.controller.js",
    "src/admin/services/ads.service.js",
    "src/admin/validators/ads.validator.js",

    # Scheme
    "src/admin/routes/scheme.routes.js",
    "src/admin/controllers/scheme.controller.js",
    "src/admin/services/scheme.service.js",
    "src/admin/validators/scheme.validator.js",

    # Archives
    "src/admin/routes/archives.routes.js",
    "src/admin/controllers/archives.controller.js",
    "src/admin/services/archives.service.js",
    "src/admin/validators/archives.validator.js",

    # Bulletin
    "src/admin/routes/bulletin.routes.js",
    "src/admin/controllers/bulletin.controller.js",
    "src/admin/services/bulletin.service.js",
    "src/admin/validators/bulletin.validator.js",

    # Catalogue
    "src/admin/routes/catalogue.routes.js",
    "src/admin/controllers/catalogue.controller.js",
    "src/admin/services/catalogue.service.js",
    "src/admin/validators/catalogue.validator.js",

    # Reviews moderation
    "src/admin/routes/reviews.routes.js",
    "src/admin/controllers/reviews.controller.js",
    "src/admin/services/reviews.service.js",
    "src/admin/validators/reviews.validator.js",

    # Feedback
    "src/admin/routes/feedback.routes.js",
    "src/admin/controllers/feedback.controller.js",
    "src/admin/services/feedback.service.js",
    "src/admin/validators/feedback.validator.js"
  )

  foreach ($f in $files) { Ensure-File -Path $f }

  Write-Host ""
  Write-Host "[DONE] Admin Phase A scaffolding created."
  Write-Host ""
  Write-Host "--- Verify admin files ---"
  Get-ChildItem -Path "src/admin" -Recurse -File | Select-Object FullName

} catch {
  Write-Host ""
  Write-Host "[ERROR] Admin scaffolding failed:"
  Write-Host $_.Exception.Message
  Write-Host ""
  Write-Host "Stack trace:"
  Write-Host $_.Exception.StackTrace
  exit 1
}