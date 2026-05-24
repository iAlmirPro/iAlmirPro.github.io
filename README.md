# iAlmirPro.github.io

Personal website served at **https://ialmirpro.github.io**
*(formerly H3XNOM4D — https://h3xnom4d.github.io)*

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

If the GitHub username changes from `iAlmirPro` to something else, the following is required:

**What GitHub does automatically:**
- Renames all repos from `github.com/iAlmirPro/*` → `github.com/<newname>/*`
- Renames this repo to `<newname>.github.io`
- Redirects old URLs temporarily (not permanent — do not rely on it)
- Site moves to `https://<newname>.github.io`

**What needs to be done manually:**

| Item | Action |
|---|---|
| GitHub username | Settings → Account → Change username |
| Local git remotes | Update every local repo (see commands below) |
| README badges / hardcoded links | Search repos for `iAlmirPro` and update |
| External services | Webhooks, CI integrations, any links pointing to old URLs |

**Update local remotes after rename:**

```bash
# This repo
git remote set-url origin git@github.com:<newname>/<newname>.github.io.git

# Manifesto
git -C /Users/almir/Projects/Manifesto remote set-url origin git@github.com:<newname>/Manifesto.git

# MyAINewsAgent
git -C /Users/almir/Projects/MyAINewsAgent remote set-url origin git@github.com:<newname>/MyAINewsAgent.git

# TDoc
git -C /Users/almir/Projects/TDoc remote set-url origin git@github.com:<newname>/tdoc.git

# VdB
git -C /Users/almir/Projects/VdB remote set-url origin git@github.com:<newname>/VdB-Reporting-Script.git
```

Replace `<newname>` with the new username throughout.
