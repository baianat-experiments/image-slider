/**
 * gulp modules
 */
const gulp = require('gulp');
const buble = require('gulp-buble');
const rollup = require('gulp-rollup');
const stylus = require('gulp-stylus');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

/**
 * browser Sync
 */
const browserSync = require('browser-sync');
const reload = browserSync.reload;

/**
 * scripts functions
 */
 function flow(env) {
   let gulpTask = gulp.src('./src/js/**/*.js')
     .pipe(plumber())
     .pipe(rollup({
       rollup: require('rollup'),
       entry: './src/js/flow.js',
       format: 'umd',
       moduleName: 'flow'
     }))
     .pipe(buble())
     .pipe(rename({
       basename: "flow",
       suffix: env === 'production' ? '.min' : '',
       extname: ".js"
      }));
   if (env === 'production') gulpTask = gulpTask.pipe(uglify());
   gulpTask.pipe(gulp.dest('./dist/js'))
   .pipe(reload({stream: true}));
 };

function cube3d(env) {
  let gulpTask = gulp.src('./src/js/**/*.js')
    .pipe(plumber())
    .pipe(rollup({
      rollup: require('rollup'),
      entry: './src/js/cube3D.js',
      format: 'umd',
      moduleName: 'Cube3D'
    }))
    .pipe(buble())
    .pipe(rename({
      basename: "cube3D",
      suffix: env === 'production' ? '.min' : '',
      extname: ".js"
     }));
  if (env === 'production') gulpTask = gulpTask.pipe(uglify());
  gulpTask.pipe(gulp.dest('./dist/js'))
  .pipe(reload({stream: true}));
};


/**
 * Scripts task
 */
gulp.task('scripts', function () {
  flow();
  cube3d();
});

gulp.task('production:scripts', function () {
  cube3d('production');
  flow('production');
});

/**
 * Styles task
 */
gulp.task('styles', function () {
  gulp.src('./src/stylus/app.styl')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus())
    .pipe(rename({
        basename: "flow",
        extname: ".css"
    }))
    .pipe(autoprefixer('last 5 version'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(reload({stream: true}));
});

/**
 * production styles task
 */
gulp.task('production:styles', () => {
  gulp.src('./src/stylus/app.styl')
    .pipe(stylus({
      compress: true
    }))
    .pipe(rename({
      basename: "flow",
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(autoprefixer('last 5 version'))
    .pipe(gulp.dest('./dist/css'));
  });

/**
 * production  task
 */
 gulp.task('production', ['styles', 'scripts', 'production:scripts', 'production:styles']);

 /**
  * Browser-sync task
  */
gulp.task('browser-sync', function () {
    browserSync.init({
       proxy: "dolober.dev/flow/index.html"
   });
})

/**
 * Watch task
 */
gulp.task('watch', function () {
    gulp.watch('./src/js/**/*.js', ['scripts']);
    gulp.watch('./src/stylus/**/*.styl', ['styles']);
    gulp.watch('./**/*.html', function () {
        gulp.src('./**/*.html').pipe(reload({stream: true}));
    });
});

/**
 * Default task
 */
gulp.task('default', ['scripts', 'styles', 'browser-sync', 'watch']);
