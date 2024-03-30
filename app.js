var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./logger')
const bodyPaser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var app = express();
app.all('/*', async function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // 如果需要支持携带凭证的请求  
    // res.header('Access-Control-Allow-Credentials', true);  
    // 设置预检请求的缓存时间（可选）  
    // res.header('Access-Control-Max-Age', 86400); // 24小时  
    next();
});
app.use(morgan('dev'));
app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({extended: false}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.use(function (req, res, next) {
    next(createError(404));
});

const _errorHandler = (err, req, res, next) => {
    logger.error(`${req.method} ${req.origianlUrl}` + err.message)
    const errorMsg = err.message
    res.status(err.status || 500).json({
        code: -1,
        success: false,
        message: errorMsg,
        data: {}
    })
}
app.use(_errorHandler)

module.exports = app;
