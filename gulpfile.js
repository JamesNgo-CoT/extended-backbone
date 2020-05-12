const del = require('del');
const getport = require('get-port');
const gulp = require('gulp');

const babel = require('gulp-babel');
const cleancss = require('gulp-clean-css');
const connect = require('gulp-connect');
const eslint = require('gulp-eslint');
const open = require('gulp-open');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

////////////////////////////////////////////////////////////////////////////////

const dist = './dist/';
function clean() {
	return del(dist);
}

module.exports.clean = clean;

////////////////////////////////////////////////////////////////////////////////

const buildJsSrc = './src/**/*.js';
function buildJs() {
	return gulp.src(buildJsSrc, { since: gulp.lastRun(buildJs) })
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(babel())
		.pipe(gulp.dest(dist))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(rename((path) => path.basename += '.min'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist))
		.pipe(connect.reload());
}

const buildCssSrc = 'src/**/*.css';
function buildCss() {
	return gulp.src(buildCssSrc, { since: gulp.lastRun(buildCss) })
		.pipe(gulp.dest(dist))
		.pipe(sourcemaps.init())
		.pipe(cleancss())
		.pipe(rename((path) => path.basename += '.min'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist))
		.pipe(connect.reload());
}

const buildScssSrc = 'src/**/*.scss';
function buildScss() {
	return gulp.src(buildScssSrc, { since: gulp.lastRun(buildScss) })
		.pipe(sass())
		.pipe(gulp.dest(dist))
		.pipe(sourcemaps.init())
		.pipe(cleancss())
		.pipe(rename((path) => path.basename += '.min'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist))
		.pipe(connect.reload());
}

const buildOtherSrc = ['src/**/*.html'];
function buildOther() {
	return gulp.src(buildOtherSrc, { since: gulp.lastRun(buildOther) })
		.pipe(gulp.dest(dist))
		.pipe(connect.reload());
}

const build = gulp.parallel(buildJs, buildCss, buildScss, buildOther);
module.exports.build = gulp.series(clean, build);

////////////////////////////////////////////////////////////////////////////////

function watchJs() {
	gulp.watch(buildJsSrc, buildJs);
}

function watchCss() {
	gulp.watch(buildCssSrc, buildCss);
}

function watchScss() {
	gulp.watch(buildScssSrc, buildScss);
}

function watchOther() {
	gulp.watch(buildOtherSrc, buildOther);
}

const watch = gulp.parallel(watchJs, watchCss, watchScss, watchOther);
module.exports.watch = gulp.series(clean, build, watch);

////////////////////////////////////////////////////////////////////////////////

function serve() {
	return Promise.resolve().then(() => {
		const portIndex = process.argv.indexOf('--port');
		if (portIndex !== -1 && process.argv[portIndex + 1]) {
			return process.argv[portIndex + 1];
		}

		return getport({ port: getport.makeRange(8080, 9999) });
	}).then((port) => {
		let root = '.';

		const rootIndex = process.argv.indexOf('--root');
		if (rootIndex !== -1 && process.argv[rootIndex + 1]) {
			root = process.argv[rootIndex + 1];
		}

		connect.server({ livereload: true, port, root });

		let browser;

		const browserIndex = process.argv.indexOf('--browser');
		if (browserIndex !== -1 && process.argv[browserIndex + 1]) {
			browser = process.argv[browserIndex + 1];
		}

		gulp.src(__filename)
			.pipe(open({ app: browser, uri: `http://localhost:${port}/` }));
	});
}

module.exports.serve = gulp.series(clean, build, gulp.parallel(watch, serve));

////////////////////////////////////////////////////////////////////////////////

module.exports.default = module.exports.build;
