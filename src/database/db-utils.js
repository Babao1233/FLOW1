/**
 * Các tiện ích làm việc với cơ sở dữ liệu
 */

const pool = require('../../database');
const logger = require('../utils/logger');

/**
 * Thực hiện query SQL với tham số và trả về kết quả
 * @param {string} queryText - Câu truy vấn SQL
 * @param {Array} params - Tham số cho câu truy vấn
 * @returns {Promise<Object>} - Kết quả truy vấn
 */
const executeQuery = async (queryText, params = []) => {
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, params);
    return result;
  } catch (err) {
    logger.error(`Lỗi thực hiện query: ${queryText}`, err);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Thực hiện nhiều query trong một transaction
 * @param {Array<Object>} queries - Mảng các đối tượng {query, params}
 * @returns {Promise<Array>} - Mảng kết quả các query
 */
const executeTransaction = async (queries) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const q of queries) {
      const result = await client.query(q.query, q.params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Lỗi thực hiện transaction', err);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Kiểm tra tình trạng kết nối đến cơ sở dữ liệu
 * @returns {Promise<boolean>} - true nếu kết nối thành công
 */
const checkConnection = async () => {
  try {
    const result = await executeQuery('SELECT NOW()');
    logger.info('Kết nối cơ sở dữ liệu thành công');
    return true;
  } catch (err) {
    logger.error('Không thể kết nối đến cơ sở dữ liệu', err);
    return false;
  }
};

/**
 * Đếm số bản ghi trong một bảng
 * @param {string} tableName - Tên bảng
 * @param {string} condition - Điều kiện WHERE (không bao gồm từ khóa WHERE)
 * @param {Array} params - Tham số cho điều kiện
 * @returns {Promise<number>} - Số bản ghi
 */
const countRecords = async (tableName, condition = '', params = []) => {
  const query = `SELECT COUNT(*) as count FROM ${tableName} ${condition ? 'WHERE ' + condition : ''}`;
  const result = await executeQuery(query, params);
  return parseInt(result.rows[0].count);
};

/**
 * Kiểm tra sự tồn tại của một bảng
 * @param {string} tableName - Tên bảng cần kiểm tra
 * @returns {Promise<boolean>} - true nếu bảng tồn tại
 */
const tableExists = async (tableName) => {
  const query = `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    ) as exists
  `;
  const result = await executeQuery(query, [tableName]);
  return result.rows[0].exists;
};

module.exports = {
  executeQuery,
  executeTransaction,
  checkConnection,
  countRecords,
  tableExists
};