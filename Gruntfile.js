module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			build: {
				options: {
					style: 'compressed',
					precision: 8
				},
				files: {
					'css/list.css': 'css/list.scss'
				}
			}
		},
		uglify: {
			options: {
				mangle: {
					except: ['jQuery']
				}
			},
			my_build: {
				files: {
					'js/app.min.js': ['js/app.js']
				}
			}
		},
		cssmin: {
			compress: {
				files: {
					'css/list.min.css': ['css/list.css']
				}
			}
		},
		watch: {
			css: {
				files: ['css/*.scss'],
				tasks: ['sass', 'cssmin']
			},
			js: {
				files: ['js/app.js'],
				tasks: ['uglify']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.registerTask('default', ['sass', 'cssmin', 'uglify', 'watch']);


};