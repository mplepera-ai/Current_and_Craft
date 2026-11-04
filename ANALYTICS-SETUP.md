
# Current & Craft — GA4 Product Analytics Setup

Tracking code: assets/analytics.js. Measurement ID: G-64ZL6JMETJ.

## What is measured
This tracks activity ONLY on the public company website (currentandcraft.net or www.currentandcraft.net).
It does not instrument the separately hosted apps or count direct app visits. A click on an app link is
a **launch attempt**, not proof that the application finished loading.

| Event | Meaning | Main parameters |
|---|---|---|
| page_view | Public page loaded | site_section, page_title |
| product_impression | A product card is at least 20% visible in the viewport | product_name, product_category, placement |
| product_launch_click | A known software link is clicked | product_name, product_category, placement, destination_domain |
| navigation_click | Main navigation link clicked | navigation_target |
| category_click | Homepage product category card clicked | target_section |
| cta_click | Explore-products CTA clicked | cta_name |
| scroll_depth | Scroll milestone: 25%, 50%, 75%, 90% | scroll_milestone |

All site events include site_section and page_location without query strings, and page_referrer
reduced to the source origin only. The destination_domain contains no URL path or query.

Products: CommonSlate, Curious Cove, Incident Lab, StormRoute, Reamwright, Copestone, Tiedown,
SiteConnect, LiftWorks, Mainline.

Placements: homepage_flagship, games_listing, engineering_listing, water_sewer_suite.

## One-time GA4 configuration

1. Open https://analytics.google.com/ and select the Current & Craft property.
2. Go to **Admin → Data display → Custom definitions → Create custom dimension**.
3. Create the following EVENT-scoped custom dimensions, using these exact parameter names:

| Dimension name | Event parameter |
|---|---|
| Product name | product_name |
| Product category | product_category |
| Placement | placement |
| Site section | site_section |
| Destination domain | destination_domain |
| Scroll milestone | scroll_milestone |
| Navigation target | navigation_target |
| Target section | target_section |
| CTA name | cta_name |

4. Custom dimensions begin reporting after registration and processing, not retroactively. Realtime
and DebugView may show events sooner.
5. Check **Admin → Data streams → Web → Enhanced measurement**. Turn off automatic Outbound clicks
unless you verify the actual outbound URLs/queries collected are compatible with the privacy notice.
The standard Google 90% scroll event can coexist with the custom scroll_depth milestones, but do not
combine them into the same totals.
6. Review property Data retention settings and regional privacy/consent requirements. A default-on
opt-out implementation alone may not suffice in regions requiring prior consent.

## Report: which products are most popular?

Create a GA4 **Explore → Blank → Free form** exploration:

- Dimensions: Product name, Product category, Placement, Event name
- Metrics: Event count, Total users (or Active users)
- Rows: Product name
- Values: Event count
- Filter: Event name exactly matches product_launch_click
- Sort: descending Event count; date range: last 30 or 90 days

This ranks **clicks to open products from the company website**.

For product-card exposure, change the filter to product_impression.
For interest by site placement, put Placement below Product name in rows.
For directional click-through, compare product_launch_click vs product_impression by product.
This is not a verified conversion rate (users can click repeatedly, and impressions are card-level).

Other GA4 reports:
- Most popular company pages: Event count for page_view, segmented by Site section.
- Acquisitions: Reports → Acquisition → Traffic acquisition. Referral URLs are intentionally sanitized.
- Navigation interest: navigation_click, segmented by Navigation target.
- Scrolling: scroll_depth, segmented by Site section and Scroll milestone.
- Basic site behavior: Active users, sessions, engagement rate, average engagement time, devices.

## Test before deployment

- [ ] Main pages and privacy page load with no JavaScript errors.
- [ ] One page_view is sent per full page load to the intended GA4 property.
- [ ] Opening a product button sends product_launch_click with the proper name and placement.
- [ ] Opening the button still goes to exactly the same app URL.
- [ ] A product card entering the viewport sends one product_impression per page view.
- [ ] Navigation, category clicks and scroll milestones send their expected events.
- [ ] Website Privacy Notice → Turn analytics off stops further marketing-site tracking;
      refreshing does not load the Google tag.
- [ ] Turn analytics on resumes sending page views.
- [ ] Localhost or non-company-host preview does not send events.
- [ ] Test production on currentandcraft.net and www.currentandcraft.net.
- [ ] Verify Enhanced Measurement settings, including outbound link URL handling.

NOTE: Browser localStorage preferences do not automatically transfer across the bare
and www subdomains. Prefer redirecting www to the canonical host; otherwise build shared
cross-subdomain preference handling to ensure the opt-out follows the visitor.

## Future phase: confirmed app opens / usage

To measure successful application loads, each app needs its own privacy-reviewed app_ready
instrumentation. The company website cannot observe app readiness on another origin.
Any app instrumentation requires its own disclosure and cross-domain preference design.
Do not install GA4 on authenticated CommonSlate/child accounts or engineering customer workspaces
without separate privacy and data minimization review. Never transmit account data, family details,
project data, engineering inputs, uploaded files, or arbitrary text as event parameters.

This PR updates GitHub source only and does not configure the GA4 property on Google's servers.
