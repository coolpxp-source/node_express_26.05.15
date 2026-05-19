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

  let connection;
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