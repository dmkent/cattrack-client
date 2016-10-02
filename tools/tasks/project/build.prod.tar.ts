import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import { join } from 'path';

import Config from '../../config';

const plugins = <any>gulpLoadPlugins();

/**
 * Tar up the prod dist dir
 */
export = () => {
  return gulp.src(join(Config.PROD_DEST, '**/*'))
        .pipe(plugins.tar('cattrack-client.tar'))
        .pipe(plugins.gzip())
        .pipe(gulp.dest(Config.DIST_DIR));
};
