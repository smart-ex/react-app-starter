/* eslint-disable global-require, import/no-extraneous-dependencies */
import path from 'path';

export default function factory($, env) {
    const customOpts = {
        entries: [path.join(env.paths.input.scripts, '/index.js')],
        debug: env.build.debug
    };
    const opts = Object.assign({}, $.watchify.args, customOpts);
    let b;

    if (env.development.watch) {
        b = $.watchify($.browserify(opts));
    } else {
        b = $.browserify(opts);
    }

    b.transform('babelify');
    b.plugin(require('css-modulesify'), {
        rootDir: env.paths.root,
        output: path.join(env.paths.output.styles, 'components.css'),
        before: [
            require('postcss-import'),
            require('postcss-each'),
            require('postcss-mixins'),
            require('postcss-nested'),
            require('postcss-reference'),
            require('postcss-simple-vars'),
            require('css-mqpacker'),
            require('autoprefixer')({ browsers: ['last 2 versions'] }),
            require('laggard')
        ]
    });

    function bundle() {
        return b
            .bundle()
            .on('error', (err) => {
                $.util.log($.util.colors.red(err.toString()));
                process.exit(1);
            })
            .pipe($.vinylSourceStream('bundle.js'))
            .pipe($.vinylBuffer())
            .pipe($.if(env.build.minify, $.uglify()))
            .pipe($.gulp.dest(env.paths.output.scripts));
    }

    b.on('update', bundle); // on any dep update, runs the bundler
    b.on('log', $.util.log); // output build logs to terminal

    return bundle;
}
