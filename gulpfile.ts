import gulp from 'gulp';
import proxyGrabber from './src/core';

const grabber = new proxyGrabber();
gulp.task('method3', (done) => {
  grabber
    .method3(true)
    .then((res) => {
      console.log(res);
    })
    .catch(console.log)
    .finally(done);
});
gulp.task('method2', (done) => {
  grabber
    .method2(true)
    .then((res) => {
      console.log(res);
    })
    .catch(console.log)
    .finally(done);
});
gulp.task('method1', (done) => {
  grabber
    .method1(true)
    .then((res) => {
      console.log(res);
    })
    .catch(console.log)
    .finally(done);
});
