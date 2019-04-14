var fortune = require('./lib/fortune.js')


var express = require('express');

var app = express();

// 配置静态文件目录, 注意这个要放在最前面
// 参数 'static' 是目录的名字
app.use(express.static('public'));

// 设置 handlebar 视图引擎
var hanlebars = require('express3-handlebars')
        .create({ defaultLayout:'main'});
app.engine('handlebars', hanlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000); // 这里是什么意思 ？环境变量port 是什么意思

// 检查 url 查询字符串的中间件
// 必须放在所有路径之前
app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production'
                        && req.query.test === '1';
    next();
})

// 所有路由
app.get('/', (req, res)=>{
    // res.type('text/plain');
    // res.send('meadowlark travel')
    res.render('home');
})
app.get('/about', (req, res)=>{
    // res.type('text/plain');
    // res.send('about ...meadowlark travel')
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript:'/qa/tests-about.js'
    });
})


// 定制 404 页面 catch-all 处理器（中间件）
app.use(function (req, res, next) {
    // res.type('text/plain');
    // res.status(404);
    // res.send('404 Not Found');
    res.status(404);
    res.render('404');
});

// 505 错误处理器中间件
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), ()=> {
    console.log(
        'EXPRESS START ON http://localhost:' + app.get('port')
    )
})
