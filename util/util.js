'use strict';

// 유틸리티 클래스 만드는 방법 --

class Util {

    // 객체에 프로퍼티가 있는지 검사
    static checkOwnProperty(obj, propName) {
        var objName = obj.constructor.name;

        if (obj.hasOwnProperty(propName)) {
            console.log(`* '${objName}' object has '${propName}' property`);
            return true;
        }
        else {
            console.log(`* '${objName}' object DOES NOT has '${propName}' property`);
            return false;
        }
    };

    // 응답에 에러 객체 구성
    static setError(res, results, msg) {
        results['success'] = 0; // 실패
        results['error'] = msg;
        res.json(results);
    };
    // 성공 객체 구성
    static setSuccess(res, results, msg) {
        results['success'] = 1;
        results['msg'] = msg;
        res.json(results);
    }

    // 암호화
    static get getCryptoKey() {
        return 'hyuniscool';
    }
    static encrypt(CryptoJS, str) {
        var encrypted = CryptoJS.AES.encrypt(str, this.getCryptoKey);
        return encrypted.toString();
    }
    static decrypt(CryptoJS, str) {
        var decrypted = CryptoJS.AES.decrypt(str, this.getCryptoKey);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
};


// ES6 (ECMA SCRIPT V6)
module.exports = Util;