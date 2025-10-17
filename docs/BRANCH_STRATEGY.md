# Branch Strategy & Maintenance Guide

## Branch Structure

```
main (base app without IAP)
  └── with-iap (base app WITH IAP)
```

## Maintenance Strategy

### When Adding New Features (NOT related to IAP)

**Always start from `main` branch:**

```bash
# 1. Add feature to main
git checkout main
git pull origin main

# Make your changes (e.g., add new feature, fix bug)
# Test thoroughly

git add .
git commit -m "feat: add new awesome feature"
git push origin main

# 2. Sync the feature to with-iap branch
git checkout with-iap
git merge main -m "sync: merge new features from main"

# Resolve any conflicts if they exist (usually in HomeScreen or config)
# Test that IAP still works after merge

git push origin with-iap
```

### When Modifying IAP-Specific Code

**Work directly on `with-iap` branch:**

```bash
git checkout with-iap
git pull origin with-iap

# Make IAP-specific changes
# Test thoroughly

git add .
git commit -m "feat(iap): improve purchase flow"
git push origin with-iap

# NO need to merge back to main (main doesn't have IAP)
```

### General Rules

1. **Main branch = Source of Truth for base features**
   - Push notifications
   - Deep linking
   - Offline mode
   - Device info
   - Authentication
   - Sharing
   - WebView core functionality

2. **with-iap branch = Main + IAP**
   - Everything from main
   - Plus IAP service
   - Plus IAP message handlers in HomeScreen
   - Plus IAP configuration in config.js

3. **Workflow:**
   ```
   New base feature → main → merge to with-iap
   IAP improvement → with-iap only
   ```

## Visual Workflow

```
┌─────────────────────────────────────────────────────┐
│ Scenario 1: Adding new base feature                │
│                                                     │
│  main branch:                                      │
│    1. Add feature (e.g., biometrics)              │
│    2. Test                                         │
│    3. Commit & push                                │
│                                                     │
│  with-iap branch:                                  │
│    4. git merge main                               │
│    5. Resolve conflicts (if any)                   │
│    6. Test IAP still works                         │
│    7. Push                                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Scenario 2: Improving IAP                          │
│                                                     │
│  with-iap branch:                                  │
│    1. Modify IAP code                              │
│    2. Test                                         │
│    3. Commit & push                                │
│                                                     │
│  main branch:                                      │
│    (no action needed - stays IAP-free)            │
└─────────────────────────────────────────────────────┘
```

## Common Conflicts and Resolution

### Conflict 1: config.js

**When:** Merging main → with-iap and both modified config.js

**Resolution:**
- Keep IAP configuration from `with-iap`
- Add new features from `main`
- Ensure `IN_APP_PURCHASES: true` in with-iap

Example:
```javascript
// In with-iap after merge
FEATURES: {
  PUSH_NOTIFICATIONS: true,   // from main
  SHARING: true,               // from main
  DEEP_LINKING: true,          // from main
  IN_APP_PURCHASES: true,      // keep from with-iap
  OFFLINE_MODE: true,          // from main
  DEVICE_INFO: true,           // from main
  NEW_FEATURE: true,           // new from main
},
```

### Conflict 2: HomeScreen (app/(tabs)/index.js)

**When:** Both branches modified message handlers

**Resolution:**
- Keep all handlers from both branches
- Ensure IAP handlers have feature flag checks

Example:
```javascript
switch (message.action) {
  // Base handlers (from main)
  case 'loginSuccess':
  case 'logout':
  case 'share':
  case 'getDeviceInfo':
    // ...
    break;

  // IAP handlers (from with-iap)
  case 'getProducts':
  case 'purchase':
  case 'restorePurchases':
  case 'getSubscriptionStatus':
    if (!config.FEATURES.IN_APP_PURCHASES) return;
    // ...
    break;
}
```

## Automation Script

To make syncing easier, use this script:

```bash
#!/bin/bash
# sync-branches.sh

echo "🔄 Syncing main → with-iap"

# Ensure we're on main
git checkout main
git pull origin main

# Merge to with-iap
git checkout with-iap
git pull origin with-iap
git merge main -m "sync: merge updates from main"

if [ $? -ne 0 ]; then
  echo "❌ Merge conflicts detected!"
  echo "Please resolve conflicts manually, then run:"
  echo "  git add ."
  echo "  git commit"
  echo "  git push origin with-iap"
  exit 1
fi

echo "✅ Merge successful!"
echo "Testing app..."

# Optional: run tests here
# npm test

git push origin with-iap

echo "✅ Sync complete!"
```

Save as `scripts/sync-branches.sh` and run with:
```bash
chmod +x scripts/sync-branches.sh
./scripts/sync-branches.sh
```

## Creating a New App Project

### Without IAP:
```bash
git clone <repo-url> my-new-app
cd my-new-app
git checkout main
# Configure config.js for your app
# Start building
```

### With IAP:
```bash
git clone <repo-url> my-new-app
cd my-new-app
git checkout with-iap
npm install react-native-purchases
npx expo prebuild --clean
# Configure RevenueCat keys in config.js
# Start building
```

## Keeping Both Branches in Sync

### Monthly Maintenance Checklist

```markdown
- [ ] Review commits in main since last sync
- [ ] Merge main → with-iap
- [ ] Test both branches thoroughly
- [ ] Update CHANGELOG.md in both branches
- [ ] Tag releases (e.g., v2.0.0-main, v2.0.0-with-iap)
```

## Emergency: Branches Diverged Too Much

If branches have diverged significantly:

```bash
# Option 1: Hard merge (recommended)
git checkout with-iap
git merge main --strategy-option=theirs
# Manually re-add IAP code where needed

# Option 2: Cherry-pick specific commits
git checkout with-iap
git cherry-pick <commit-hash>  # Pick specific commits from main

# Option 3: Recreate with-iap from main
git checkout main
git checkout -b with-iap-new
# Manually add IAP files from docs/ADDING_IAP.md
# Test thoroughly
git branch -D with-iap
git branch -m with-iap-new with-iap
```

## Questions?

- **Q: Should I ever merge with-iap → main?**
  - **A:** NO. Main should never have IAP code.

- **Q: What if I add a feature that both branches need?**
  - **A:** Add to main first, then merge main → with-iap.

- **Q: Can I work on both branches simultaneously?**
  - **A:** Yes, but keep separate working directories:
    ```bash
    git worktree add ../app-base-iap with-iap
    # Now you have both branches in different folders
    ```

- **Q: How do I know if branches are in sync?**
  - **A:** Run: `git log main..with-iap --oneline`
    - Should only show IAP-specific commits
