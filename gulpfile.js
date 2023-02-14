const { src, dest, task, series, watch,parallel} = require("gulp");
const rm = require('gulp-rm');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
//const px2rem = require('gulp-smile-px2rem');
//const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');

const env = process.env.NODE_ENV;
 
 
task('clean', () => {
 return src('dist/**/*', { read: false })
   .pipe(rm())
})
 
task('copy:html', () => {
 return src('src/SURF/*.html')
    .pipe(dest('dist'))
    .pipe(reload({stream:true}));
})
const img=[
    'src/SURF/img/*.png',
    'src/SURF/img/*.jpeg'
]
task('copy:img', () => {
    return src(img)
       .pipe(dest('dist/img'))
       .pipe(reload({stream:true}));
   })

task('copy:svg', () => {
    return src('src/SURF/sprite.svg')
       .pipe(dest('dist'))
       .pipe(reload({stream:true}));
})

const styles=[
    'node_modules/normalize.css/normalize.css',
    'src/SURF/css/main.scss'
]
task('styles', () => {
    return src(styles)
    .pipe(gulpif(env === 'dev', sourcemaps.init()))
    .pipe(concat('main.min.scss'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(env === 'prod', autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false
    })))
    .pipe(gulpif(env === 'prod', cleanCSS()))
    .pipe(gulpif(env === 'dev', sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(reload({ stream: true }));
});

task('scripts',()=>{
    return src("src/SURF/js/*.js")
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js', {newLine: ';'}))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(reload({ stream: true }));
})

task('server', () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        open: false
    });
});
task("watch",()=>{
    watch('src/SURF/css/*.scss',series('styles'));
    watch('src/SURF/*.html',series('copy:html'));
    watch('src/SURF/*.svg',series('copy:svg'));
    watch('src/SURF/*.js',series('scripts'));
})

task(
    'default',
    series('clean',
    parallel('copy:html','copy:svg','copy:img','styles','scripts'),
    parallel('watch','server')
));
task(
    'build',
    series('clean',
    parallel('copy:html','copy:svg','copy:img','styles','scripts'),
));