var path = require('path'),
    gulp = require('gulp'),
    logSymbols = require('log-symbols'),
    plumber = require('gulp-plumber'),
    mapStream = require('map-stream'),
    gutil = require('gulp-util'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    del = require('del');
	
// 编译压缩sass
var sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
// 去掉css注释
    stripCssComments = require('gulp-strip-css-comments'),
    cssbeautify = require('cssbeautify');
// var autoprefixer = require('gulp-autoprefixer');

// 压缩script
var uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint');
// 压缩image
var imagemin = require('gulp-imagemin');
// 压缩 html
var htmlmin = require('gulp-htmlmin');
// 压缩font
var fontmin = require('gulp-fontmin');
// 启动服务
var browsersync = require('browser-sync');

var sassSrc = ['src/sass/style/*.scss'],
    cssDest = 'dist/css',
    scriptSrc = ['src/script/**/*.js'],
    scriptDest = 'dist/script',
    imageSrc = 'src/image/*',
    imageDest = 'dist/image',
    fontSrc = 'src/fonts/*',
    fontDest = 'dist/fonts',
    htmlSrc = ['src/html/*.html'],
    htmlDest = 'dist/html';

gulp.task("clean",function(cb){
  del(['dist/*'],cb)
})
gulp.task('cleanScript',function(cb){
  del(scriptDest,cb)
})
gulp.task('cleanCss',function(cb){
  del(cssDest,cb)
})
gulp.task("sass",function(){
  gulp.src(sassSrc)
        .pipe(plumber({
            errorHandler: reportError
        }))
        .pipe(mapStream(function(file, cb) {
            logPath(file);
            cb(null, file);
        }))
        .pipe(sass())
        .pipe(stripCssComments())
        // css格式化、美化（因为有f2ehint，故在此不再做语法等的检查与修复）
        .pipe(mapStream(function(file, cb) {
            // 添加css代码的格式化
            var cssContent = file.contents.toString();

            if (/\.(css|sass|scss)/.test(path.extname(file.path))) {
                file.contents = new Buffer(cssbeautify(cssContent, {
                    indent: '    ',
                    openbrace: 'end-of-line',
                    autosemicolon: true
                }));
            }

            cb(null, file);
        }))
        .pipe(rename(function(path){
          path.dirname = '';
          path.extname = '.min.css';
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest(function(file){
          return cssDest;
        }));
});
// 检查js代码
gulp.task("jshint",function(){
  gulp.src(scriptSrc)
      .pipe(jshint())
      .pipe(jshint.reporter());
});
// 合并压缩js
gulp.task("script",function(){
  gulp.src(scriptSrc)
      .pipe(plumber({
          errorHandler: reportError
      }))
      .pipe(mapStream(function(file, cb) {
          logPath(file);
          cb(null, file);
      }))
      // .pipe(concat("build.js"))
      // .pipe(gulp.dest(scriptDest))
      .pipe(rename(function(path){
        path.dirname = '';
        path.extname = '.min.js';
      }))
      .pipe(uglify())
      .pipe(gulp.dest(scriptDest));
});
// 压缩图片
gulp.task("image",function(){
  gulp.src(imageSrc)
      .pipe(imagemin())
      .pipe(gulp.dest(iamgeDest));
})
// 压缩html
gulp.task("html",function(){
  var htmlOpts = {
        removeComments: true,
        // collapseWhitespace: true,
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
      };
  gulp.src(htmlSrc)
      .pipe(htmlmin(htmlOpts))
      .pipe(gulp.dest(htmlDest))
})
// 压缩font
gulp.task("fontmin",function(){
  gulp.src(fontSrc)
      .pipe(fontmin())
      .pipe(gulp.dest(fontDest))
})
// 启动服务
gulp.task("webserver",function(){
  connect.server({
    livereload: true,
    port: 2888
  });
})

gulp.task("watch",function(){
  gulp.watch(sassSrc,['sass']);
  gulp.watch(scriptSrc,['script']);
  // gulp.watch(htmlSrc,['html']);
  // gulp.watch(imageSrc,['image']);
});

gulp.task('default',['clean','sass','script'])

/**
    ########### helpers ###########
*/

function logPath(file) {
    console.log( `build: ${file.path}`);
}

function reportError(error) {
    var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

    notify({
        title: '编译失败 [' + error.plugin + ']',
        message: lineNumber + '具体错误请看控制台！',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep();

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.white.bgRed;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    report += chalk('PROB:') + ' ' + error.message + '\n';
    if (error.lineNumber) {
        report += chalk('LINE:') + ' ' + error.lineNumber + '\n';
    }
    if (error.fileName) {
        report += chalk('FILE:') + ' ' + error.fileName + '\n';
    }
    console.error(report);

    // Prevent the 'watch' task from stopping
    this.emit('end');
}
