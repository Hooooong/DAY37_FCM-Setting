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

  - Android 에서 다른 Android 로 FCM 을 보내기 위해서는 Firebase 에 직접적으로 Message 를 보내는 것이 아닌, `FCM과 통신하는 개인 Server` 또는 `FCM Function` 을 통해 간접적으로 Message를 보내야 한다.

  - 다른 Android 에 보내기 위해선 Token 값을 통해 message 를 보내게 된다.

-  FCM 과 통신하는 개인 Server 작성

  - Fireabse Project 의 Server Key 와 FcmServerUrl 을 통해 Message 를 보낸다.

  ```javascript
  var http = require("http");
  var httpUrlConnection = require("request");

  // FCM 설정
  const fcmServerUrl = "https://fcm.googleapis.com/fcm/send";
  // Server Key
  const serverKey = "서버키"

  var msg = {
      to : "",
      notification : {
          title : "Message Test!",
          body : ""
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

- FCM Function 작성

  - Fireabse 모듈을 사용하여 직접 `Fireabse Function` 을 작성한다.

  ![FCM Functions](https://github.com/Hooooong/DAY37_FCM-Setting/blob/master/image/FCMFunction.PNG)

  ```javascript
  const fun = require("firebase-functions");
  const admin = require("firebase-admin");
  // const httpUrlConnection = require("request");

  admin.initializeApp(fun.config().firebase);

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
  ```

  ![FCM Functinos2](https://github.com/Hooooong/DAY37_FCM-Setting/blob/master/image/FCMFunction2.PNG)

  - 위 순으로 작성하게 되면 Firebase functions 에 생성이 되고, 사용할 Url 을 사용자에게 보내준다.

- Android 에서 보내는 방법

  - AsyncTask + HttpUrlConnection 인 `Retrofit2` 를 사용하여 개인 Server 또는 Firebase Functions 에 생성된 Url 을 통해 통신한다.

  ```java
  // Body 설정
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
