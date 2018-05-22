'use strict';

module.exports = function(CryptoJS, Md5) {

    console.log('------------- test/js_crypto.js -------------');

    var originalText = 'my message';
    var md5Text = Md5(originalText);
    // MD5
    console.log(`md5 of '${originalText}' --> ${md5Text}`);

    // Encrypt
    var cipherText = CryptoJS.AES.encrypt(originalText, 'secret key 123');
    //var cipherText = 'U2FsdGVkX19wE6D6rdY0NJbPZhZ42UwF1MybaiTnXYs=';

    // Decrypt
    var bytes  = CryptoJS.AES.decrypt(cipherText.toString(), 'secret key 123');
    var plainText = bytes.toString(CryptoJS.enc.Utf8);
    
    console.log(`${originalText} --> ${cipherText} --> ${plainText}`);

    console.log('------------- test/js_crypto.js -------------');
}