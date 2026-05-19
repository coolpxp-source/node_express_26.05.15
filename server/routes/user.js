const express = require('express');
const oracledb = require('oracledb');
const db = require("../db"); // db파일 참조
const bcrypt = require('bcrypt');
const router = express.Router(); // 라우터 사용을 위한 호출

const saltRounds = 10;

module.exports = router; // app에서 참조할 수 있도록 넣는 코드

// tbl_user table 이용 login.
router.post('/login', async (req, res) => { // CRUD를 위한 용도가 아니라서 독립적인 주소를 가져도 된다.
  console.log("post 호출")
  const {userId, pwd } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
       `SELECT * FROM TBL_USER WHERE USERID = :userId`,
      {userId : userId},
      { 
        autoCommit: true ,
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );
    // await : 작업이 다 끝날 때까지 코드가 아래로 내려가지 않도록 방지함. =>대기 상태.
    console.log(result.rows); // undefined or []
    // console.log(result.rows);
    // console.log(result.metaData);
    let message = "";
    let info = {}

    if(result.rows.length > 0){
    let match = await bcrypt.compare(pwd, result.rows[0].PWD);
    if(match){
        message = "success";
        info = {
            userId: result.rows[0].USERID,
            userName: result.rows[0].USERNAME,
        }
    } else {
        message = "fail"; // 비밀번호 틀림
    }
    } else {
        message = "fail"; // 아이디 없음
    }
    
    res.json({
        result : message,
        info : info
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }finally {
    if (connection) await connection.close();  // ← 항상 반환
  }
});

// tbl_user table 이용 join
router.post('/join', async (req, res) => { // CRUD를 위한 용도가 아니라서 독립적인 주소를 가져도 된다.
  console.log("post 호출")
  const {userId, pwd, userName } = req.body;
  const hashPwd = await bcrypt.hash(pwd, saltRounds);
  let connection;
  try {
     // 1. 중복 확인
    connection = await db.getConnection();
    const check = await connection.execute(
      `SELECT * FROM TBL_USER WHERE USERID = :userId`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (check.rows.length > 0) { // userId의 length가 >0 이면 있는 아이디!
      return res.json({ result: "fail" });  // 이미 있는 아이디면 회원가입 실패!
    }

    // 2. 회원가입
    await connection.execute(
      `INSERT INTO TBL_USER (USERID, PWD, USERNAME) VALUES (:userId, :hashPwd, :userName)`, // 중복 확인 후 insert문 실행.
      { userId: userId, hashPwd: hashPwd, userName: userName }, // 보낼 정보
      { autoCommit: true }
    );
    let info = { userName: userName };
    res.json({ 
      result: "success", 
      info: info
    });

  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }finally {
    if (connection) await connection.close();  // ← 항상 반환
  }
});