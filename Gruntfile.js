/* eslint-env node, es6 */
module.exports = function ( grunt ) {
	var conf = grunt.file.readJSON( 'extension.json' );

	grunt.loadNpmTasks( 'grunt-banana-checker' );
	grunt.loadNpmTasks( 'grunt-eslint' );
	grunt.loadNpmTasks( 'grunt-stylelint' );

	grunt.initConfig( {
		eslint: {
			options: {
				reportUnusedDisableDirectives: true,
				extensions: [ '.js', '.json' ],
				cache: true
			},
			all: [
				'**/*.js{,on}',
				'!{vendor,node_modules}/**'
			]
		},
		stylelint: {
			all: [
				'**/*.css',
				'**/*.less',
				'!{vendor,node_modules}/**'
			]
		},
		banana: conf.MessagesDirs
	} );

	grunt.registerTask( 'test', [ 'eslint', 'stylelint', 'banana' ] );
	grunt.registerTask( 'default', 'test' );
};
