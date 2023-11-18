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

  static async get(username) {
    const result = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at
                                    FROM users
                                    WHERE username = $1`,[username])
    const user = result.rows[0]
    return user
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const results= await db.query(`SELECT m.id,
                                  m.to_username AS username,
                                  t.first_name AS first_name,
                                  t.last_name AS last_name,
                                  t.phone AS phone,
                                  m.body,
                                  m.sent_at,
                                  m.read_at
                                  FROM messages AS m
                                  JOIN users AS t ON m.to_username = t.username
                                  WHERE m.from_username = $1`, [username])
      return results.rows.map(m=>{
        return{
          id: m.id,
          body: m.body,
          sent_at: m.sent_at,
          read_at: m.read_at,
          to_user: {
            username: m.username,
            first_name: m.first_name,
            last_name: m.last_name,
            phone: m.phone
          }
        }
    })                             
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(`SELECT m.id,
                                    m.from_username AS username,
                                    f.first_name AS first_name,
                                    f.last_name AS last_name,
                                    f.phone AS phone,
                                    m.body,
                                    m.sent_at,
                                    m.read_at
                                    FROM messages AS m
                                    JOIN users AS f ON m.from_username = f.username
                                    WHERE m.to_username = $1`, [username])
    return results.rows.map(m=>{
        return{
          id: m.id,
          body: m.body,
          sent_at: m.sent_at,
          read_at: m.read_at,
          from_user: {
            username: m.username,
            first_name: m.first_name,
            last_name: m.last_name,
            phone: m.phone
          }
        }
    })
  }
}


module.exports = User;