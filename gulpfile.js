/*
 * gulpfile.js
 *
 * The gulp configuration file.
 *
 */

const {
	src,
	dest,
	parallel,
	series,
	watch,
	lastRun
} = require('gulp');


// Load plugins
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const browsersync = require('browser-sync').create();
const streamqueue = require('streamqueue');

// local variables

const node_modules_folder       = './node_modules/';
const dist_node_modules_folder  = './dist/node_modules/';
const node_dependencies         = Object.keys(require('./package.json').dependencies || {});

var buildMode = false;

function buildModeOn() {
	buildMode = true;
	return new Promise((resolve) => {
		console.log("Build Mode On");
		resolve();
	});
}

// Clean assets

function clear() {
	return src('./dist/content/*', {
		read: false
	})
	.pipe(clean());
}

// JS function 
function jsVendor() {

	const source = './src/content/js/libs/*.js';
	
	return src(source)
		.pipe(changed(source))

		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(dest('./dist/content/js/'))
		.pipe(browsersync.stream());
}

function js() {
	var order = streamqueue({ objectMode: true },
			src('./src/content/js/server-data.js'),
			src('./src/content/js/helpers.js'),
			src('./src/content/js/stepperClass.js'),
			src('./src/content/js/main.js'))

	if (buildMode) {
		console.log('Built');
		return order
		.pipe(concat('main.js'))
			//.pipe(uglify())
			.pipe(rename({
				extname: '.min.js'
			}))
			.pipe(dest('./dist/content/js/'))
			.pipe(browsersync.stream());
	} else {
		return order
		.pipe(concat('main.js'))
			//.pipe(uglify())
			.pipe(rename({
				extname: '.min.js'
			}))
			.pipe(dest('./dist/content/js/'))
			.pipe(browsersync.stream());

	}

		// auto merge all js files
		/*return src(source)
		.pipe(changed(source))

		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(dest('./dist/content/js/'))
		.pipe(browsersync.stream());*/
}

// HTML function 

function html() {
	const source = './src/**/*.html';

	return src(source)
		.pipe(changed(source))        
		.pipe(dest('./dist/'))
		.pipe(browsersync.stream());
}

// CSS function 

function css() {
	const source = './src/content/css/*.scss';

	return src(source)
		.pipe(changed(source))
		.pipe(sass())
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 versions'],
			cascade: false
		}))
		.pipe(concat('main.css'))
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(cssnano())
		.pipe(dest('./dist/content/css/'))
		.pipe(browsersync.stream());
}

// Optimize images

function img() {
	return src('./src/content/img/*')
		.pipe(imagemin())
		.pipe(dest('./dist/content/img'));
}

// Watch files

function watchFiles() {
	watch('./src/content/css/**', css);
	watch('./src/content/js/*', js);
	watch('./src/content/img/*', img);
	watch('./src/*.html', html);
}

// BrowserSync

function browserSync() {
	browsersync.init({
		server: {
			baseDir: './dist/'
		},
		port: 3000
	});
}

// node dependencies - not using

function vendor() {
	console.log(node_dependencies.length + " dependencies found");
	if (node_dependencies.length === 0) {
		return new Promise((resolve) => {
			console.log("No dependencies specified");
			resolve();
		});
	}

	return src(node_dependencies.map(dependency => node_modules_folder + dependency + '/**/*.*'), {
		base: node_modules_folder,
		since: lastRun('vendor')
	})
	.pipe(dest(dist_node_modules_folder))
	.pipe(browsersync.stream());
};


// Tasks to define the execution of the functions simultaneously or in series

exports.dev = series([clear, jsVendor, parallel(js, css, img, html)], parallel([watchFiles, browserSync]));
exports.clean = series(clear);
exports.vendor = series(vendor);
exports.build = series(clear, buildModeOn,parallel(jsVendor, js, css, img, html));
exports.default = series(clear, jsVendor, parallel(js, css, img, html));