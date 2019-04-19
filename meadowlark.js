var fortune = require('./lib/fortune.js')
var formidable = require('formidable')
var jqupload = require('jquery-file-upload-middleware');


var express = require('express');
const bodyParser = require('body-parser');
// 配置 body-parser, 把前端发送过来的数据自动解析成 json 格式
// 要求请求 header 中 Content-Type 的值为 'application/json'


var app = express();

// 配置静态文件目录, 注意这个要放在最前面
// 参数 'static' 是目录的名字
app.use(express.static('public'));
app.use(require('body-parser')())
app.use('/upload', (req, res, next)=>{
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function () {
            return _dirname + '/public/uploads/' + now;
        },
        uploadUrl: function () {
            return '/uploads/' + now;
        }
    })(req, res, next);
})

app.set('port', process.env.PORT || 3000); // 这里是什么意思 ？环境变量port 是什么意思


// 设置 handlebar 视图引擎
var hanlebars = require('express3-handlebars')
        .create({
            defaultLayout:'main',
            helpers: {
                section: function (name, options) {
                    if (!this._sections) {
                        this._sections = {};
                    }
                    this._sections[name] = options.fn(this);
                    return null;
                }
            }
        });
app.engine('handlebars', hanlebars.engine);
app.set('view engine', 'handlebars');


// 测试： 检查 url 查询字符串的中间件
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
app.get('/tours/hood-river', (req, res)=>{
    res.render('tours/hood-river')
})
app.get('/tours/request-group-rate', (req, res)=> {
    res.render('tours/request-group-rate');
})

app.get('/headers', function (req, res) {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for (var name in req.headers) {
        s += name + ': ' + req.headers[name] + '\n' + req.path;
        res.send(s);
    }
})
app.get('/error', (req, res)=>{
    res.type('text/plain');
    res.status(500);
    res.send('error')
})
app.get('/greeting', (res, req)=>{
    res.render('about', {
        message: 'welcome',
        style: req.query.style,
        userid: req.cookie.userid,
        username: req.session.username,
    })
})

let todoList = []
const addTodo = (data)=>{
    if (todoList.length === 0) {
        data.id = 1
    } else {
        let tail = todoList[todoList.length - 1]
        data.id = tail.id + 1
    }
    todoList.push(data)
    return data
}
app.post('/addlist', (res,req)=>{
    let data = req.body
    console.log('客户端传来的data', data)
    let _todoList = addTodo(data)
    let r = JSON.stringify(_todoList)
    res.send(r)
})

// 中间件
app.use(function (req, res, next) {
    if (!res.locals.partials) {
        res.locals.partials = {}
    }
    res.locals.partials.weather = getWeatherData();
    next();
})

app.get('nursery-rhyme', function (req, res) {
    res.render('nursery-rhyme')
})
app.get('/data/nursery-rhyme', function (req, res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    })
})

app.get('/newsletter', function (req, res) {
    // 我们后面会学到csrf， 目前只提供一个虚拟值
    res.render('newsletter', {csrf: 'CSRF token goes here'})
})
app.post('/process', (req, res)=> {
    console.log('From from querysring:', req.query.form);
    console.log('CSRF token from hidden form field', req.body._csrf);
    console.log('Name and Email', req.body.name, req.body.email)
    res.redirect(303, '/thank-you')
})

app.get('/contest/vacation-photo', (req, res)=>{
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    })
})
app.post('/contest/vacation-photo/:year/:month', (req, res)=>{
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            return res.redirect(303, '/error');
        }
        console.log('received fields : ', fields);
        console.log('received files : ', files);
        res.redirect(303, '/thank-you');
    })
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


function getWeatherData() {
    return {
        locations:[
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.heml',
                iconUrl: 'http://icon-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.heml',
                iconUrl: 'http://icon-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.heml',
                iconUrl: 'http://icon-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            }
        ]
    }
}
