var chat = require('./moa-query');
exports.start = (io) => {
  console.log('start');
  io.on('connection', (socket) => {

    socket.on('create notice', function(data) {
      let [userId, visibility, receive_uids, noticebody] = 
            [data.userId, data.visibility, data.receiveUser, data.noticebody];

      console.log("\nOn: create notice\n");
      console.log("----userId: ", userId);
      console.log("----noticebody: ", noticebody);
      console.log("----visibility: ", visibility);
      console.log("----receive_uids: ", receive_uids);

      //数据库操作
      chat.writeToDB(userId, visibility, receive_uids, noticebody)
          .then(data => {
            console.log(data);
            if(data.affectedRows != 0) {
              console.log("----writeToDB写入信息成功");
              //触发用户检查当前是否有未读信息
              console.log("\nEmit: check new notice\n")
              socket.broadcast.emit('check new notice');
            }
          }).catch(err => {
            console.log('\n----writeToDB操作失败:\n');
            console.log(err);
          });

    });//create notice

    socket.on('check unread', function(data) {
      
      console.log("\nOn: check unread\n")

      let userId = [data.userId];
      let noticelist = [];
      let messagelist = [];

      //数据库操作
      chat.getUnreadMessageFromDB(userId)
          .then(data => {
            messagelist = data;


            chat.getUnreadNoticeFromDB(userId)
                .then(result => {

                  noticelist = result;
                  if(messagelist.length != 0 || noticelist.length != 0) {
                    console.log("\nEmit: new notice\n")
                    socket.emit('new notice', {
                        noticelist: noticelist,
                        messagelist: messagelist,
                        user: userId
                    });    
                  }

                }).catch(err => {
                  console.log('\n----getUnreadNoticeFromDB操作失败:\n');
                  console.log(err);
                });//getUnreadNoticeFromDB.catch


          }).catch(err => {
            console.log('\n----getUnreadMessageFromDB操作失败:\n');
            console.log(err);
          });//getUnreadMessageFromDB

    });//check unread

    socket.on('already read', function(data) {
      let [userId, mid] = [data.userId, data.mid];
      
      console.log("\nOn: already read");
      console.log("----userId: ", userId);
      console.log("----mid: ", mid);

      chat.writeReadToDB(mid)
          .then(data => {
            if(data.affectedRows != 0) {
              console.log("----writeReadToDB写入已读标志成功");
            }
          }).catch(err => {
            console.log('\n----writeReadToDB操作失败:\n');
            console.log(err);
          });

    });//already red

    socket.on('new chat', function(data) {
      let [userId, receiveUser] = 
            [data.userId, data.receiveUser];

      console.log("\nOn: new chat");
      console.log("----userId: ", userId);
      console.log("----receiveUser: ", receiveUser);

      chat.getChatHistoryFromDB(userId, receiveUser)
          .then(data => {
            let messagelist = data;
            if(messagelist.length != 0) {
              console.log("\nEmit: init chat\n")
              console.log("history.length: ", data.length);
              socket.emit('init chat', {
                  messagelist: messagelist
              });
            }
          }).catch(err => {
            console.log('\n----getChatHistoryFromDB操作失败:\n');
            console.log(err);
          });


    });//new chat

    socket.on('check message', function(data) {
      let [userId, receiveUser] = [data.userId, data.receiveUser];

      console.log("\nOn: check message");
      console.log("----userId: ", userId);
      console.log("----receiveUser: ", receiveUser);

      //数据库操作
      chat.getNewChatMessageFromDB(userId, receiveUser)
          .then(data => {
            console.log(data);
            let messagelist = data;
            if(messagelist.length != 0) {
                console.log("----msglist: ");
                console.log(messagelist);
                console.log("\n");
                console.log("\nEmit: new message\n")
                socket.emit('new message', {
                    messagelist: messagelist,
                    userId: userId
                });    
            }
          }).catch(err => {
            console.log('\n----getNewChatMessageFromDB操作失败:\n');
            console.log(err);
          });


    });//check message

  });//io

}