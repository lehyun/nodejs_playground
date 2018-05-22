'use strict';

class Config {
    constructor() {
        this.encryption = true;
    }
}
class User {
    constructor(name, password) {
        this.name = name;
        this.password = password;
        this.encryption = false;
    }
}

module.exports = function(g_app, Fs, Util, CryptoJS, Md5) {

    // --> D:\NodeJSProjects\express_tutorial, full path
    console.log('path of main.js = ' + __dirname);

    const CryptoKey = 'hyuniscool';
    const ConfigStoreFilePath = __dirname + "/../data/config.json";
    // 동기 설정로드 -> config
    const loadConfigDataSync = function() {
        try {
            var data = Fs.readFileSync(ConfigStoreFilePath, 'utf8');
            var config = JSON.parse(data);
            return Object.assign(new Config(), config);
        }
        catch (err) {
            return new Config();
        }
    }
    // 비동기 설정로드 -> callback(err, config)
    const loadConfigData = function(callback) {
        const onReadFile = function(err, data) {
            if (err) {
                callback(err, null);
            }
            else {
                var config = JSON.parse(data);
                config = Object.assign(new Config(), config);
                callback(err, config);
            }
        };
        Fs.readFile(ConfigStoreFilePath, 'utf8', onReadFile);
    }

    const UserStoreFilePath = __dirname + '/../data/user.json';
    // 비동기 유저테이블 로드 -> callback(err, users)
    const loadUserData = function(callback) {
        const onReadFile = function(err, data){
            if (err) {
                callback(err, null);
            }
            else {
                var users = JSON.parse(data);

                // json map iterating
                for (var key in users) {
                    // JsonObject를 User객체로 치환
                    users[key] = Object.assign(new User(), users[key]);
                }

                callback(err, users);
            }
        };
        Fs.readFile(UserStoreFilePath, 'utf8', onReadFile);
    };
    // 비동기 유저테이블 저장 -> callback(err)
    const saveUserData = function(users, callback) {
        Fs.writeFile(UserStoreFilePath, JSON.stringify(users, null, '\t'), 'utf8', callback);
    }

    // 설정 로드 서버뜰때 한번 (동기)
    var g_config = loadConfigDataSync();

    // HTML 사용
    /*
    g_app.get('/', function(req, res){
        res.render('index.html');
    });*/
    g_app.get('/about', function(req, res){
        res.render('about.html');
    });

    // EJS 사용
    g_app.get('/', function(req, res){
        res.render('index', {
            title: 'MainPage',
            app: g_app, 
            session: req.session
        });
    });

    g_app.post('/login/:userid', function(req, res){
        var userid = req.params.userid;
        // 요청 바디 체크
        if (!req.body['password']) {
            // 요청 데이타 에러
            Util.setError(res, results, 'invalid request : key parameter is missing!');
            return;
        }

        loadUserData(function(err, users){
            var results = {};
            if (err) {
                Util.setError(res, results, err.toString());
                return;
            }
            if (!users[userid]) {
                Util.setError(res, results, `invalid userid or password : ${userid}`);
                return;
            }
            var user = users[userid];
            var password = user.password;
            if (user.encryption) {
                password = Util.decrypt(CryptoJS, password);
            }
            if (password !== req.body['password']) {
                Util.setError(res, results, `invalid userid or password : ${userid}`);
                return;
            }
            req.session.userid = userid;
            req.session.username = user.name;
            req.session.time = new Date();
            var tokenSeed = userid + '|' + password + '|' + req.session.time.toISOString();
            // david.1|third_pass|2018-05-22T12:55:39.967Z
            // console.log(tokenSeed);
            req.session.token = Md5(tokenSeed);
            Util.setSuccess(res, results, 'ok');
            console.log(`*** '${req.session.userid}' has logged in : name=${req.session.username}, token=${req.session.token}, time=${req.session.time.toISOString()}`);
        });
    });

    // 설정 실시간 리로드
    g_app.get('/data/config/reload', function(req, res){
        var results = {};

        if (!req.session.token) {
            Util.setError(res, results, 'authentication required');
            return;
        }

        loadConfigData(function(err, config){    
            if (err) {
                Util.setError(res, results, err.toString());
                return;
            }
            g_config = config;
            res.json(config);
        });
    });

    // 설정에 따라서 유저 데이타 마이그레이션
    g_app.get('/data/user/migration', function(req, res){
        var results = {};

        if (!req.session.token) {
            Util.setError(res, results, 'authentication required');
            return;
        }

        loadUserData(function(loadErr, users){
            if (loadErr) {
                Util.setError(res, results, loadErr.toString());
                return;
            }
            var changed = false;
            // json map iterating
            for (var key in users) {
                var user = users[key];
                if (user.encryption != g_config.encryption)
                {
                    if (user.encryption) {
                        user.password = Util.decrypt(CryptoJS, user.password);
                    }
                    else {
                        user.password = Util.encrypt(CryptoJS, user.password);
                    }
                    user.encryption = g_config.encryption;
                    changed = true;

                    // 객체 이름 얻어오기
                    var userType = user.constructor.name;
                    var jsonText = JSON.stringify(user);
                    console.log(`key=${key}, type=${userType}, json=${jsonText}`);
                }
            }

            if (changed) {
                saveUserData(users, function(saveErr){
                    if (saveErr) {
                        Util.setError(res, results, saveErr.toString());
                        return;
                    }
                });
            }

            res.json(users);
        });
    });

    // 전체 유저 리스트
    g_app.get('/list', function(req, res){
        var results = {};

        if (!req.session.token) {
            Util.setError(res, results, 'authentication required');
            return;
        }

        loadUserData(function(err, users){
            if (err) {
                Util.setError(res, results, err.toString());
                return;
            }
            res.json(users);
        });
    });

    // 특정 유저 정보 검색
    g_app.get('/getUser/:userid', function(req, res){
        var results = {};

        if (!req.session.token) {
            Util.setError(res, results, 'authentication required');
            return;
        }

        var userid = req.params.userid;
        loadUserData(function(err, users){
            if (err) {
                Util.setError(res, results, err.toString());
                return;
            }
            if (!users[userid]) {
                Util.setError(res, results, `invalid request : user doesn't exist : ${userid}`);
                return;
            }
            res.json(users[userid]);
        });
    });

    // 유저 추가
    g_app.post('/addUser/:userid', function(req, res){

        var results = {};
        var userid = req.params.userid;

        if (!req.session.token) {
            Util.setError(res, results, 'authentication required');
            return;
        }

        // 요청 바디 체크
        if (!req.body['password'] || !req.body['name']) {
            // 요청 데이타 에러
            Util.setError(res, results, 'invalid request : key parameter is missing!');
            return;
        }

        loadUserData(function(err, users){
            if (err) {
                Util.setError(res, results, err.toString());
                return;
            }
            if (users[userid])
            {
                Util.setError(res, results, `invalid request : user already exists : ${userid}`);
                return;
            }
            users[userid] = req.body;
            saveUserData(users, function(err){
                if (err) {
                    Util.setError(res, results, err.toString());
                    return;
                }
                Util.setSuccess(res, results, 'ok');
            });
        });
    });

    // 유저 업데이트
    g_app.put('/updateUser/:userid', function(req, res){

        var results = {};
        var userid = req.params.userid;

        if (!req.session.token) {
            Util.setError(res, results, 'authentication required');
            return;
        }

        // 요청 바디 체크
        if (!req.body['password'] || !req.body['name']) {
            // 요청 데이타 에러
            Util.setError(res, results, 'invalid request : key parameter is missing!');
            return;
        }

        loadUserData(function(err, users){
            if (err) {
                Util.setError(res, results, err.toString());
                return;
            }
            if (!users[userid])
            {
                Util.setError(res, results, `invalid request : user doesn't exist : ${userid}`);
                return;
            }

            users[userid] = req.body;

            saveUserData(users, function(err){
                if (err) {
                    Util.setError(res, results, err.toString());
                    return;
                }
                results['success'] = 1;
                res.json(results);
            });
        });
    });

    // 유저 삭제
    g_app.delete('/deleteUser/:userid', function(req, res){

        var results = {};
        var userid = req.params.userid;

        if (!req.session.token) {
            Util.setError(res, results, 'authentication required');
            return;
        }

        loadUserData(function(err, users){
            if (err) {
                Util.setError(res, results, err.toString());
                return;
            }
            if (!users[userid])
            {
                Util.setError(res, results, `invalid request : user doesn't exist : ${userid}`);
                return;
            }

            delete users[userid];
            
            saveUserData(users, function(err){
                if (err) {
                    Util.setError(res, results, err.toString());
                    return;
                }
                results['success'] = 1;
                res.json(results);
            });
        });
    });
};