'use strict';

// 클래스 CDO 객체 로드
// 글로벌 변수라 해서 다른 자바스크립트까지 전달되지 않는다
const Express = require('express');
const BodyParser = require('body-parser');
const Session = require('express-session');
const Fs = require('fs');
const Util = require('./util/util');
const CryptoJS = require("crypto-js");
const Md5 = require('md5');

// Express CDO 객체로 앱 인스턴스 생성
var g_app = Express();

require('./test/js_functions')();
require('./test/js_objects')(Util);
require('./test/js_crypto')(CryptoJS, Md5);

// 인자 받아오기 예제
console.log('process.argv0 = ' + process.argv0);
process.argv.forEach((val, index) => {
    console.log('process.argv[' + index + '] = ' + val);
});

// 디폴트 포트넘버
var g_port = 8080;

// 인자로 받아온 포트 넘버 처리
if (process.argv[2]) {
    try {
        var argv2 = parseInt(process.argv[2], 10);
        console.log('* argv2 as number = ' + argv2);
        console.log('* type of argv2 = ' + typeof argv2);
        if (argv2 >= 0 && argv2 < 65536) {
            g_port = argv2;
        }
    }
    catch (err) {
        console.error(err);
    }
}

// --> D:\NodeJSProjects\express_tutorial, full path
console.log('path of server.js = ' + __dirname);

// HTML 파일의 위치 설정
// --> D:\NodeJSProjects\express_tutorial\views, 기본값으로 이미 views폴더로 설정되어 있음
console.log('view = ' + g_app.get('views'));
g_app.set('views', __dirname + '/views');

// HTML를 렌더링 할때, EJS를 사용하도록 설정
console.log('view engine = ' + g_app.get('view engine'));
g_app.set('view engine', 'ejs');
g_app.engine('html', require('ejs').renderFile);

// CSS 파일을 설정하기 위해, static file path를 지정
g_app.use(Express.static('public'));
// JSON-encoded bodies 허용
g_app.use(BodyParser.json());
// URL-encoded bodies 허용
// body-parser deprecated undefined extended: provide extended option server.js:24:20
// body-parser의 exteded 옵션은 더이상 기본값으로 사용되지 않는다. 명시적으로 옵션을 제공해야 한다.
// https://www.npmjs.com/package/body-parser#bodyparserurlencodedoptions
g_app.use(BodyParser.urlencoded({ 
    extended: false
}));

g_app.use(Session({
    secret: 'signing passphrase for cookie',
    resave: false,
    saveUninitialized: true
}));

// 라우터 모듈인 main.js를 불러와서 app 객체 전달
var g_router = require('./router/main')(g_app, Fs, Util, CryptoJS, Md5);

var g_server = g_app.listen(g_port, function(){
    /*
    g_app._router.stack.forEach(function(r){
        if (r.route && r.route.path){
          console.log(r.route.path)
        }
      })*/
    console.log("Express server has started on port " + g_port);
})