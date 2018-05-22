'use strict';

// 오브젝트의 다양한 형태

// 1. 인스턴스에 바로 저장
var person1 = {
    firstName: 'Hyun',
    lastName: 'Lee',
    phoneNumber: '010-2877-0948',
    // 함수를 get 키워드로 프로퍼티화. setting은 불가능
    get fullName(){
        return this.firstName + ' ' + this.lastName;
    },
    toString: function() {
        return `{ ${this.fullName}, ${this.phoneNumber} }`;
    },
    print: function() {
        return console.log(this.toString());
    }
};

// 클래스 정의 후 객체 생성
class Person {
    constructor(fullName, phoneNumber) {
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
    }

    toString() {
        return `{ ${this.fullName}, ${this.phoneNumber} }`
    }

    print() {
        console.log(this.toString());
    }

    static fromJson(json) {
        var obj = JSON.parse(json);
        return new Person(obj.fullName, obj.phoneNumber);
    }
    toJson() {
        return JSON.stringify(this);
    }
}


module.exports = function(Util) {

    console.log('------------- test/js_objects.js -------------');

    // Cannot set property fullName of [object Object] which has only a getter
    // person1.fullName = 'asdf';

    var person2 = new Person('Shaun Brady', '614-330-2052');

    // 객체에 특정 프로퍼티가 있는지 검사
    Util.checkOwnProperty(person1, 'phoneNumber');
    Util.checkOwnProperty(person2, 'phoneNumber');
    Util.checkOwnProperty(person1, 'lastName');
    Util.checkOwnProperty(person2, 'lastName');

    // person2 데이타 간략 출력
    person2.print();
    // person1의 데이타를 가지고 person2의 인터페이스(print) 호출
    person2.print.call(person1);

    // person1의 데이타를 가지고 person2의 인터페이스(toJson) 호출
    console.log(`person1.toJson = ${person2.toJson.call(person1)}`);
    console.log(`person1.toString = ${person1.toString()}`);

    var jsonText = person2.toJson();
    console.log(`person2.toJson = ${jsonText}`);

    var jsonObj = Person.fromJson(jsonText);
    jsonObj.phoneNumber = '614-123-1212';
    console.log(`person2.toString = ${jsonObj.toString()}`);

    console.log('------------- test/js_objects.js -------------');
}