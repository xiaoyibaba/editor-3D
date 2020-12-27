const { src, dest, series, parallel, watch, tree } = require('gulp');
const less = require('gulp-less');
const px2rem = require('gulp-px2rem-plugin');
const del = require('del');
const browserSync = require('browser-sync').create();
const { createProxyMiddleware  } = require('http-proxy-middleware');

const paths = require('./dir-vars');

function dev () {
  // 编译html
  function compileHtml (cb) {
    src(paths.src.html, {base: './src'})
      .pipe(dest(paths.dist.html))
      .on('end', function () {
        cb ? cb() : browserSync.reload();
      });
  }

  // 编译less
  function compileLess (cb) {
    src(paths.src.less)
      .pipe(less({dumpLineNumbers: "comments", env: "development", relativeUrls: true}))
      .pipe(px2rem({
        width_design: 1920,	// 设计稿宽度。默认值640
        pieces: 24,	// 将整屏切份（1920/80=24）。默认为10，相当于10rem = width_design(设计稿宽度)
        valid_num: 8,	// 生成rem后的小数位数。默认值4
        ignore_px: [],	// 让部分px不在转换成rem。默认为空数组
        ignore_selector: []	// 让部分选择器不在转换为rem。默认为空数组
      }))
      .pipe(dest(paths.dist.css))
      .on('end', function () {
        cb ? cb() : browserSync.reload();
      });
  }

  function clean (cb) {
    del('./dist', {force: true}).then(() => {
      console.log('dist is deleted')
      cb();
    })
  }

  // 文件监控
  function watchFn (cb) {
    let watcher = watch([
      paths.src.html,
      paths.src.allLess,
      paths.src.js,
      paths.src.lib,
      paths.src.images,
      paths.src.icons,
    ], {usePolling: true});

    watcher.on('change', (file) => {
      watchHandler('change', file);
    }).on('add', (file) => {
      watchHandler('add', file);
    }).on('unlink', (file) => {
      watchHandler('removed', file);
    });

    cb();
  }

  // 文件监控变化回调
  function watchHandler (type, file) {
    let target = file.split('.')[1];
    let tmp = file.replace(/src/, 'dist');
    switch (target) {
      case 'less':
        if (type === 'removed') {
          del([tmp], {force: true}).then(() => {
            console.log(`${file} is deleted in folder dist`);
          })
        } else {
          compileLess()
        }
        break;
      case 'html':
        if (type === 'removed') {
          del([tmp], {force: true}).then(() => {
            console.log(`${file} is deleted in folder dist`);
          })
        } else {
          compileHtml()
        }
        break;
      default:
        if (type === 'removed') {
          del([tmp], {force: true}).then(() => {
            console.log(`${file} is deleted in folder dist`);
          })
        } else {
          if (file.indexOf('lib')) {
            copyHandler('lib', file)
          } else if (file.indexOf('logic')) {
            copyHandler('js', file)
          } else if (file.indexOf('images')) {
            copyHandler('images', file)
          } else {
            copyHandler('icons', file)
          }
        }
        break;
    }
  }

  // copy 静态资源 和 js
  function copyHandler (type, file, cb) {
    if (typeof file === 'function') {
      cb = file;
      file = paths.src[type];
    }
    src(file, {base: './src'})
      .pipe(dest('./dist'))
      .on('end', function () {
          console.log(`copy ${type} success.`);
          cb ? cb() : browserSync.reload();
      });
  }

  let proxyServer1 = createProxyMiddleware(  // 跨域代理 - 需测试
    '/getStock', {
      target: 'http://demo.motcloub.cn:8082',
      changeOrigin: true
    }
  )

  // 开发服务器
  function devServer (cb) {
    browserSync.init({
      server: {
        baseDir: paths.dist.html,
        directory: true
      },
      startPath: 'index.html',
      port: 8080,
      reloadDelay: 0,
      timestamps: true,
      notify: {
        style: [
          "margin: 0",
          "padding: 5px",
          "position: fixed",
          "font-size: 10px",
          "z-index: 9999",
          "bottom: 0px",
          "right: 0px",
          "border-radius: 0",
          "border-top-left-radius: 5px",
          "background-color: rgba(60,197,31,0.5)",
          "color: white",
          "text-align: center"
        ]
      },
      middleware: [proxyServer1]
    });

    cb();
  }

  return series(
    clean,
    parallel(
      function (cb) {
        copyHandler('js', cb)
      },
      function (cb) {
        copyHandler('lib', cb)
      },
      function (cb) {
        copyHandler('images', cb)
      },
      function (cb) {
        copyHandler('icons', cb)
      },
      compileHtml,
      compileLess
    ),
    watchFn,
    devServer
  );
}

module.exports = dev;