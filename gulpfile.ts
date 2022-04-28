import gulp from 'gulp';
import proxyGrabber from './src/core';
import markdown from 'gulp-markdown';
import rename from 'gulp-rename';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

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

gulp.task('docs', async () => {
  const dest = join(__dirname, 'docs');
  if (!existsSync(dest)) mkdirSync(dest);
  gulp
    .src('readme.md', { cwd: __dirname })
    .pipe(markdown())
    .pipe(
      rename(function (path) {
        // Returns a completely new object, make sure you return all keys needed!
        return {
          dirname: path.dirname,
          basename: 'index',
          extname: '.html',
        };
      }),
    )
    .pipe(gulp.dest('docs'));
});
