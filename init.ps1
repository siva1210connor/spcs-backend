# ==============================
# SPCS Backend Folder Generator
# ==============================

Write-Host "Creating project structure..."

# Root folders
$folders = @(
    "prisma",
    "src",
    "src/routes",
    "src/controllers",
    "src/services",
    "src/middleware",
    "src/config",
    "src/utils",
    "src/validators"
)

foreach ($folder in $folders) {
    if (-Not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
        Write-Host "Created folder: $folder"
    }
}

# Files to create
$files = @(
    "prisma/schema.prisma",

    "src/index.js",
    "src/app.js",

    "src/routes/index.js",
    "src/routes/health.routes.js",
    "src/routes/auth.routes.js",

    "src/controllers/health.controller.js",
    "src/controllers/auth.controller.js",

    "src/services/auth.service.js",

    "src/middleware/auth.middleware.js",
    "src/middleware/error.middleware.js",
    "src/middleware/rateLimit.middleware.js",
    "src/middleware/validate.middleware.js",
    "src/middleware/security.middleware.js",

    "src/config/env.js",
    "src/config/logger.js",
    "src/config/prisma.js",
    "src/config/redis.js",

    "src/utils/asyncHandler.js",
    "src/utils/apiResponse.js",
    "src/utils/constants.js",

    "src/validators/auth.validator.js",

    ".env",
    ".env.example"
)

foreach ($file in $files) {
    if (-Not (Test-Path $file)) {
        New-Item -ItemType File -Path $file | Out-Null
        Write-Host "Created file: $file"
    }
}

Write-Host "`n✅ Project structure created successfully!"