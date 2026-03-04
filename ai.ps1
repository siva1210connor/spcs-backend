# Set paths
$rootPath = Get-Location
$srcPath = Join-Path $rootPath "src"
$outputFile = Join-Path $rootPath "ai.txt"

# Clear existing ai.txt if it exists
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

# Get all files recursively inside src
Get-ChildItem -Path $srcPath -Recurse -File | ForEach-Object {

    $relativePath = $_.FullName.Replace($rootPath.Path + "\", "")

    Add-Content -Path $outputFile -Value "==========================================="
    Add-Content -Path $outputFile -Value "FILE: $relativePath"
    Add-Content -Path $outputFile -Value "==========================================="
    Add-Content -Path $outputFile -Value ""

    try {
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop
        Add-Content -Path $outputFile -Value $content
    }
    catch {
        Add-Content -Path $outputFile -Value "ERROR READING FILE"
    }

    Add-Content -Path $outputFile -Value "`n`n"
}

Write-Host "✅ Export completed. Output written to ai.txt"