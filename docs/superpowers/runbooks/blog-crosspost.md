# Blog cross-post runbook

## One-time setup

1. **Generate a dev.to API key.**
   - Go to https://dev.to/settings/extensions
   - Section "DEV Community API Keys" -> create a new key named "hoatrinh-crosspost"
   - Copy the value.

2. **Add the key as a GitHub Actions secret.**
   - Repo Settings -> Secrets and variables -> Actions -> New repository secret
   - Name: `DEV_TO_API_KEY`
   - Value: paste from step 1.

3. **Confirm `SITE_URL` is set.**
   - Repo Settings -> Secrets and variables -> Actions -> Variables
   - Either confirm an existing `SITE_URL` variable, or accept the default
     (`https://hoatrinh.dev`) baked into the workflow.

4. **Register the RSS feed on daily.dev.**
   - Visit https://app.daily.dev/squads/new (Squad with RSS) or
     https://docs.daily.dev/docs/contributing/suggest-a-new-source
   - Provide `https://hoatrinh.dev/rss.xml` as the source.
   - Wait for daily.dev's crawler to ingest (typically <24h).

## First production run

The first push to `master` after the workflow lands will create one dev.to
article per existing non-draft, non-opt-out post. To preview the plan first:

```bash
SITE_URL=https://hoatrinh.dev bun run crosspost:devto -- --dry-run
```

If anything in the plan is wrong (wrong post, wrong title), set
`crosspost: false` in that post's frontmatter before merging.

## Recovery

The workflow is idempotent. Re-running `crosspost:devto` will:

- skip posts that round-trip identically to dev.to,
- update posts whose markdown body / title / cover / tags / description has
  changed,
- create posts that are missing on dev.to.

If a post is removed from dev.to manually, the next workflow run will recreate
it. To stop a post from being recreated, set `crosspost: false` in its
frontmatter; the planner will then emit `skip:opt-out` for it.
