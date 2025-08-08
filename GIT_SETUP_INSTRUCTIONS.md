# Git Setup and GitHub Push Instructions

## Step 1: Install Git
1. Download from: https://git-scm.com/download/win
2. Install with default settings
3. Restart VS Code

## Step 2: Configure Git (First time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Initialize Repository
```bash
cd "c:\Users\krishils\Downloads\qi - Copy (1)\qi - Copy"
git init
```

## Step 4: Add Files
```bash
git add .
git commit -m "Initial commit: QuoteBill Pro application"
```

## Step 5: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository" (+ icon)
3. Repository name: `quotebill-pro`
4. Description: "Quote and Bill management application"
5. Keep it Public or Private (your choice)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

## Step 6: Connect to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/quotebill-pro.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 7: Future Updates
After making changes:
```bash
git add .
git commit -m "Description of changes"
git push
```

## Alternative: Using GitHub Desktop
1. Download GitHub Desktop: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click "Add an Existing Repository from your Hard Drive"
4. Select your project folder
5. Publish to GitHub

## Commands to Run Now:
Once Git is installed, run these commands in VS Code terminal:

```bash
cd "c:\Users\krishils\Downloads\qi - Copy (1)\qi - Copy"
git init
git add .
git commit -m "Initial commit: QuoteBill Pro application"
```

Then create the GitHub repository and push.
