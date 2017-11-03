var http = require("http");
var httpUrlConnection = require("request");

// FCM 설정
const fcmServerUrl = "https://fcm.googleapis.com/fcm/send";
// Server Key
const serverKey = "AAAAETU6DsQ:APA91bFccddKUp065VAK8zpEI-9AtuxyUflFATQ7ysFVGSj4tpPvtSyMC-isDVv2BhzXgIdpq3PKFaQ_pQKbb3bJbpyrxGo1wtwC6xofHRFSzjO4wpQvIYWjYYHgDp3zkEer5OQI2pXm"

var msg = {
    to : "",
    notification : {
        title : "Message Test!",
        body : "",
        // Action Name
        // intent-filter 의 action- name 의 값을 넣는다.
        // Default 값을 넣어야 인식 한다. 
        // <action android:name="NOTI_LAUNCHER" />
        // <category android:name="android.intent.category.DEFAULT" />
        click_action : "NOTI_LAUNCHER",
        sound: "kick2.wav"
    },
    data :{
        type:"one",
        content : ""
    }
}

var server = http.createServer(function(req,res){
    if(req.url == "/sendNotification"){
        var post_data = "";
        
        // 메세지 수신
        req.on('data', function(data){
            post_data = data;
        });
    
        // 메세지 수신 완료
        req.on('end', function(){
            // JSON String 을 객체로 변환
            var postObj = JSON.parse(post_data);
            // 메세지 데이터 변환
            msg.to = postObj.to;
            msg.notification.body = postObj.msg;
            msg.data.content = postObj.msg;

            // 메세지를 FCM 서버로 전송
            httpUrlConnection(
                {
                    // HTTP 메세지 객체
                    url : fcmServerUrl,
                    method : "POST",
                    headers : {
                        "Authorization" : "key="+serverKey,
                        "Content-Type": "application/json"
                    },
                    body : JSON.stringify(msg)
                }, 
                function(error, answer, body){
                    var result = {
                        code : answer.statusCode,
                        msg : body
                    };
                    // Retrofit 에서 응답받으려면 writeHead 를 꼭 보내줘야 한다.
                    res.writeHead(200,{"Content-Type" : "plain/text"});
                    res.end(JSON.stringify(result));
                }
            );
        });
    }else{
        res.end("404 page Not Found!");
    }
});

server.listen(8090, function(){
    console.log("Server is Running....");
});