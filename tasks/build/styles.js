/* eslint-disable global-require, import/no-extraneous-dependencies */
import path from 'path';
import postcssDefaultPlugins from '../../tools/postcss-plugins';

export default function factory($, env) {
    return function task(done) {
        return $.gulp.src([
            path.join(env.paths.input.styles, '/**/*.css')
        ])
            .pipe($.postcss(postcssDefaultPlugins(env)))
            .pipe($.if(env.build.minify, $.cssnano()))
            .pipe($.concat('global.css'))
            .pipe($.gulp.dest(env.paths.output.styles))
            .on('error', done);
    };
}
