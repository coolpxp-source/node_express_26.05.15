const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');

const app = express();
app.use(cors());

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
async function initializeDatabase() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('Successfully connected to Oracle database');
  } catch (err) {
    console.error('Error connecting to Oracle database', err);
  }
}

initializeDatabase();

app.get('/', (req, res) => {
  res.send('Hello World HaHa')
})

app.get('/test', (req, res) => {
  res.send('Hello Express HaHaHa')
})

app.get('/stu/list', async (req, res) => {
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

app.get('/stu/remove', async (req, res) => {
  // console.log(req.query)
  const { stuNo } = req.query;
  console.log(stuNo)

  try {
    const result = await connection.execute(`DELETE FROM STUDENT WHERE STU_NO = ${stuNo}`);
    console.log(result);
    await connection.commit();

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});

app.get('/stu/edit', async (req, res) => {
  // console.log(req.query)
  const { stuNo } = req.query;
  const dept = "소프트웨어";

  try {
    const result = await connection.execute(
      `UPDATE STUDENT SET STU_DEPT = :dept WHERE STU_NO = :stuNo`,
      [dept, stuNo],
      {autoCommit : true}
    );
    console.log(result);
    await connection.commit();

    res.json({
        result : "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})