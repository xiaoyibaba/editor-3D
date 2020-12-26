const { src, dest, series, parallel } = require('gulp');
const ejs = require('gulp-ejs');
const ejsHelper = require('tmt-ejs-helper');
const less = require('gulp-less');
const px2rem = require('gulp-px2rem-plugin');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const del = require('del');
const paths = require('./dir-vars');
const htmlReplace = require('gulp-html-replace');
const scriptDebug = require('gulp-strip-debug');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');

function build () {
  // 清除目录
  function clean (cb) {
    del(paths.dist.main, {force: true}).then(() => {
      cb();
    });
  }

  // 编译less
  function compileLess (cb) {
    src(paths.prodSrc.less)
      .pipe(less({relativeUrls: true}))
      .pipe(px2rem({
        width_design: 2304,	// 设计稿宽度。默认值640
        pieces: 24,	// 将整屏切份（1920/80=24）。默认为10，相当于10rem = width_design(设计稿宽度)
        valid_num: 8,	// 生成rem后的小数位数。默认值4
        ignore_px: [],	// 让部分px不在转换成rem。默认为空数组
        ignore_selector: []	// 让部分选择器不在转换为rem。默认为空数组
      }))
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 2 versions', 'Android >= 4.1']
      }))
      .pipe(rename({suffix: '.min'}))
      .pipe(cssmin({keepSpecialComments: '*'})) //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀.
      .pipe(rev())
      .pipe(dest(paths.dist.css))
      .pipe(rev.manifest())
      .pipe(dest('dist/rev/css'))
      .on('end', function () {
        console.log('compile less success');
        cb();
      });
  }

  // 编译logic - js
  function compileLogicJs (cb) {
    src(paths.prodSrc.js)
      .pipe(babel())
      .pipe(scriptDebug())
      .pipe(concat('biz.min.js'))
      .pipe(uglify())
      .pipe(rev())
      .pipe(dest(paths.dist.js))
      .pipe(rev.manifest())
      .pipe(dest('dist/rev/js'))
      .on('end', function () {
        console.log('compile js success');
        cb();
      });
  }

  // 编译dwz
  function compileDwzJs (cb) {
    src(paths.prodSrc.dwz)
      .pipe(babel())
      .pipe(scriptDebug())
      .pipe(concat('dwz.min.js'))
      .pipe(uglify())
      .pipe(dest(paths.dist.lib))
      .on('end', function () {
        console.log('compile js success');
        cb();
      });
  }

  // copy threejs
  function copyThreeJs (cb) {
    src(['src/js/threejs/**/*.*', '!src/js/threejs/*.js', 'src/js/threejs/*.min.js'])
      .pipe(dest(paths.dist.threejs))
      .on('end', function () {
        console.log('compile threejs success');
        cb();
      })
  }

  // 编译threejs
  function compileThreejs (cb) {
    src(['./src/js/threejs/*.js', '!src/js/threejs/three.min.js', '!src/js/threejs/inflate.min.js'])
      .pipe(babel())
      .pipe(concat('threejs.other.min.js'))
      .pipe(dest(paths.dist.threejs))
      .on('end', function () {
        console.log('compile threejs success');
        cb();
      })
  }

  // copy lib
  function copyLibJs (cb) {
    src('src/js/lib/**/*.js')
      .pipe(dest(paths.dist.lib))
      .on('end', function () {
        console.log('compile threejs success');
        cb();
      })
  }

  // 压缩图片
  function minImages (cb) {
    src(paths.prodSrc.images)
      // .pipe(imagemin())
      .pipe(dest(paths.dist.images))
      .on('end', function () {
        console.log('minImages images success');
        cb();
      });
  }

  // copy svg font data 等静态资源
  function copySvg (cb) {
    src(paths.prodSrc.icon)
      .pipe(dest(paths.dist.icon))
      .on('end', function () {
        console.log('copy svg success');
        cb();
      });
  }

  function copyFonts (cb) {
    src(paths.prodSrc.fonts)
      .pipe(dest(paths.dist.fonts))
      .on('end', function () {
        console.log('copy fonts success');
        cb();
      });
  }

  function copyData (cb) {
    src(paths.prodSrc.data)
      .pipe(dest(paths.dist.data))
      .on('end', function () {
        console.log('copy data success');
        cb();
      });
  }
  function copyModel (cb) {
    src(paths.prodSrc.model)
      .pipe(dest(paths.dist.model))
      .on('end', function () {
        console.log('copy model success');
        cb();
      });
  }

  // 编译html
  function compileHtml (cb) {
    src([paths.prodSrc.main, paths.prodSrc.component], {base: './src'})
      .pipe(ejs(ejsHelper()))
      .pipe(htmlReplace({
        threejs: './js/threejs/threejs.other.min.js',
        dwzjs: './js/lib/dwz.min.js',
        bizjs: './js/logic/biz.min.js',
        css: './css/ui.min.css'
      }))
      .pipe(dest(paths.dist.main))
      .on('end', function () {
        console.log('compile html success');
        cb();
      });
  }

  // 增加css\js版本号
  function version (cb) {
    src(['dist/rev/**/*.json', 'dist/*.html'])
      .pipe(revCollector({
        replaceReved: true
      }))
      .pipe(htmlmin({
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
      }))
      .pipe(dest(paths.dist.main))
      .on('end', function () {
        console.log('compile html success');
        del('dist/rev')
        cb();
      });
  }

  return series(
    clean,
    compileLess,
    compileLogicJs,
    compileDwzJs,
    copyThreeJs,
    compileThreejs,
    copyLibJs,
    minImages,
    parallel(
      copySvg,
      copyFonts,
      copyData,
      copyModel
    ),
    compileHtml,
    version
  );
};

module.exports = build;
