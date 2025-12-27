# Cloudflare Pages Deployment Guide

## Recommended: Automatic Deployment (No Deploy Command)

If using Cloudflare Pages with GitHub integration:

1. **Build command:** `npm run build`
2. **Build output directory:** `build`
3. **Deploy command:** (leave empty - Pages deploys automatically)

Pages will automatically deploy your site after the build completes.

## Alternative: Manual Deploy Command

If you need a custom deploy command, use:

```bash
npx wrangler pages deploy build --project-name=everything-applied-ds
```

**Note:** You'll need to set your Cloudflare API token as an environment variable:
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- Or authenticate with `wrangler login` first

## Configuration

The `wrangler.toml` file includes:
- `pages_build_output_dir = "build"` - Tells Pages where to find built files
- `name = "everything-applied-ds"` - Project name

## Troubleshooting

- **Error: "Must specify a project name"** → Add `--project-name=everything-applied-ds` to deploy command
- **Error: "Missing pages_build_output_dir"** → Already fixed in `wrangler.toml`
- **Build succeeds but deploy fails** → Remove deploy command and let Pages handle it automatically

