var express = require('express');
var router = express.Router();
const pool = require('../sql/config')
const {createLogicHandler,ogicHandler} = require('./meth')
const myLogicHandler = createLogicHandler('myParameter');
const LogicHandler = ogicHandler('myParameter');

router.post('/getTableData',myLogicHandler,LogicHandler, (req, res) => {
  let sql = 'SELECT * FROM sys_menu';
  let queryParams = [];
  let whereClause = '';
  let totalCount = 0; // 用于存储总数据条数
 
  if (req.body.order_num && req.body.order_num !== '') {
    const order_num = parseInt(req.body.order_num, 10);
    if (!isNaN(order_num)) {
      whereClause += ' order_num = ?';
      queryParams.push(order_num);
    }
  }
 
  if (req.body.menu_name && req.body.menu_name !== '') {
    const menu_name = req.body.menu_name;
    if (whereClause) {
      whereClause += ' AND';
    }
    whereClause += ' menu_name LIKE ?';
    queryParams.push(`%${menu_name}%`); // 将通配符%拼接到name参数的前后  
  }
  // 检查remark参数，并构建WHERE子句进行模糊查询  
  if (req.body.remark && req.body.remark !== '') {
    if (whereClause) {
      whereClause += ' AND';
    }
    whereClause += ' remark LIKE ?';
    queryParams.push(`%${req.body.remark}%`);
  }
  // 检查pageSize和currentPage参数，并构建分页查询  
  if (req.body.pageSize && req.body.pageSize !== '') {
    const pageSize = parseInt(req.body.pageSize, 10);
    if (!isNaN(pageSize) && pageSize > 0) {
      if (req.body.currentPage && req.body.currentPage !== '') {
        const currentPage = parseInt(req.body.currentPage, 10);
        if (!isNaN(currentPage) && currentPage > 0) {
          const offset = (currentPage - 1) * pageSize;
          if (whereClause) {
            sql += ' WHERE' + whereClause; // 如果存在WHERE子句，则添加WHERE关键字  
          } else {
            sql += ' LIMIT ?, ?'; // 如果没有WHERE子句，则直接添加LIMIT  
          }
          queryParams.push(offset);
          queryParams.push(pageSize);
        }
      } else {
        if (whereClause) {
          sql += ' WHERE' + whereClause; // 如果有WHERE子句但无分页参数，则添加WHERE关键字  
        }
      }
    }
  } else {
    if (whereClause) {
      sql += ' WHERE' + whereClause; // 如果没有分页参数但有WHERE子句，则添加WHERE关键字  
    }
  }

  // 构建用于获取总数据条数的查询  
  let countSql = 'SELECT COUNT(*) FROM sys_menu';
  if (whereClause) {
    countSql += ' WHERE' + whereClause; // 如果存在WHERE子句，则用于总数据条数的查询也需要它  
  }
  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('Error connecting to database:', err);
      res.status(500).send({ code: 1, msg: '查询失败' });
      return;
    }
    connection.query(countSql, queryParams, function (error, results, fields) {
      if (error) {
        console.error('Error executing COUNT SQL:', error);
        connection.release(); // 发生错误时释放连接  
        res.status(500).send({ code: 1, msg: '查询失败' });
        return;
      }
      totalCount = results[0]['COUNT(*)']; // 假设返回结果中第一个对象的'COUNT(*)'键存储了总记录数
      connection.query(sql, queryParams, function (error, results, fields) {
        connection.release();
        if (error) {
          console.error('Error executing SQL:', error);
          res.status(500).send({ code: 1, msg: '查询失败' });
          return;
        }
        let apiRes = {
          code: 0,
          msg: "成功",
          data: results,
          total: totalCount
        };
        res.send(apiRes);
      });
    });
  });
});

module.exports = router;
