const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');
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
startServer();

// 서버 시작
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
