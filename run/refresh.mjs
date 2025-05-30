import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import extractCss from "extract-css";
import { PurgeCSS } from "purgecss";

const template_dir = "template";

// Download https://www.ftcunion.org use
fetch("https://www.ftcunion.org/404.html")
  .then((response) => response.text())
  .then((remoteHTML) => {
    extractCss(
      remoteHTML,
      {
        url: "./",
        applyStyleTags: true,
        removeStyleTags: true,
        applyLinkTags: false,
        removeLinkTags: false,
      },
      (err, html, cssStyle) => {
        if (err) {
          console.error("Error extracting CSS from style tags:", err);
          return;
        }

        extractCss(
          html,
          {
            url: "./",
            applyStyleTags: false,
            removeStyleTags: false,
            applyLinkTags: true,
            removeLinkTags: true,
            preserveMediaQueries: false,
          },
          (err, html, cssLink) => {
            if (err) {
              console.error("Error extracting CSS from link tags:", err);
              return;
            }

            // Put the Link CSS at the bottom (this is a hack!)
            var css = cssLink + cssStyle;

            /**********************************************************************
             * Process the HTML
             */

            // Remove SEO section and replace with style tag
            html = html.replace(
              /<!-- The SEO Framework by Sybre Waaijer -->.*?<!-- \/ The SEO Framework by Sybre Waaijer[^>]*?-->/s,
              "<style>/*{{{ css }}}*/</style>"
            );

            // Remove all preload and icon links
            html = html.replace(
              /<link[^>]*?\s+rel=["']?(preload|icon|apple-touch-icon)["']?\s+[^>]*?>/gs,
              ""
            );

            // Remove ver query strings
            html = html.replace(/\?ver=\w+/g, "");

            // Remove msapplication-TileImage
            html = html.replace(
              /<meta[^>]*?\s+name=["']?msapplication-TileImage["']?\s+[^>]*?>/gs,
              ""
            );

            // Remove various unnecessary properties and classes
            html = html.replace(
              /( aria-current="page"| page-id-\d+| wp-theme-stewart| wp-child-theme-ftcunion-stewart|error404 )/g,
              ""
            );

            // Set title to template value
            html = html.replace(
              /<title>.*?<\/title>/s,
              "<title>{{ title }} &#x2d; FTC Union</title>"
            );

            // Swap main content
            html = html.replace(
              /<main([^>]*?)>.*<\/main>/s,
              `<main$1>
                            {{#h1}}
                            <h1 style="margin-bottom:var(--wp--custom--margin--horizontal, 30px);"
                                class="wp-block-post-title">{{ title }}</h1>
                            {{/h1}}
                            <div
                                class="entry-content wp-block-post-content has-global-padding is-layout-constrained wp-block-post-content-is-layout-constrained">
                                {{#content}}
                                <p>{{{.}}}</p>
                                {{/content}}
                            </div></main>`
            );

            // Remove subsequent newlines
            html = html.replace(/\n[\n\s]+/g, "\n");

            /**********************************************************************
             * Process the CSS
             */

            // Delete all newlines in css
            css = css.replace(/\n/g, "");

            // Delete charset declaration from css
            css = css.replace(/@charset\s+['"]?[^'";]*['"]?;/, "");

            // Fix relative urls in css
            css = css.replace(
              /\.\/assets\/images\//g,
              "https://www.ftcunion.org/wp-content/themes/ftcunion-stewart/assets/images/"
            );

            // Use purifyCSS to remove unused CSS
            new PurgeCSS()
              .purge({
                content: [{ raw: html, extension: "html" }],
                css: [{ raw: css }],
                fontFace: true,
                variables: true,
                safelist: {
                  standard: [
                    "has-modal-open",
                    "is-menu-open",
                    ":first-child",
                    ":last-child",
                    ":not",
                  ],
                },
              })
              .then((purged) => {
                // Use the purged CSS
                css = purged[0].css;

                // Write the extracted CSS to a file, overwriting existing file
                writeFileSync(`${template_dir}/styles.css`, css, { encoding: "utf8" });
              });

            // Write the extracted HTML to a files, overwriting existing files
            writeFileSync(`${template_dir}/template.mustache`, html, { encoding: "utf8" });
          }
        );
      }
    );
  })
  .catch((error) => {
    console.error("Error fetching HTML:", error);
  });
