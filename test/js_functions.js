'use strict';

// 자바스크립트 함수의 다양한 형태


// 1. 일반 함수
function Plus(a, b) { 
    return a + b; 
}

// 2. 무명 함수
var minus = function (a, b) {
    return a - b;
}

// 3. 함수 생성자
var multiply = new Function('a', 'b', 'return a * b;');

// 4. 에로우 함수
var divide = ((a, b) => {
    return a / b;
});

module.exports = function() {

    // 함수의 호출
    console.log('------------- test/js_functions.js -------------');
    
    console.log('1 + 2 = ' + Plus(1, 2));
    (function(){ 
        console.log('1 + 2 = ' + (arguments['0'] + arguments['1']));
    })(1, 2);
    //* arguments는 에로우 함수에서 사용 불가
    console.log('1 - 2 = ' + minus(1, 2));
    console.log('1 * 2 = ' + multiply(1, 2));
    console.log('1 / 2 = ' + divide(1, 2));

    console.log('------------- test/js_functions.js -------------');
};