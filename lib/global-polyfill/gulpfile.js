const gulp = require('gulp'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat'),
      rename = require('gulp-rename');


gulp.task('default', function() {
  gulp.src([
    './src/object-assign-polyfill.js',
    './src/promise-polyfill.js',
    './src/whatwg-fetch.js'
  ])
    .pipe(concat('global-polyfill.dev.js'))
    .pipe(gulp.dest('../'))
    .pipe(uglify({
      mangle: {
        except: ['root'], // for ie8 bug
      },
      compress: false,  // 是否完全压缩
    }))
    .pipe(rename('global-polyfill.js'))
    .pipe(gulp.dest('../'))
});
