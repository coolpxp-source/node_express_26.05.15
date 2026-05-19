const express = require('express');
const oracledb = require('oracledb');
const db = require("../db"); // db파일 참조
const router = express.Router(); // 라우터 사용을 위한 호출

module.exports = router; // app에서 참조할 수 있도록 넣는 코드

// '/' -> '/student' 기본 주소다. 
router.get('/', async (req, res) => {
  const { } = req.query;
  let connection;
  try {
    connection = await db.getConnection();
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
  }finally {
    if (connection) await connection.close();  // ← 항상 반환
  }
});

// delete
router.delete('/:stuNo', async (req, res) => {
  console.log("delete 호출")
  console.log(req.params);
  const {stuNo } = req.params;
  // console.log(stuNo)
  try {
    let connection = await db.getConnection();
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
  }finally {
    if (connection) await connection.close();  // ← 항상 반환
  }
});

//insert
router.post('/', async (req, res) => {
  console.log("post 호출")
  console.log(req.body);
  const {stuNo, stuName, stuDept, stuGrade } = req.body;
  console.log(stuNo)
  try {
    let connection = await db.getConnection();
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
  }finally {
    if (connection) await connection.close();  // ← 항상 반환
  }
});

// edit
router.put('/:stuNo', async (req, res) => {
  const { stuNo} = req.params;
  const { STU_NAME, STU_DEPT, STU_GRADE } = req.body;  // 대문자로
  try {
    let connection = await db.getConnection();
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
  }finally {
    if (connection) await connection.close();  // ← 항상 반환
  }
});

// detail & view
router.get('/:stuNo', async (req, res) => {
  const { stuNo } = req.params;
  console.log("stuNo 확인:", stuNo);
  try {
    let connection = await db.getConnection();
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
  }finally {
    if (connection) await connection.close();  // ← 항상 반환
  }
});