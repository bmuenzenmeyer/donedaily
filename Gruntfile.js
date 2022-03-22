const sass = require("node-sass")

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    sass: {
      options: {
        implementation: sass,
        sourceMap: true,
      },
      dist: {
        files: {
          "css/list.css": "css/list.scss",
        },
      },
    },
    uglify: {
      options: {
        mangle: {
          reserved: ["jQuery"],
        },
      },
      my_build: {
        files: {
          "js/app.min.js": ["js/app.js"],
        },
      },
    },
    cssmin: {
      compress: {
        files: {
          "css/list.min.css": ["css/list.css"],
        },
      },
    },
    watch: {
      css: {
        files: ["css/*.scss"],
        tasks: ["sass", "cssmin"],
      },
      js: {
        files: ["js/app.js"],
        tasks: ["uglify"],
      },
    },
  })

  grunt.loadNpmTasks("grunt-sass")
  grunt.loadNpmTasks("grunt-contrib-cssmin")
  grunt.loadNpmTasks("grunt-contrib-uglify")
  grunt.loadNpmTasks("grunt-contrib-watch")

  grunt.registerTask("default", ["sass", "cssmin", "uglify", "watch"])
}
