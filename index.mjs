import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import Mustache from "mustache";
import { minify } from "html-minifier";

const output_dir = "dist";

// Read the view.json file and parse it
const template_views = JSON.parse(readFileSync("view.json", "utf8"));

// Read the template file
const template_mustache = readFileSync("template.mustache", "utf8");

// Delete and recreate the output directory
try {
  // Attempt to remove the output directory if it exists
  rmSync(output_dir, { recursive: true, force: true });
  mkdirSync(output_dir, { recursive: true });
} catch (error) {
  console.error("Error creating output directory:", error);
}

// Loop through each entry in the template_views
for (const template_view of template_views) {
  // Write the rendered output to a file named after the path value of the view if it exists
  if (template_view.path) {
    // Render the template with the current view data
    let rendered_content = Mustache.render(template_mustache, template_view);
    let file_path = `${output_dir}/${template_view.path}`;

    // Minify the content if specified
    if (template_view.minify) {
      rendered_content = minify(rendered_content, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
      });
    }

    // Write the rendered content to the specified file path
    writeFileSync(file_path, rendered_content);
  }
}
