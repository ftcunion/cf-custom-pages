import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import Mustache from "mustache";
import { minify } from "minify";

const template_dir = "template";
const output_dir = "dist";

// Read the view.json file and parse it
const template_views = JSON.parse(readFileSync("view.json", "utf8"));

// Read the template file
const template_mustache = readFileSync(`${template_dir}/template.mustache`, "utf8");

// Read the styles.css file
const styles_css = readFileSync(`${template_dir}/styles.css`, "utf8");

// Delete and recreate the output directory
try {
  // Attempt to remove the output directory if it exists
  rmSync(output_dir, { recursive: true, force: true });
  mkdirSync(output_dir, { recursive: true });
} catch (error) {
  console.error("Error creating output directory:", error);
}

// Create a string to store html for an index file
let index_html =
  '<!DOCTYPE html><html lang=en-US><meta charset=UTF-8><meta name=viewport content="width=device-width,initial-scale=1"><title>CF Pages Index &#x2d; FTC Union</title><ul>';

// Loop through each entry in the template_views
for (var template_view of template_views) {
  // Write the rendered output to a file named after the path value of the view if it exists
  if (template_view.path) {
    // Add the styles.css content to the template view
    template_view.css = styles_css;
    // Render the template with the current view data
    let rendered_content = Mustache.render(template_mustache, template_view);
    let file_path = `${output_dir}/${template_view.path}`;

    // Minify the content if specified
    if (template_view.minify) {
      minify
        .html(rendered_content, {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          minifyCSS: true,
          minifyJS: true,
        })
        .then((minified_content) => {
          // Write the minified content to the file
          writeFileSync(file_path, minified_content, { encoding: "utf8" });
        });
    }

    // Add a link to the index.html file
    index_html += `<li><a href="./${template_view.path}">${template_view.path}</a>: ${template_view.title}</li>`;
  }
}

// Write the index.html file
index_html += "</ul>";
writeFileSync(`${output_dir}/index.html`, index_html, { encoding: "utf8" });
