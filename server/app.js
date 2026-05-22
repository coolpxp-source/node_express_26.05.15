const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');
var QRCode = require('qrcode')

// router // ★사용할 js 파일들 선언
const studentRouter = require("./routes/student"); 
const userRouter = require("./routes/user");
const boardRouter = require("./routes/board");
const productRouter = require("./routes/product");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json())

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로

app.use("/student", studentRouter);
app.use("/user", userRouter);
app.use("/board", boardRouter);
app.use("/product", productRouter);

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
// async function initializeDatabase() {

async function startServer() {
  try {
    await db.init();
    console.log('Successfully connected to Oracle database');

    app.listen(3010, () => {
      console.log('Server is running on port 3010');
    });

  } catch (err) {
    console.error('Error connecting to Oracle database. Server not started.', err);
    process.exit(1); // DB 연결 실패 시 프로세스 종료 (선택 사항)
  }
}

app.get("/qrcode", async (req, res)=>{
  try{
    // await를 사용할 때는 콜백 함수를 넣지 않습니다. 
    // url 변수에 데이터가 바로 담깁니다.
    let qrImg = await QRCode.toDataURL("https://www.naver.com");
    res.send(
      `
        <img src=${qrImg}>
      `
    )
  }catch(err){
    console.log(err);
  }
})


startServer();


