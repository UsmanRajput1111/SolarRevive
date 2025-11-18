# Push SolarRevive to GitHub
# Usage: .\push-to-github.ps1
# Or with token: $env:GITHUB_TOKEN="your_token_here"; .\push-to-github.ps1

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Update remote URL
git remote set-url origin https://github.com/UsmanRajput1111/SolarRevive.git

# Check if token is provided via environment variable
if ($env:GITHUB_TOKEN) {
    Write-Host "Token found. Configuring Git to use token..." -ForegroundColor Green
    $remoteUrl = "https://$env:GITHUB_TOKEN@github.com/UsmanRajput1111/SolarRevive.git"
    git remote set-url origin $remoteUrl
    git push -u origin main
    # Remove token from remote URL for security
    git remote set-url origin https://github.com/UsmanRajput1111/SolarRevive.git
    Write-Host "`nPush completed!" -ForegroundColor Green
} else {
    Write-Host "No token provided. Pushing with credential prompt..." -ForegroundColor Yellow
    Write-Host "If prompted, use your GitHub username and Personal Access Token as password." -ForegroundColor Yellow
    git push -u origin main
}


