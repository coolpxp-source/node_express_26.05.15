const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');
var QRCode = require('qrcode');

const studentRouter = require("./routes/student"); // ★사용할 js 파일들 선언
const userRouter = require("./routes/user");
const boardRouter = require("./routes/board");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로

app.use("/student", studentRouter); // ★사용할 js 파일들 선언
app.use("/user", userRouter);
app.use("/board", boardRouter);

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
// async function initializeDatabase() {

async function startServer() {
  try {
    db.init();
    console.log('Successfully connected to Oracle database');

    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });

  } catch (err) {
    console.error('Error connecting to Oracle database. Server not started.', err);
    process.exit(1); // DB 연결 실패 시 프로세스 종료 (선택 사항)
  }
}

app.get("/qrcode", async (req, res) => { // => 위치 수정
  try {
    // await를 사용할 때는 콜백 함수를 넣지 않습니다. url 변수에 데이터가 바로 담깁니다.
    let qrImg = await QRCode.toDataURL("https://www.naver.com");
    // http://localhost:3000/qrcode
    
    console.log(qrImg); // 콘솔에 base64 이미지 데이터 출력
    
    // 클라이언트(브라우저)에게 QR 코드 이미지를 보여주거나 전송하는 로직이 필요합니다.
    res.send(`<img src="${qrImg}"/>`); 
    
  } catch (err) {
    // 에러 메시지를 QR 코드 생성 실패에 맞게 수정했습니다.
    console.error('QR 코드 생성 중 오류가 발생했습니다.', err);
    res.status(500).send('Internal Server Error');
  }
});
startServer();

// 서버 시작
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
