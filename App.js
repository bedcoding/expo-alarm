// 초기 세팅: https://medium.com/@sw.lee/expo-android-build-step-2-46734daa1744 (파이어베이스 사이트에서 프로젝트 생성)
// 예제 코드: https://docs.expo.io/versions/v35.0.0/guides/push-notifications (공식문서)

import React from "react"
import { Text, View, Button } from "react-native"
import { Notifications } from "expo"
import * as Permissions from "expo-permissions"
import Constants from "expo-constants"

// 작동 설명: 우리집에 택배(메시지)를 보내려면 집주소를 알아야 하듯, 얘네들도 내 폰에 메시지를 보내려면 토큰을 알아야 한다.
let YOUR_PUSH_TOKEN = ""




export default class AppContainer extends React.Component {
  state = {
    notification: {},
  }

  registerForPushNotificationsAsync = async () => {
    // 이 구간은 예외처리 구간이라 나도 모르겠다;;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
      let finalStatus = existingStatus
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
        finalStatus = status
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!")
        return
      }


      // [집주소 알아내는 방법 예시]
      let token = await Notifications.getExpoPushTokenAsync()
      console.log(token)

      // 1. 집주소 받기: await Notifications.getExpoPushTokenAsync() 함수를 통해 "휴대폰의 집주소(토큰)" 받는다.
      // 아래에서 log로 집주소(토큰)을 확인한다. (콘솔에는 ExponentPushToken[니 토큰 주소] 이렇게 찍힌다)

      // 2. 집주소를 알아냈으면 이 사이트에서 테스트 하자 -> https://expo.io/dashboard/notifications
      // - EXPO PUSH TOKEN (FROM YOUR APP)에 콘솔로 알아낸 ExponentPushToken[니 토큰 주소] 입력
      // - 제목, 내용 아무거나 입력해서 버튼 클릭
      


      YOUR_PUSH_TOKEN = token   // 앱에서 폰에 알람을 보내기 위해 (폰의 주소인) 토큰을 YOUR_PUSH_TOKEN이란 변수에 저장해봤다.

    } else {
      alert("Must use physical device for Push Notifications")
    }
  }

  
  componentDidMount() {
    this.registerForPushNotificationsAsync()

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(this._handleNotification)
  }

  _handleNotification = (notification) => {
    this.setState({ notification: notification })
  }

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
  sendPushNotification = async () => {

    // 무슨 메시지를 보낼지 적는 구간이므로 아무거나 써도 된다.
    const message = {
      to: YOUR_PUSH_TOKEN,  // 솔직히 메시지에는 토큰 안써도 되지 않나? 예제에 있길래 걍 냅뒀다.
      sound: "default",
      title: "Original Title",
      body: "And here is the body!",
      data: { data: "goes here" },
    }

    // 여기가 실직적으로 알람을 보내기 위한 세팅이다. 이거 잘못되면 알람 안 날아감!!!
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },

      // 보내는 구간 (받으면 이렇게 뜬다 - 제목: Original Title, 내용: And here is the body!, 화면에 뜨는 Data: goes here))
      to: YOUR_PUSH_TOKEN,   // 여기다가 토큰을 써야지 알람이 날아간다!!!!! 근데 예제에는 BODY만 덜렁 나와 있었고, 당연히 집주소가 없으니 택배가 올 수가 없는데 나는 '왜 안 보내지지' 이러면서 삽질하고 있었다. 예제 개똥같이 만들어놨네 어휴
      title: "Original Title",
      body: JSON.stringify(message),
    })
    const data = response._bodyInit

    console.log(`Status & Response ID-> ${JSON.stringify(data)}`)  // 실행 결과: Status & Response ID-> {"_data":{"size":68,"offset":0,"blobId":"8d6b3f9f-727d-4b5c-8950-ca43d276f697"}}
    console.log(YOUR_PUSH_TOKEN)  // 얘는 디버깅 용으로 넣었다. 스마트폰 주소(토큰)이 정상적으로 존재하는지 확인용
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Text>Origin: {this.state.notification.origin}</Text>
          <Text>Data: {JSON.stringify(this.state.notification.data)}</Text>
        </View>
        
        <Button title={"Press to Send Notification"} onPress={() => this.sendPushNotification()} />
      </View>
    )
  }
}

/*  TO GET PUSH RECEIPTS, RUN THE FOLLOWING COMMAND IN TERMINAL, WITH THE RECEIPTID SHOWN IN THE CONSOLE LOGS

    curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/getReceipts" -d '{
      "ids": ["YOUR RECEIPTID STRING HERE"]
      }'

    */
