var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 引入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// 創建 express 應用
var app = express();

// 設定視圖引擎
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 設定路由
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 在 express.js 中，使用 sqlite3 來操作數據庫，並開啟位置在 db/sqlite.db 的資料庫，需要確認是否成功打開資料庫
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the sqlite database.');
});

// 若Gas table 不存在，則會自動建立一個新的table
db.run('CREATE TABLE IF NOT EXISTS ' +
    'Gas (ID INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'Year INTEGER NOT NULL, ' +
    'GasType TEXT NOT NULL, ' +
    'Price REAL NOT NULL)');

// 撰寫 /api 路由，使用 SQL 來查詢GasType的所有Year、Price；
app.get('/api', (req, res) => {
    let GasType = req.query.GasType;
    let sql = 'SELECT Year, GasType, Price FROM Gas WHERE GasType = ?';
    db.all(sql, [GasType], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(rows);
    });
});

module.exports = app;
