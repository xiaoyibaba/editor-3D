const { task } = require('gulp');
const del = require('del');
const dev = require('./config/dev.config');
const build = require('./config/build.config');

if (process.env.NODE_ENV === 'development') {
  task('dev', dev());
} else if (process.env.NODE_ENV === 'production') {
  task('build', build());
} else {
  task('clean', function (cb) {
    del('./dist', {force: true}).then(() => {
      cb();
    });
  })
}


