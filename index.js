"use strict";

var debug = require('debug')('metalsmith-unused-images');
var cheerio = require('cheerio');
var path = require('path');
var fs = require('fs');

module.exports = function (opts) {

  opts = opts || {};
  opts.logfile = opts.logfile || "unused_images.log";
  opts.console = (typeof(opts.console) == "undefined") ? false : opts.console;
  opts.remove = (typeof(opts.remove) == "undefined") ? false : opts.remove;
  opts.extensions = opts.extensions || [ "gif","png","jpg","jpeg" ];

  // Plugin that scours the HTML output for images that aren't referenced,
  // and either logs or removes the unused ones.

  var image_filename_filter = function(filename) { 
    var match = false;
    opts.extensions.forEach(
      function(ext) { 
        match = match || filename.toLowerCase().endsWith("." + ext.toLowerCase());
      });
    return match;
  }

  return function unhide(files, metalsmith, done)
  {
    Object.keys(files)
    .filter(image_filename_filter)
    .forEach(function(fname) {
      var normalized_name = fname.replace(/\\/g,"/");
      files[normalized_name] = files[fname];
      delete files[fname];
    });
    Object.keys(files)
    .filter((filename) => filename.endsWith(".htm") || filename.endsWith(".html") )
    .forEach(function(fname) {
      var $ = cheerio.load(files[fname].contents.toString());
      var imgs = $("img");
      imgs.each(function(index, img_element) {
        var img_src = $(img_element).attr("src");
        if (path.isAbsolute(img_src)) { return true; }
        var resolved_path = path.normalize( path.join( path.dirname(fname), img_src ) ).replace(/\\/g,"/");
        var match = files[resolved_path];
        if (match)
        {
          match.is_used = true;
        }
      });
    });
    var unused_list = [];
    Object.keys(files)
    .filter(image_filename_filter)
    .forEach(function(fname) {
      if (!files[fname].is_used)
      {
        unused_list.push(fname);
        var msg = "Unused image: " + fname;
        debug(msg);
        if (opts.console)
          console.log(msg);
        if (opts.remove)
        {
          delete files[fname];
          var absfname = path.join(metalsmith.source(), fname);
          if (fs.existsSync(absfname))
            fs.unlinkSync(absfname);
        }
      }
    });
    if (opts.logfile && unused_list.length)
    {
      var absfname = path.join(metalsmith.destination(), opts.logfile);
      fs.writeFileSync(absfname, unused_list.join("\n"));
    }
    done();
  }
  
}
