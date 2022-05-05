const Database = require('better-sqlite3')
const db = new Database('log.db')
const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog'`)
let row =  stmt.get();

if (row === undefined) {
    console.log('log database is missing. Creating log database.')
    const sqlInit = `CREATE TABLE accesslog ( id INTEGER PRIMARY KEY, remoteaddr VARCHAR, remoteuser VARCHAR, time VARCHAR, method VARCHAR, url TEXT, protocol TEXT, httpversion TEXT, status TEXT, referrer TEXT, useragent TEXT );`
    db.exec(sqlInit)
} else {
    console.log('Log database exists')
}
module.exports = db