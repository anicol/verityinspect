# Branch Protection Setup for VerityInspect

This guide walks through setting up branch protection rules on the main branch to enforce PR-based workflows.

## Step 1: Access Branch Protection Settings

1. **Go to GitHub Repository**
   - Navigate to: [github.com/anicol/verityinspect](https://github.com/anicol/verityinspect)
   - Make sure you're logged in as the repository owner

2. **Navigate to Settings**
   - Click on "Settings" tab (top right of repository)
   - In left sidebar, click "Branches" under "Code and automation"

## Step 2: Add Branch Protection Rule

1. **Add Rule for Main Branch**
   - Click "Add rule" or "Add branch protection rule"
   - **Branch name pattern**: `main`

2. **Configure Protection Settings**

### Required Settings (Recommended):

#### ✅ **Restrict pushes that create files larger than 100 MB**
- Prevents accidentally committing large files

#### ✅ **Require a pull request before merging**
- Forces all changes to go through PR process
- **Sub-options to enable:**
  - ✅ Require approvals: `1` (minimum)
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if CODEOWNERS file exists)

#### ✅ **Require status checks to pass before merging**
- Ensures CI/CD passes before merge
- **Sub-options:**
  - ✅ Require branches to be up to date before merging
  - **Add status checks** (if you have CI/CD setup):
    - Build checks
    - Test suites
    - Linting checks

#### ✅ **Require conversation resolution before merging**
- All PR comments must be resolved

#### ✅ **Require signed commits** (Optional but recommended)
- Adds extra security layer

#### ✅ **Require linear history**
- Prevents messy merge commits
- Forces rebase workflow

#### ✅ **Include administrators**
- Even repo admins must follow these rules

### Optional Settings:

#### ⚠️ **Allow force pushes** - LEAVE UNCHECKED
- Force pushes can rewrite history dangerously

#### ⚠️ **Allow deletions** - LEAVE UNCHECKED  
- Prevents accidental branch deletion

## Step 3: Save Protection Rule

- Click "Create" or "Save changes"
- The main branch is now protected!

## Step 4: Create Development Workflow

### For Future Development:

1. **Create Feature Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to GitHub repository
   - Click "Compare & pull request"
   - Fill in PR description
   - Request review if needed

4. **Merge via PR**
   - Once approved and checks pass
   - Use "Squash and merge" or "Rebase and merge"
   - Delete feature branch after merge

## Step 5: Add CODEOWNERS File (Optional)

Create a `.github/CODEOWNERS` file to automatically request reviews:

```bash
# Global code owners
* @anicol

# Frontend specific
/apps/web/ @anicol
/apps/marketing/ @anicol

# Backend specific  
/apps/api/ @anicol

# Infrastructure
/render.yaml @anicol
/docker-compose.yml @anicol
/.github/ @anicol
```

## Step 6: Setup GitHub Actions (Optional)

Create `.github/workflows/ci.yml` for automated checks:

```yaml
name: CI

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v3
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd apps/api
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd apps/api
          python manage.py test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Test Web App
        run: |
          cd apps/web
          npm install
          npm run build
      - name: Test Marketing Site
        run: |
          cd apps/marketing
          npm install  
          npm run build
```

## Benefits of Branch Protection

### 🛡️ **Code Quality**
- All changes reviewed before merging
- Prevents broken code in main branch
- Maintains clean commit history

### 👥 **Team Collaboration**  
- Forces discussion through PRs
- Code review process
- Knowledge sharing

### 🚀 **Deployment Safety**
- CI/CD checks before merge
- Render deploys only tested code
- Easy rollback if needed

### 📝 **Documentation**
- PR descriptions document changes
- Review comments provide context
- Clear change history

## Emergency Procedures

### Temporarily Disable Protection
1. Go to Settings → Branches
2. Edit the main branch rule  
3. Uncheck protections temporarily
4. **Remember to re-enable after emergency**

### Hotfix Process
1. Create hotfix branch from main
2. Make minimal fix
3. Create PR immediately
4. Fast-track review and merge
5. Deploy to production

## Development Workflow Example

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/add-video-analytics

# Work on feature
# ... make changes ...
git add .
git commit -m "Add video analytics dashboard component"
git push origin feature/add-video-analytics

# Create PR on GitHub
# Wait for review and approval
# Merge via GitHub interface

# Clean up
git checkout main
git pull origin main
git branch -d feature/add-video-analytics
```

## Status Check Integration

If using external services, add these as required status checks:
- **Render Preview Deployments**
- **Code Quality Tools** (SonarCloud, CodeClimate)
- **Security Scans** (Snyk, GitHub Security)
- **Performance Tests**

---

This setup ensures all changes to main go through proper review and testing processes, maintaining code quality and deployment reliability.