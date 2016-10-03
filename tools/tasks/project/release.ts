import * as gulp from 'gulp';
import * as runSequence from 'run-sequence';
import * as conventionalGithubReleaser from 'conventional-github-releaser';
import * as fs from 'fs';
import * as gulpLoadPlugins from 'gulp-load-plugins';

import Config from '../../config';

const plugins = <any>gulpLoadPlugins();

export = () => {

gulp.task('check-clean', function (cb: any) {
  plugins.git.exec({args: 'describe --dirty'}, function(err: any, stdout:string) {
    let is_dirty: boolean = false;
    if (err) {
      is_dirty = true;
    }
    if (stdout.search('dirty') !== -1) {
      is_dirty = true;
    }
    if (is_dirty) {
      cb('Repository has un-commited changes. Aborting.');
    }
    cb();
  });
});

gulp.task('changelog', function () {
  return gulp.src(Config.PROJECT_ROOT + '/CHANGELOG.md', {
    buffer: false
  })
    .pipe(plugins.conventionalChangelog({
      preset: 'angular' // Or to any other commit message convention you use.
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('github-release', function(done: any) {
  conventionalGithubReleaser({
    type: 'oauth',
    token: '0126af95c0e2d9b0a7c78738c4c00a860b04acc8' // change this to your own GitHub token or use an environment variable
  }, {
    preset: 'angular' // Or to any other commit message convention you use.
  }, done);
});

gulp.task('bump-version', function () {
// We hardcode the version change type to 'patch' but it may be a good idea to
// use minimist (https://www.npmjs.com/package/minimist) to determine with a
// command argument whether you are doing a 'major', 'minor' or a 'patch' change.
  return gulp.src(['./bower.json', './package.json'])
    .pipe(plugins.bump({type: 'patch'}).on('error', plugins.util.log))
    .pipe(gulp.dest('./'));
});

gulp.task('commit-changes', function () {
  return gulp.src('.')
    .pipe(plugins.git.add())
    .pipe(plugins.git.commit('[Prerelease] Bumped version number'));
});

gulp.task('push-changes', function (cb: any) {
  plugins.git.push('origin', 'master', cb);
});

gulp.task('create-new-tag', function (cb: any) {
  var version = getPackageJsonVersion();
  plugins.git.tag(version, 'Created Tag for version: ' + version, function (error: any) {
    if (error) {
      return cb(error);
    }
    plugins.git.push('origin', 'master', {args: '--tags'}, cb);
  });

  function getPackageJsonVersion () {
    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
  };
});

gulp.task('release', function (callback: any) {
  runSequence(
    'check-clean',
    'bump-version',
    'changelog',
    'commit-changes',
    'push-changes',
    'create-new-tag',
    'github-release',
    function (error: any) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('RELEASE FINISHED SUCCESSFULLY');
      }
      callback(error);
    });
});

};
