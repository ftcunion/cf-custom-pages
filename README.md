# Cloudflare Custom Pages

**Create custom Cloudflare error pages that match the theme of your WordPress site.**

Cloudflare supports [custom error pages](https://developers.cloudflare.com/rules/custom-errors/). Raw WordPress pages are known not to be suitable as custom error pages because they reference unnecessary resources that Cloudflare embed in the page.[[1]](https://community.cloudflare.com/t/custom-error-page-how-to-insert-error-tokens-on-wordpress/202675/4)

This project applies post-processing to our 404 error page at [the FTC Union WordPress website](https://www.ftcunion.org) to clean out unnecessary styles and other references so that they are not too heavy. It then converts this processed page into a [mustache](https://mustache.github.io/) template that can be used to generate a complete set of custom error pages.

The current implementation relies on the [perfmatters](https://perfmatters.io?ref=1523) plugin for WordPress to remove links to RSS feeds, RSD, xmlrpc, and other unnecessary resources from the WordPress page. If you want to use this project without perfmatters, you will want to add some additional regex rules to `run/refresh.mjs`.

These custom error pages are hosted on GitHub Pages at [ftcunion.github.io/cf-custom-pages](https://ftcunion.github.io/cf-custom-pages/).

## Installation

To install, clone the repository and install dependencies using node package manager:

```sh
npm ci
```

## Usage

The project has two commands: 

- `npm run refresh`: regenerate template files (`template.mustache` and `styles.css`) by fetching and processing new content from the WordPress site.
- `npm run build`: apply `template.mustache` to generate static files using parameters from `view.json`.

The main file to edit is `view.json`. Fiddling with template files is encouraged, but any hand edits will be overwritten on the next refresh.
