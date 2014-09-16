var gulp       = require('gulp');
var concat     = require('gulp-concat');
var webserver  = require('gulp-webserver');
var jshint     = require('gulp-jshint');
var uglify     = require('gulp-uglify');
var plato      = require('gulp-plato');

gulp.task('build-concat', function() {
	gulp.src("./lib/*.js")
		.pipe(concat('angular-noVNC.js'))
		.pipe(gulp.dest('./dist'))
});

gulp.task('build-uglify', function() {
	gulp.src("./lib/*.js")
		.pipe(concat('angular-noVNC.min.js'))
		.pipe(uglify({
			mangle: true,
		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('build', ['build-concat', 'build-uglify']);

gulp.task('webserver', function() {
	gulp.src('./')
		.pipe(webserver({
			livereload: true,
			open: true
		}));
});


gulp.task('watch', function () {
	gulp.watch(['./lib/*.js', 'index.html'], ['build']);
});

var jshintOpts = {
	strict   : true,
	unused   : true,
	curly    : true,
	eqeqeq   : true,
	undef    : true,
	eqnull   : true,
	nonew    : true,
	plusplus : false,
	browser  : true,
	noempty  : true,
	newcap   : false,
	immed    : true,
	latedef  : true,
	quotmark : true,
	multistr : true,
	bitwise  : false,
	indent   : 2,
	maxlen   : 150,
	globals  : {
		angular: true,
		console: true,
		Base64: true,
		Websock_native: true,
		ActiveXObject: true,
		escape: true,
		keysyms: true,
	}
};


gulp.task('lint', function() {
	return gulp.src("./lib/*.js")
		.pipe(jshint(jshintOpts))
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('plato', function () {
	return gulp.src('./lib/*.js')
		.pipe(plato('plato', {
			jshint: {
				options: jshintOpts
			},
			complexity: {
				trycatch: true
			}
		}));
});

gulp.task('default', ['build', 'webserver', 'watch']);
