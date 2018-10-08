const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const flatten = require('gulp-flatten');
//const browserSync = require('browser-sync').create();
const concat = require('gulp-concat'); //concatenate scripts into one file
const uglify = require('gulp-uglify-es').default; //to minify the generated script file by gulp-concat
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
var imageResize = require('gulp-image-resize');
let resizer = require('gulp-images-resizer');


gulp.task('default', [], (done) => {
    console.log('Hello, Gulp!!');
    gulp.watch('/src/**/*.scss', gulp.series('styles'));

    // browserSync.init({ //calling .init on browserSync starts the server.
    //     server: "./" //This will need to be changed to ./dist if we're using the dist folder to copy index.html in it
    //   });

    done(); //callback to mark the task as complete. Without it we will receive:
    //The following tasks did not complete: default
    //Did you forget to signal async completion?
});

gulp.task('styles', (done) => {
    gulp
    .src('./src/**/*.scss')
    .pipe(sass({
        outputStyle: 'compressed' //minifying the generated css files
    }))
    .on('error', sass.logError)
    .pipe(autoprefixer({
        browsers: ['last 2 versions']
    }))
    .pipe(flatten()) //if we didn't have flatten here, the dist folder structure will be exactly as the src folder structure as all subdirectories will be created to match the src one. Having flatten tells gulp to keep the structure as it is defined in the gulp.dest path
    .pipe(gulp.dest('./dist/css'));
    //.pipe(browserSync.stream());//Using a stream, we can reload at specific points during our tasks, and the browser will be informed of the changes.
    //However, reloading before the CSS is done compiling wouldn't make sense 
    //(i.e., Gulp isn't transpiling the code) -- which is why it is important to integrate this line of code 
    //only when everything else is complete.
    done();
});

gulp.task('scripts', (done) => { //this to combine scripts into one file for dev env.
    gulp
    .src('./src/**/*.js')
    .pipe(babel())
    .pipe(sourcemaps.init())
    .pipe(concat('all.js')) //This plugin takes the files in the stream and combines them into a single file named to whatever you provide in the argument
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js/'));

    done();
});

gulp.task('scripts-dist', (done) => { //this to combine scripts into one file for prod env.
    gulp
    .src('./src/**/*.js')
    .pipe(babel())
    .pipe(sourcemaps.init())
    .pipe(concat('all.js')) //This plugin takes the files in the stream and combines them into a single file named to whatever you provide in the argument
    .pipe(uglify()) //minifying the generated all.js file. This is only needed in prod. mode and that's why we didn't add it to the 'scripts' task
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js/'));

    done();
});

gulp.task('imagesopt', (done) => {
    gulp
    .src('./src/**/*.jpg')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(gulp.dest('./dist/'));

    done();
});

gulp.task('webp', (done) => {
    gulp
    .src('./src/**/*.jpg')
    .pipe(resizer({
        width: "40%"
    }))
    .pipe(webp())
    .pipe(gulp.dest('./dist/'));

    done();

});
