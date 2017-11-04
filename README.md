Android Programing
----------------------------------------------------
### 2017.11.01 30일차

#### 예제
____________________________________________________

- [Firebase Basic](https://github.com/Hooooong/DAY36_FirebaseBasic2)

#### 공부정리
____________________________________________________

##### __FCM Sever Setting__

- FCM 방식

  ![FCM](https://github.com/Hooooong/DAY37_FCM-Setting/blob/master/image/FCM%ED%86%B5%EC%8B%A0.PNG)

  - Android 에서 다른 Android 로 FCM 을 보내기 위해서는 Firebase 에 직접적으로 Message 를 보내는 것이 아닌, `FCM과 통신하는 개인 Server` 또는 `Firebase Function` 을 통해 간접적으로 Message를 보내야 한다.

  - 다른 Android 에 보내기 위해선 Token 값을 통해 message 를 보내게 된다.

-  FCM 과 통신하는 개인 Server 작성

    - Fireabse Project 의 Server Key 와 FcmServerUrl 을 이용하여 FCM 을 보낸다.

    - POST 를 통해 data 를 주고 받을 수 있다.

    ```javascript
    var http = require("http");
    // Firebase Sever 와 통신하기 위한 request 모듈
    var httpUrlConnection = require("request");

    // FCM 설정
    const fcmServerUrl = "https://fcm.googleapis.com/fcm/send";

    // Server Key
    const serverKey = "서버키"

    var msg = {
        // 누구에게 보낼것인가를 지정
        // Token 값을 설정한다.
        to : "",

        // App 이 꺼져있을 때의 Notification 속성
        // title : Notification Title(제목)
        // body : Notification body( 내용 )
        // click_action : Notification 을 눌렀을 때 이동할 Activity
        // sound : Notification sound(알람 소리)  
        notification : {
            title : "Message Test!",
            body : "",

            // intent-filter 의 action- name 의 값을 넣는다.
            // Default 값을 넣어야 인식 한다.
            // ==== Android Manifest.xml ====
            // <action android:name="NOTI_LAUNCHER" />
            // <category android:name="android.intent.category.DEFAULT" />
            click_action : "NOTI_LAUNCHER",
            sound: "kick2.wav"
        },

        // App 이 켜져 있을 때, Notification 에 데이터(Title, Body 등)를 보내기 위해 쓰는 속성
        // data 에 담아서 보내면 된다.
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
                // 1. JSON String 을 객체로 변환
                var postObj = JSON.parse(post_data);

                // 2. 보낼 Notification 변환
                // 2-1. 받은 데이터를 msg.data 에 담아서 보낸다. (App 이 켜져 있을 때, Notification의 Title, Body 를 변환해야 되기 때문에)
                // 또는 msg.notification.body 에 담아서 보낸다. (App 이 꺼져 있을 때, Notification의 Title, Body 를 변환해야 되기 때문에)
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
    ```

- Firebase Function 작성

  - Fireabse 모듈을 사용하여 직접 `Fireabse Function` 을 작성한다.

  ![Firebase Functions](https://github.com/Hooooong/DAY37_FCM-Setting/blob/master/image/FCMFunction.PNG)

  ```javascript
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
  	// req.body 내용에 추가적으로 정보를 보내 Title, body, click_action, sound 를 변경할 수 있다.
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
  ```

  ![Firebase Functinos2](https://github.com/Hooooong/DAY37_FCM-Setting/blob/master/image/FCMFunction2.PNG)

  - 위 순으로 작성하게 되면 Firebase functions 에 생성이 되고, 사용할 Url 을 사용자에게 보내준다.

- Android 에서 보내는 방법

  - AsyncTask + HttpUrlConnection 인 `Retrofit2` 를 사용하여 `개인 Server URL` 또는 `Firebase Functions 에 생성된 URL` 을 통해 통신한다.

  - 둘 다 POST 통신이지만, `개인 Server` 는 JSON String 을 보내고, `Firebase Function` 도 JSON String 을 보내지만 Content-Type 을 `application/json` 으로 해줘야 한다.

  ```java
  // Request Body 설정
  String json = "{\"to\": \"" + token + "\", \"msg\" : \"" + msg + "\"}";

  // 1. node 서버에서 자체적으로 보내는 경우 text/plain
  // RequestBody body = RequestBody.create(MediaType.parse("text/plain"), json);
  RequestBody body = RequestBody.create(MediaType.parse("application/json"), json);

  // Retrofit 설정
  Retrofit retrofit = new Retrofit
                          .Builder()
                          // 1. Node 서버에서 자체적으로 보내는 경우 Node 서버 IP 와 PortNumber 로 보낸다.
                          //.baseUrl("http://192.168.0.1/8090")
                          .baseUrl("https://us-central1-fir-basic2-9db29.cloudfunctions.net/")

                          .build();
  // Interface 결합
  IRetro service = retrofit.create(IRetro.class);

  // Service 로 연결 준비
  Call<ResponseBody> remote = service.sendNotification(body);
  remote.enqueue(new Callback<ResponseBody>() {
                     @Override
                     public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                         if(response.isSuccessful()){
                             ResponseBody data = response.body();
                             try {
                                 Toast.makeText(StorageActivity.this, data.string(), Toast.LENGTH_SHORT).show();
                             } catch (IOException e) {
                                 e.printStackTrace();
                             }
                         }
                     }

                     @Override
                     public void onFailure(Call<ResponseBody> call, Throwable t) {
                          Log.e("Retro",t.getMessage());
                     }
                 }
  );
  ```

- Android 에서 받는 방법

  ![FCM Android](https://github.com/Hooooong/DAY37_FCM-Setting/blob/master/image/FCMAndroid.PNG)

  - App 이 꺼져 있을 경우에는 `개인 Server` 나 `Firebase Function` 에서 설정한 notification 대로 알람이 나타나게 된다.

  - App 이 켜져 있을 경우에는 Server에서 보낸 `data` 의 값들을 통해 Notification 을 설정해줘야 한다.

  ```java
  public class MyFirebaseMessagingService extends FirebaseMessagingService {

      private static final String TAG = "MsgService";

      /**
       * 내 앱이 화면에 현재 떠있으면 Notification이 전송되었을 때 이 함수가 호출된다.
       *
       * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
       */
      @Override
      public void onMessageReceived(RemoteMessage remoteMessage) {
          // TODO(developer): Handle FCM messages here.
          // Not getting messages here? See why this may be: https://goo.gl/39bRNJ
          Log.d(TAG, "From: " + remoteMessage.getFrom());

          if (remoteMessage.getData().size() > 0) {
              Log.e(TAG, "Message data payload: " + remoteMessage.getData());
              // 여기서 notification 메세지를 받아 처리
              sendNotification(remoteMessage.getData().get("type"));
          }
      }

      /**
       * Create and show a simple notification containing the received FCM message.
       *
       * @param messageBody FCM message body received.
       */
      private void sendNotification(String messageBody) {
          Intent intent = new Intent(this, MainActivity.class);
          intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
          PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                  PendingIntent.FLAG_ONE_SHOT);

          String channelId = "DEFAULT CHANNEL";
  //        Uri defaultSoundUri= RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

          Uri sound;
          switch (messageBody){
              case "one":
                  sound =  Uri.parse("android.resource://com.hooooong.firebasebasic2/" + R.raw.kick2);
                  break;
              default:
                  sound =  Uri.parse("android.resource://com.hooooong.firebasebasic2/" + R.raw.laser);
                  break;
          }

          NotificationCompat.Builder notificationBuilder =
                  new NotificationCompat.Builder(this, channelId)
                          .setSmallIcon(R.drawable.ic_launcher_background)
                          .setContentTitle("FCM Message")
                          .setContentText(messageBody)
                          .setAutoCancel(true)
                          .setSound(sound)
                          .setContentIntent(pendingIntent);

          NotificationManager notificationManager =
                  (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

          notificationManager.notify(0 /* ID of notification */, notificationBuilder.build());
      }
  }
  ```
