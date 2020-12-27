const paths = {
  src: {
    html: './src/index.html',
    less: './src/less/style.less',
    allLess: './src/less/**/*.less',
    js: './src/js/logic/**/*.js',
    lib: './src/js/lib/**/*',
    images: './src/assets/images/**/*.{jpg,png,gif,svg}',
    icons: './src/assets/icons/**/*.{jpg,png,gif,svg}',
  },
  dist: {
    html: './dist',
    css: './dist/css',
    js: './dist/js/logic',
    lib: './dist/js/lib',
    images: './dist/assets/images',
    icon: './dist/assets/svg'
  }
}

module.exports = paths;