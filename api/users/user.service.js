const pool = require("../../config/database");

module.exports = {
  getUsers: async (user_sub) => {
    await pool.query(`SELECT set_config('app.sub','${user_sub}',true)`);
    const result = await pool.query(
      `SELECT name, email FROM user`
    );
    
    return result;
  }
};