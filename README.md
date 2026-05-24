# H3XNOM4D.github.io

Personal website served at **https://h3xnom4d.github.io**

## Stack

Plain static HTML — no build tools, no framework, no compilation step.

| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `style.css` | Styles — dark header, firebrick accent |
| `script.js` | Auto-updating copyright year |

## Updating the site

Push to `main` — GitHub Pages picks it up automatically within ~60 seconds.

```bash
git add .
git commit -m "your message"
git push
```

---

## Renaming the GitHub username

If the GitHub username changes from `H3XNOM4D` to something else (e.g. `ialmir`), the following is required:

**What GitHub does automatically:**
- Renames all repos from `github.com/H3XNOM4D/*` → `github.com/<newname>/*`
- Renames this repo to `<newname>.github.io`
- Redirects old URLs temporarily (not permanent — do not rely on it)
- Site moves to `https://<newname>.github.io`

**What needs to be done manually:**

| Item | Action |
|---|---|
| GitHub username | Settings → Account → Change username |
| Local git remotes | Update every local repo (see commands below) |
| README badges / hardcoded links | Search repos for `H3XNOM4D` and update |
| External services | Webhooks, CI integrations, any links pointing to old URLs |

**Update local remotes after rename:**

```bash
# This repo
git remote set-url origin git@github.com:<newname>/<newname>.github.io.git

# Manifesto
git -C /Users/almir/Projects/Manifesto remote set-url origin git@github.com:<newname>/Manifesto.git
```

Replace `<newname>` with the new username throughout.
