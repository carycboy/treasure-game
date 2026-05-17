# Deploy to GitHub Pages

Deploy the treasure game to https://carycboy.github.io/treasure-game/

## Pre-flight checks

1. Verify `vite.config.ts` has `base: '/treasure-game/'` set.
2. Verify `package.json` has `"deploy": "gh-pages -d build"` in scripts.
3. Verify the git remote points to `https://github.com/carycboy/treasure-game.git`:
   ```
   git remote get-url origin
   ```
   If not set, add it:
   ```
   git remote add origin https://github.com/carycboy/treasure-game.git
   ```

## Deploy steps

Run these commands in order:

```bash
# Install dependencies (includes gh-pages)
npm install

# Stage, commit, and push source code
git add -A
git commit -m "Deploy to GitHub Pages"
git push -u origin master

# Build and publish to gh-pages branch
npm run deploy
```

`npm run deploy` runs `predeploy` (builds to `build/`) then pushes the `build/` folder to the `gh-pages` branch automatically.

## Enable GitHub Pages (first time only)

1. Go to https://github.com/carycboy/treasure-game/settings/pages
2. Under **Source**, select **Deploy from a branch**
3. Choose branch: **gh-pages**, folder: **/ (root)**
4. Click **Save**

## Live URL

https://carycboy.github.io/treasure-game/

GitHub takes 1–3 minutes to publish after the first deploy. Subsequent deploys update within ~30 seconds.
