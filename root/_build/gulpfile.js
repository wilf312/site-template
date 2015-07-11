/***
 *
 * 各設定値
 *
 *  */

// ソースのディレクトリパス
var sourceDir   = '../_src/';
var root        = '../out/';
var outDir      = root + 'common/';
var config      = {
    // sourcemapの出力先
    mapDir : '../../_maps/' ,

    // 各ファイルの場所
    htmlSrc:    [ root + "**/*html"] ,
    cssSrc:     [ sourceDir + "sass/**/*.scss"] ,
    jsSrc:      [
        sourceDir + 'js/' + '_debug.js',

        // 実行ファイル
        sourceDir + 'js/' + 'common.js'
    ] ,
    spriteImgDir : sourceDir + "sprite/"
};



/***
 *
 * タスクの登録
 *
 *  */
var gulp        = require("gulp");
var plumber     = require('gulp-plumber'); // コンパイルエラーが出てもwatchを止めない

// サーバーを立ち上げる
var ip = require('my-ip')(null, false); // ←自分のローカルIPが入る
// var PORT = 4000;
var PORT = {%= port %};

var browser     = require("browser-sync");
gulp.task("server", function() {
    browser({
        server: {
            baseDir: root
        },
        port: PORT
    });
});

// HTML保存されたら実行するタスク
// リロード
gulp.task("html", function() {
    gulp.src(config.htmlSrc)
        .pipe(browser.reload({stream:true}));
});




// SCSS 保存されたら実行するタスク
// Sassのコンパイル
// prefixの付加
// ソースマップの生成
// CSSの書き出し
// リロード
var sass            = require("gulp-sass");
var autoprefixer    = require('gulp-autoprefixer');
var sourcemaps      = require('gulp-sourcemaps');
var spritesmith     = require("gulp.spritesmith");

gulp.task("css", function() {
    gulp.src( config.cssSrc )
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }))
        //.pipe(sass({ outputStyle: 'expanded' }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 8', 'ie 9','ie 10' , 'ie 11','android 2.3'],
            cascade: false
        }))
        .pipe(sourcemaps.write(config.mapDir))
        .pipe(gulp.dest(outDir + "css"))
        .pipe(browser.reload({stream:true}));
});

// CSSスプライトの書き出し
gulp.task('sprite', function (arg) {
    // ディレクトリ毎に画像とCSSを書き出すsudo
    //  http://blog.webcreativepark.net/2014/05/26-121844.htmlを参考に。watchで動かすと圧縮データ上書きの可能性があるため、常に手動で動かすように変更
    var fs = require('fs');
    fs.readdir(config.spriteImgDir, function(err, files) {
        for(var i = 0; i < files.length; i++) {
            doSprite(files[i] , 'png');
            doSprite(files[i] , 'jpg');
        }
    });

    function doSprite(dirName , extention) {

        var outputName = dirName.replace('-assets','');

        var spriteData = gulp.src(config.spriteImgDir + dirName + '/*.' + extention)
            .pipe(plumber())
            .pipe(spritesmith({
                imgName: 'spr_' + outputName + '.' +  extention,
                // cssに出力する画像のパス
                imgPath: '../images/spr_' + outputName + '.' + extention,
                // sass出力の場合
                cssName: '_sprite_' + outputName + '_' + extention +'.scss',
                cssTemplate: config.spriteImgDir + 'handlebarsInheritance.scss.handlebars',
                // mixinを書き出さない
                cssOpts: {functions: false}
                //// css出力の場合
                //cssName: '_' + outputName+'.css',
                //cssTemplate: config.spriteImgDir + 'handlebarsStr.css.handlebars'
            }));

        if(extention === 'png') {
            spriteData.img
                //.pipe(pngquant({quality: '65-80', speed: 4})())
                .pipe(gulp.dest(outDir + 'images/'));
        } else if(extention === 'jpg') {
            spriteData.img
                //.pipe(imagemin({quality:  '100'}))
                .pipe(gulp.dest(outDir + 'images/'));
        }

        spriteData.css
            .pipe(gulp.dest(sourceDir + 'sass/'));
    }
});


// jsのタスク
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
gulp.task('js', function() {
    gulp.src( config.jsSrc)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write(config.mapDir))
        .pipe(gulp.dest(outDir + "js"))
        .pipe(browser.reload({stream:true}));
});




/***
 *
 * タスク監視
 *
 *  */
gulp.task('watch' , function(){
    gulp.watch( config.jsSrc,   ["js"]);
    gulp.watch( config.cssSrc,  ["css"]);
    gulp.watch( config.htmlSrc, ["html"]);
});


// 監視スタート
gulp.task("default", ['server', 'css' , 'js' , 'watch']);