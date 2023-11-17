/** User class for message.ly */

const db = require('../db')
const bcrypt = require('bcrypt')
const {BCRYPT_WORK_FACTOR} = require('../config')

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashPass = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const joinAt = new Date()
    const result = await db.query(`
                                  INSERT INTO users (username,password,first_name,last_name,phone,join_at)
                                  VALUES ($1,$2,$3,$4,$5,$6)
                                  RETURNING username, password, first_name, last_name, phone
                                `,[username,hashPass,first_name,last_name,phone,joinAt])
    return result.rows[0]
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const r = await db.query(`SELECT username, password, first_name, last_name, phone
                          FROM users WHERE username=$1`,[username])
    const user = r.rows[0] ? r.rows[0] : undefined
    if(user){
      if(await bcrypt.compare(password,user.password)){
        return true
      }
    }
    return false
    
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const last_login_at = new Date()

    const results = await db.query(`UPDATE users
                                    SET last_login_at = $1
                                    WHERE username = $2`, [last_login_at,username])
    
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const results = await db.query(`SELECT username, first_name, last_name, phone
                                    FROM users`)
    const users = results.rows
    return users
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;