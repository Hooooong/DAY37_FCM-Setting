const fun = require("firebase-functions");
const admin = require("firebase-admin");
// const httpUrlConnection = require("request");

admin.initializeApp(fun.config().firebase);

exports.addMessage = fun.https.onRequest((req, res)=>{
    // http 요청에서
    // ? 다음에 있는 변수중에 text 변수를 가져온다.
    var text = req.query.text;
    // firebase Realtime Database 의
    // `message` reference 에 Message 추가

    // 성공하면 then( 변수 ) 을 가져오는데, 
    // 넣으면 
    admin.database().ref('/message')
        .push({msg:text})
        .then(snapshot=>{
            res.end("success!");
        });
});

exports.sendNotification = fun.https.onRequest((req, res)=>{

	// JSON Data Post 값을 수신
	var dataObj = req.body;
	// 전송할 메시지 객체를 완성
	var msg = {
		notification : {
			title : "노티바에 나타나는 타이틀",
			body : dataObj.msg
		}
	};
	
	var tokens =[];
	tokens.push(dataObj.to);
	admin.messaging()
		.sendToDevice(tokens, msg)
		.then(function(response){
			res.status(200).send(response);
		}).catch(function(error){
			res.status(500).send(error);
		});
	
});
