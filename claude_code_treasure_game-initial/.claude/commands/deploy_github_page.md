Deploy this project to GitHub Pages by running the deploy script, then report the live URL.

Steps:
1. Check if `.env.production` exists in the project root. If it doesn't, warn the user that `VITE_API_URL` is not set, so the deployed app won't have a working backend (scores and login will fail). Tell them to create `.env.production` with `VITE_API_URL=https://their-render-url.onrender.com` before deploying.
2. Run `npm run deploy` (this triggers `predeploy` → `npm run build`, then publishes the `build/` directory to the `gh-pages` branch via the `gh-pages` package).
3. Wait for the command to complete and check for errors.
4. Once successful, tell the user their project is live at: https://carycboy.github.io/treasure-game/
