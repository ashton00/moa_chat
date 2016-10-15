const Promise = require('bluebird');
const mysql = require('mysql');

Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);


let dbconf = Object.assign({ connectionLimit: 10 }, {
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'moadb'
});

let Pool = mysql.createPool(dbconf);


// let connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '123456',
//     database: 'moadb'
// }); 

exports.queryDb = function(sql, value) {
    let pms = Pool.queryAsync(sql, value);
    return pms;
}