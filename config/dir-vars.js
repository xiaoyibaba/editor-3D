const paths = {
  devSrc: {
    main: './src/index.html',
    less: './src/less/style.less',
    allLess: './src/less/**/*.less',
    script: './src/js/**/*.*',
    assets: './src/assets/**/*.*'
  },
  prodSrc: {
    main: './src/index.html',
    ejs: './src/components/**/*.ejs',
    component: './src/components/**/*.html',
    less: './src/less/ui.less',
    js: './src/js/logic/**/*.js',
    lib: './src/js/lib/**/*.js',
    images: './src/assets/images/**/*.{jpg,png,gif,svg}',
    icon: './src/assets/svg/**/*.{jpg,png,gif,svg}',
    fonts: './src/assets/fonts/**/*.{ttf,TTF}',
    data: './src/assets/data/**/*',
    model: './src/assets/model/**/*.*'
  },
  dist: {
    main: './dist',
    css: './dist/css',
    js: './dist/js/logic',
    lib: './dist/js/lib',
    images: './dist/assets/images',
    icon: './dist/assets/svg',
    fonts: './dist/assets/fonts'
  }
}

module.exports = paths;