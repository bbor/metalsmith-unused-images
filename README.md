# metalsmith-unused-images

A plugin for [Metalsmith](http://www.metalsmith.io/) that finds unused images in your source, and optionally removes them.

## Motivation

When you have a large site with content that gets updated and removed periodically, you can end up with a lot of unused images in your source folder. This is particularly true for product documentation -- icons change, screen captures change, features get removed, and we don't always delete the images that are no longer needed. A) we forget. B) even if we remember, it's hard to find which images are no longer referred to in any pages.

## Usage

Like any Metalsmith plugin, you include it in your build chain as follows:

```js
var unused_images = require("metalsmith-unused-images")

Metalsmith(__dirname)
  .source("src")
  .destination("output")
  .use(markdown())
  .use(metalsmith-unused-images())
  // ... whatever other plugins you need.
```

## Default behavior

- The plugin reads all files with `.htm` and `.html` extensions, and checks the `src` attribute of all `<img>` tags.
- If the src is a relative path, it looks for a file with a matching name in the source folder.
- If the src image is found, it is marked for keeping.
- Any images not marked after looking through all HTML files are considered unused.
- By default, the plugin reports unused files in its `debug` output. (Add the [metalsmith-debug](https://github.com/mahnunchik/metalsmith-debug) plugin to your build chain to get this debug output).
- If it finds unused images, it also generates a file called `unused_images.log` in the destination directory.

## Options

```js
{
  logfile:"unused_images.log",     // Customize the log filename, relative to destination. Use nil to skip.
  console:false,                   // Use true to write unused images to console.log as well as the debug stream.
  remove:false,                    // Use true to have the plugin remove unused files from your source folder.
  extensions:["gif","jpg","jpeg","png"]
                                   // The list of file extensions that the plugin will check when looking for
                                   // unused files at the end of the process.
  
}
```

