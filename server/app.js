const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');

const app = express();
app.use(cors());
app.use(express.json());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
// async function initializeDatabase() {

async function startServer() {
  try {
    connection = await oracledb.getConnection(config);
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

// RESTful API 적용
app.get('/student', async (req, res) => {
  const { } = req.query;
  try {
    const result = await connection.execute(`SELECT * FROM STUDENT`);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json({
        result : "success",
        list : rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

// delete
app.delete('/student/:stuNo', async (req, res) => {
  console.log("delete 호출")
  console.log(req.params);
  const {stuNo } = req.params;
  // console.log(stuNo)
  try {
    const result = await connection.execute(`DELETE FROM STUDENT WHERE STU_NO =:stuNo`,
      [stuNo],
      {autoCommit : true}
    );
    // await : 작업이 다 끝날 때까지 코드가 아래로 내려가지 않도록 방지함. =>대기 상태.
    console.log(result);
    // await connection.commit(); // commit

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

//insert
app.post('/student', async (req, res) => {
  console.log("post 호출")
  console.log(req.body);
  const {stuNo, stuName, stuDept, stuGrade } = req.body;
  console.log(stuNo)
  try {
    const result = await connection.execute(
      `INSERT INTO STUDENT (STU_NO, STU_NAME, STU_DEPT, STU_GRADE) 
      VALUES (:stuNo, :stuName, :stuDept, :stuGrade)`,
      [stuNo, stuName, stuDept, stuGrade],
      { autoCommit: true }
    );
    // await : 작업이 다 끝날 때까지 코드가 아래로 내려가지 않도록 방지함. =>대기 상태.
    console.log(result);
    // await connection.commit(); // commit

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

// edit
app.put('/student/:stuNo', async (req, res) => {
  const { stuNo} = req.params;
  const { STU_NAME, STU_DEPT, STU_GRADE } = req.body;  // 대문자로
  try {
    const result = await connection.execute(
      `UPDATE STUDENT SET 
          STU_NAME=:stuName, 
          STU_DEPT=:stuDept, 
          STU_GRADE=:stuGrade 
          WHERE STU_NO=:stuNo
      `,
      [STU_NAME, STU_DEPT, STU_GRADE, stuNo],  // 대문자 변수로
      { autoCommit: true }
    );
    res.json({ result: "success" });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

// detail & view
app.get('/student/:stuNo', async (req, res) => {
  const { stuNo } = req.params;
  console.log("stuNo 확인:", stuNo);
  try {
    const result = await connection.execute(
      `SELECT * FROM STUDENT WHERE STU_NO = :stuNo`, [stuNo]
    );

    // ← 조회 결과 없으면 빈 객체 반환
    if (result.rows.length === 0) {
      return res.json({ result: "success", info: {} });
    }

    const columnNames = result.metaData.map(column => column.name);
    const obj = {};
    columnNames.forEach((columnName, index) => {
      obj[columnName] = result.rows[0][index];
    });
    res.json({ result: "success", info: obj });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

// tbl_user table 이용 login.
app.post('/login', async (req, res) => { // CRUD를 위한 용도가 아니라서 독립적인 주소를 가져도 된다.
  console.log("post 호출")
  const {userId, pwd } = req.body;
  try {
    const result = await connection.execute(
       `SELECT * FROM TBL_USER WHERE USERID = :userId AND PWD = :pwd`,
      [userId, pwd],
      { autoCommit: true }
    );
    // await : 작업이 다 끝날 때까지 코드가 아래로 내려가지 않도록 방지함. =>대기 상태.
    console.log(result);

    res.json({
        result : "success",
        list : result.rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});


// 서버 시작
// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
