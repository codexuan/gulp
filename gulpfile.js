
var path = require('path'),
    gulp = require('gulp'),
    logSymbols = require('log-symbols'),
    // 自动处理全部错误信息，防止因为错误而导致 watch 不正常工作
    plumber = require('gulp-plumber'),
    mapStream = require('map-stream'),
    // 工具库
    gutil = require('gulp-util'),
    // 更新通知
    notify = require('gulp-notify'),
    // 重命名
    rename = require('gulp-rename'),
    // JS拼接
    concat = require('gulp-concat'),
    // web 服务
    connect = require('gulp-connect'),
    // 清空文件夹 or gulp-clean
    del = require('del'),
    // 只编译改过的文件，加快速度
    changed = require('gulp-changed');
	
// 编译sass
var sass = require('gulp-sass'),
// gulp-minify-css package has been deprecated, please use gulp-clean-css instead.
    minifyCss = require('gulp-clean-css'),
// 去掉css注释
    stripCssComments = require('gulp-strip-css-comments'),
// 格式化css
    cssbeautify = require('cssbeautify'),
// 自动添加兼容前缀
    autoprefixer = require('gulp-autoprefixer');

// 压缩script
var uglify = require('gulp-uglify'),
// 检查js语法
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
        .pipe(changed(cssDest,function(){extension:'.css'}))        
        /*
          browsers参数：
          ● last 2 versions: 主流浏览器的最新两个版本
          ● last 1 Chrome versions: 谷歌浏览器的最新版本
          ● last 2 Explorer versions: IE的最新两个版本
          ● last 3 Safari versions: 苹果浏览器最新三个版本
          ● Firefox >= 20: 火狐浏览器的版本大于或等于20
          ● iOS 7: IOS7版本
          ● Firefox ESR: 最新ESR版本的火狐
          ● > 5%: 全球统计有超过5%的使用率
          cascade: true/false; 是否美化属性值
          remove: true/false; 是否去掉不必要的前缀，默认true
        */
        .pipe(autoprefixer({
          browsers: ['last 2 versions','last 2 Explorer versions'],
          cascade: false
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
        .pipe(rename({ extname: '.min.css'}))
        .pipe(minifyCss({ 
            advanced: false,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie7',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true,//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
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
// 合并压缩js前先进行代码检查
gulp.task("script",["jshint"],function(){
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

