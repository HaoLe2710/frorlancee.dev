# Content model

The source of truth is `seed/seed.json`. It defines six collections, two taxonomies, site settings, and the `primary` menu. Public pages query EmDash on the server; publishing content does not require rebuilding the site.

## Collections

| Collection | Route / use | Fields and behavior |
|---|---|---|
| `homepage_content` | Non-routable home-page content; one current record | Hero eyebrow/title/highlight/description and CTAs; section titles/intros and visibility flags; process steps; contact callout; default SEO; footer note. Supports draft, revisions, and preview. |
| `services` | Non-routable service cards and `/services` detail/index content | Title, icon identifier, summary, description, audience, scope, features, CTA, `sort_order`, `visible`. Supports drafts, revisions, and search. |
| `projects` | `/projects/{slug}` | Title, summary, category, cover image, problem, solution, features, tech stack, result, Portable Text description, gallery, demo/repository URLs, featured flag and order. Supports drafts, revisions, preview, search, and SEO. |
| `posts` | `/blog/{slug}` | Title, excerpt, cover image, Portable Text body. Supports drafts, revisions, preview, search, and SEO. |
| `contact_links` | Non-routable public contact cards and footer links | Type, label, value, URL, visibility, and order. Publish only verified real contact details. |
| `pages` | `/{slug}`; used for About and Privacy | Title, summary, Portable Text body, and optional approach points. Supports drafts, revisions, preview, search, and SEO. |

Image fields are EmDash media objects (`{ src, alt }`), not URL strings. Project and post cover fields accept JPEG, PNG, WebP, and AVIF. Project gallery rows contain an image and optional caption. Render images with `<Image image={...} />` from `emdash/ui`.

## Taxonomies and settings

- `category` is hierarchical and attached to `posts`; the seed includes Product, Engineering, and Delivery terms.
- `tag` is the project tag taxonomy used by the project index. Taxonomy query names must match the seed exactly.
- The single `primary` menu contains the public navigation.
- Site title and tagline are EmDash site settings; the home page also reads its section content from `homepage_content`.

## Seed state

The locally applied seed is real site copy, not generated portfolio claims: one homepage entry, four service entries, and About and Privacy pages. There are no published projects, posts, public contact links, or uploaded media in the seed. The public UI shows intentional empty states until actual work and contact channels are entered.

The EmDash seed is embedded at build time as the initial site model. It is not a recurring migration that overwrites content on every deployment. EmDash's setup flow applies schema/structure and offers sample content only when selected; review the setup choice to avoid inserting template examples. See the [EmDash seed-file guide](https://docs.emdashcms.com/themes/seed-files/) and [CLI reference](https://docs.emdashcms.com/reference/cli/).

## Live rendering rules

- Keep CMS content routes server-rendered (`output: "server"`); do not use `getStaticPaths()` for these records.
- `entry.id` is the URL slug; `entry.data.id` is the database ID for APIs.
- If Astro route caching is enabled, pass each query's cache hint to `Astro.cache.set()`; use the `WithCacheHint` settings/menu/taxonomy variants where required.
- Blog and project routes return the site 404 when an entry is absent or not publicly readable.
- The Contact page only renders safe, visible links; email links must be `mailto:` URLs.
