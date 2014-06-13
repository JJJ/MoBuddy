module.exports = function( grunt ) {
	'use strict';

	// Load all grunt tasks
	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	// Project configuration
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		sass: {
			all: {
				files: {
					'assets/css/*.css': 'assets/sass/*.scss'
				}
			}
		},

		cssmin: {
			options: {
				banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
					' * <%= pkg.homepage %>\n' +
					' * Copyright (c) <%= grunt.template.today("yyyy") %>;' +
					' * Licensed GPLv2+' +
					' */\n'
			},
			minify: {
				expand: true,

				cwd: 'assets/css/',
				src: ['*.css'],

				dest: 'assets/css/',
				ext: '.min.css'
			}
		},
		watch:  {
			sass: {
				files: ['assets/sass/**/*.scss'],
				tasks: ['sass', 'cssmin'],
				options: {
					debounceDelay: 500
				}
			},

		}
	} );

	// Default task.
	grunt.registerTask( 'default', ['sass', 'cssmin'] );
	grunt.util.linefeed = '\n';
};