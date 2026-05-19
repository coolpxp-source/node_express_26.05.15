const express = require('express');
const oracledb = require('oracledb');
const db = require("../db"); // db파일 참조
const router = express.Router(); // 라우터 사용을 위한 호출

module.exports = router; // app에서 참조할 수 있도록 넣는 코드

// '/' -> '/board' 기본 주소다. 
router.get('/', async (req, res) => { // get 앞에도 app 대신 router로 변경.
const { keyword, sortBy } = req.query; // 1. 먼저 받고
const allowedSort = ['CDATETIME', 'TITLE', 'CNT']; // 2. 검증하고
const orderBy = allowedSort.includes(sortBy) ? sortBy : 'CDATETIME';

  let connection; // try 밖으로 빼야 finally connection.close()에서 접근 가능
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
        `
        SELECT 
            BOARDNO,
            TITLE,
            USERID,
            CONTENTS,
            CNT,
            TO_CHAR(CDATETIME, 'YYYY-MM-DD') AS "CDATE"
        FROM TBL_BOARD 
        WHERE TITLE LIKE :keyword     
        ORDER BY ${orderBy} DESC 
        `,
        {keyword: `%${keyword || ''}%` },
    );
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

// detail & view
router.get('/:boardNo', async (req, res) => {
  const { boardNo } = req.params;
//   console.log("boardNo 확인:", boardNo);
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT 
            BOARDNO, 
            TITLE, 
            USERID, 
            CONTENTS, 
            CNT,
        TO_CHAR(CDATETIME, 'YYYY-MM-DD') AS "CDATE"
        FROM TBL_BOARD 
        WHERE BOARDNO = :boardNo`,
        { boardNo: boardNo } 
    );

    // ← 조회 결과 없으면 빈 객체 반환
    if (result.rows.length === 0) {
      return res.json({ 
            result: "success", 
            info: {} 
        });
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

// delete
router.delete('/:boardNo', async (req, res) => {
  console.log("delete 호출")
  console.log(req.params);
  const {boardNo} = req.params;
  // console.log(boardNo)
  let connection;
  try {
    connection= await db.getConnection();
    const result = await connection.execute(
        `DELETE 
        FROM TBL_BOARD 
        WHERE BOARDNO =:boardNo`,
      { boardNo: boardNo },
      {autoCommit : true}
    );
    // await : 작업이 다 끝날 때까지 코드가 아래로 내려가지 않도록 방지함. =>대기 상태.
    // console.log(result);
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
router.put('/:boardNo', async (req, res) => {
  const {boardNo} = req.params;
  const { TITLE, CONTENTS } = req.body;  // 대문자로
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute( // key랑 :바인딩변수만 일치하면 대소문자 무관
      `UPDATE TBL_BOARD SET 
          TITLE=:title, 
          CONTENTS=:contents
          WHERE BOARDNO=:boardNo
      `,
     { title: TITLE, contents: CONTENTS, boardNo: boardNo },  // key랑 :바인딩변수만 일치하면 대소문자 무관
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