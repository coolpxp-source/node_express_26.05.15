const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');

const app = express();

// 1. 오타 수정: cors()
app.use(cors()); 

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

let connection;

async function initializeDatabase() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('Successfully connected to Oracle database');
  } catch (err) {
    console.error('Error connecting to Oracle database', err);
  }
}

initializeDatabase();

// 라우트 설정들을 모두 위로 올립니다.
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/test', (req, res) => {
  res.send('Hello Express')
})

app.get('/stu/list', async (req, res) => {
  try {
    const result = await connection.execute(`SELECT * FROM STUDENT`);
    const columnNames = result.metaData.map(column => column.name);
    
    const rows = result.rows.map(row => {
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

// 2. 서버 실행(listen)은 반드시 맨 마지막에!
// 포트 번호도 터미널에서 확인하신 3009로 맞추는 것이 안전합니다.
const PORT = 3009; 
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})