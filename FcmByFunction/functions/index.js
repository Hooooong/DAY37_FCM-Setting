const fun = require("firebase-functions");
const admin = require("firebase-admin");
// const httpUrlConnection = require("request");

admin.initializeApp(fun.config().firebase);

// 1. Firebase Function 을 통해 Firebase Realtime Database 에 값을 넣기
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

	// 1. JSON Data Post 값을 수신
	// req.body 에는 {"to":"상대방의 Token값", "msg":"블라블라블라"} 로 이루어져 있다.
	// req.body 내용을 추가적으로 보내 Title, body, click_action, sound 를 변경할 수 있다.
	var dataObj = req.body;
	// 전송할 메시지 객체를 완성
	var msg = {
		notification : {
			title : "노티바에 나타나는 타이틀",
			body : dataObj.msg,

			// intent-filter 의 action- name 의 값을 넣는다.
			// Default 값을 넣어야 인식 한다. 
			// ==== Android Manifest.xml ====
			// <action android:name="NOTI_LAUNCHER" />
			// <category android:name="android.intent.category.DEFAULT" />
			click_action : "NOTI_LAUNCHER",
			// res/raw/파일명 을 작성하면 된다.
			sound: "kick2.wav"
		}
	};
	
	// Token 값을 배열로 해야 한다.
	var tokens =[];
	tokens.push(dataObj.to);

	admin.messaging()
	.sendToDevice(tokens, msg)
	// 요청이 정상적인지에 대한 콜백
	.then(function(response){
		res.status(200).send(response);
	})
	// 요청에 대한 실패
	.catch(function(error){
		res.status(500).send(error);
	});
	
});
