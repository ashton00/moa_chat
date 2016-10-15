const mysql = require('./moa-mysql');
exports.writeToDB = function (userId, visibility, receive_uids, noticebody) {
    let time = new Date();
    let values = [userId, visibility, time, receive_uids, noticebody]
    let sql = 'insert into MOA_OAMessage '+
              ' (uid, visibility, timestamp, receive_uids, body) '+
              'value (?, ?, ?, ?, ?);'
    return mysql.queryDb(sql, values);
}

exports.writeReadToDB = function (mid) {
    let values = [mid];
    let sql = "update MOA_OAMessage set isread = 1 where mid = ?;";
    return mysql.queryDb(sql, values);
}

exports.getUnreadMessageFromDB = function (userId) {
    // let values = [userId];
    let sql = "select * from MOA_OAMessage where isread = 0 and receive_uids like \'%"+ userId +"%\';";
    return mysql.queryDb(sql);
}

// exports.getGroup = function(userId) {
//     let values = [userId];
//     let sql = "";
//     return mysql.queryDb(sql, values);
// }

exports.getUnreadNoticeFromDB = function (userId) {
    let values = [userId];
    let sql = "select * from MOA_OAMessage where isread = 0 and  `visibility`  = (select `group` from MOA_Worker where uid = ?) ;";
    return mysql.queryDb(sql, values);
}

exports.getChatHistoryFromDB = function (userId, receiveUser) {
    // let values = [receiveUser, userId, receiveUser];
    let sql = 
    'select *  '+
    'from '+
    '    (select * from MOA_OAMessage where visibility = 0 and uid = '+ receiveUser +' and receive_uids like \'%'+ userId +'%\'  '+
    '    union '+
    '    select * from MOA_OAMessage where visibility = 0 and uid = '+ userId +' and receive_uids like \'%'+ receiveUser +'%\') as history '+
    'order by timestamp; ';
    return mysql.queryDb(sql);
}

exports.getNewChatMessageFromDB = function (userId, receiveUser) {
    let values = [receiveUser];
    let sql = 
    'select * from MOA_OAMessage where visibility = 0 and isread = 0 and uid = ? and receive_uids like \'%'+ userId +'%\';';
    return mysql.queryDb(sql, values);
}
