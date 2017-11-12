
const gulp = require('gulp');
const iconfont = require('gulp-iconfont');
var runTimestamp = Math.round(Date.now()/1000);

gulp.task('default', function(){
  return gulp.src(['./icons/*.svg'])
    .pipe(iconfont({
      fontName: 'iconfont', // required
      prependUnicode: true, // recommended option
      formats: ['ttf', 'woff'], // default, 'woff2' and 'svg' are available
      timestamp: runTimestamp, // recommended to get consistent builds when watching files
      normalize: true,
      fontHeight: 1000,
      centerHorizontally: true,
      // fixedWidth:true,
    }))
    .on('glyphs', function(glyphs, options) {
        // CSS templating, e.g.
        console.log(glyphs, options);
      })
    .pipe(gulp.dest('.'));
});