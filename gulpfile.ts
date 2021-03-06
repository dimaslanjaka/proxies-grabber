import gulp from 'gulp';
import proxyGrabber from './src/core';
import { join } from 'upath';
import { existsSync, mkdirSync } from 'fs';
import dom from 'gulp-jsdom';
import generateIndex from './src-docs';
import Bluebird from 'bluebird';

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

gulp.task('get', gulp.series('method1', 'method2', 'method3'));
function testProxy(done: any) {
  grabber.test(5).then((resx) => {
    let xx = [];
    resx.map((rx) => {
      xx = xx.concat(rx);
    });
    //console.log(xx);
    done();
  });
}
gulp.task('test', testProxy);
gulp.task('testmethod1', () => {
  return grabber.testMethod1(1);
});
gulp.task('check', (done) => {
  Bluebird.all(grabber.get())
    .map((r) => r.proxy)
    .map((s) => {
      return { proxy: s };
    })
    .then(grabber.testProxies)
    .each(async (item) => {
      console.log(item);
    })
    .finally(() => {
      if (typeof done == 'function') done();
    });
});

gulp.task('docs', async () => {
  const dest = join(__dirname, 'docs');
  if (!existsSync(dest)) mkdirSync(dest);
  await generateIndex();
  // @todo [docs] transform readme.md to index.html
  gulp.src(['readme.md', 'gulpfile*.{js,ts}'], { cwd: __dirname }).pipe(gulp.dest(dest));
  // @todo [docs] modify external links
  gulp
    .src('**/*.html', { cwd: dest })
    .pipe(
      dom((document: Document) => {
        Array.from(document.querySelectorAll('a')).forEach((el) => {
          el.target = '_blank';
          el.rel = 'nofollow noopener noreferer';
        });
      }),
    )
    .pipe(gulp.dest(dest));
});
