const express = require('express');
const oracledb = require('oracledb');
const db = require("../db");
const router = express.Router();

module.exports = router;

router.get('/', async (req, res) => {
  const { } = req.query;
  let connection;
  try {
    connection = await db.getConnection();
    const result = await connection.execute(
      `SELECT * FROM PRODUCT`,
      [],
      // result 안에 rows는 키 안에 json형태로 db데이터를 반환
      {outFormat: oracledb.OUT_FORMAT_OBJECT}
    );
    
    res.json({
        result : "success",
        list : result.rows
    });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error executing query');
    } finally {
        connection.close();
    }
});
  
  // detail & view
  router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    console.log("productId 확인:", productId);
    let connection;
    try {
     connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT * FROM PRODUCT WHERE PRODUCT_ID = :productId`, [productId]
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

 // insert
router.post('/', async (req, res) => {
  console.log("post 호출");
  console.log(req.body);
  
  const { id, name, brand, price, desc } = req.body;
  
  // connection 변수를 try 블록 밖에서 미리 선언해줍니다 (finally에서 사용하기 위함)
  let connection; 
  
  try {
    connection = await db.getConnection();
    
    // SQL문 안의 :id, :name 변수 순서대로 배열에 값을 넣어줍니다.
    const result = await connection.execute(
      `INSERT INTO PRODUCT (PRODUCT_ID, PRODUCT_NAME, BRAND, PRICE, DESCRIPTION) 
       VALUES (:id, :name, :brand, :price, :description)`,
      [id, name, brand, price, desc], 
      { autoCommit: true }
    );
    
    console.log(result);

    res.json({
        result: "success",
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  } finally {
    // 이제 여기서 connection을 안전하게 닫을 수 있습니다.
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Connection close error", err);
      }
    }
  }
});

