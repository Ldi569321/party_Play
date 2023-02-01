const mysql = require('mysql');  // mysql 모듈 로드
const conn = mysql.createConnection({  // mysql 접속 설정
  host: 'partyplay.cqysxu3bw1nu.ap-northeast-2.rds.amazonaws.com',
  port: '3306',
  user: 'root',
  password: 'ldi569321',
  database: 'partyPlay'
});

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const moment = require('moment');
const MemoryStore = require('memorystore')(session);
const ejs = require('ejs');
const app = express();

app.listen(3000, function () {
  console.log("Express서버가 포트:3000으로 라우팅 되었습니다. http://localhost:3000/main")
})

app.set('port', process.env.PORT || 3000);
app.use('/css', express.static(__dirname + '/static/css'));
app.use('/img', express.static(__dirname + '/static/img'));
app.use('/js', express.static(__dirname + '/static/js'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/static/views');
app.engine('html', require('ejs').renderFile);

const maxAge = 1000 * 60 * 5;

//세션
app.use(session({
  secret: "asdfasffdas",
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({ checkPeriod: maxAge }),
  cookie: { maxAge },
}))

//메인화면
app.get('/main', (req, res) => {
  console.log(req.session.uid);
  console.log(req.session.isLogined);
  const mainSQL = `SELECT party_num, title, category_menu, result_price, party_per, end_date, start_date, state, answer FROM party ORDER BY party_num DESC`;
  conn.query(mainSQL, (err, row) => {
    console.log(row)
    if (req.session.uid != null || req.session.isLogined == true) {
      res.render('mainFormLogined', {
        party: row
      });
    } else {
      req.session.uid = null;
      req.session.isLogined = false;
      res.render('mainForm', {
        party_num: row[0].party_num,
        title: row[0].title,
        category: row[0].party_menu,
        result_price: row[0].result_price,
        party_person: row[0].party_per,
        end_date: row[0].end_date,
        start_date: row[0].start_date,
        state: row[0].state,
        answer: row[0].answer,
        count: row.length
      });
    }
  });
});

//로그인
app.get('/login', (req, res) => {
  res.render('loginForm');
});

app.post('/signIn', (req, res) => {
  console.log(req.body);
  const signInSQL = `SELECT count(*) as r, id, password, name FROM account WHERE id='${req.body.id}' AND password='${req.body.password}'`;
  conn.query(signInSQL, (err, userList) => {
    if (err) throw err;
    console.log(userList);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (userList[0].r == 0) {
      console.log("로그인 실패");
      res.write('<script>alert("아이디 또는 비밀번호를 확인해 주세요"); history.back(); </script>');
      return res.end();
    } else if (userList[0].r == 1) {

      console.log(`${userList[0].name}님 로그인 시도`);
      res.write(`<script>alert('${userList[0].name}님 로그인 되었습니다.');
      </script>`);
      req.session.uid = userList[0].id;
      req.session.isLogined = true;
      req.session.save(function () {
        res.write(`<script>location.href="/main";</script>`);
        return res.end();
      });
    }
  })
})

//로그아웃
app.get('/logOut', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    req.session.uid = null;
    req.session.isLogined = false;
    res.render('mainForm');
  } else {
    req.session.uid = null;
    req.session.isLogined = false;
    res.render('mainForm');
  }
});

//회원가입
app.get('/register', (req, res) => {
  res.render('registerForm');
});

//회원가입 쿼리
app.post('/NewRegister', (req, res) => {
  console.log(req.body);
  const today = new Date();

  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);

  const datetime = year + '-' + month + '-' + day;


  const registerSQL = `INSERT INTO account (id, password, passwordCheck, name, tel, datetime, Notification) values ('${req.body.userId}', '${req.body.password}', '${req.body.passwordCheck}', '${req.body.userName}', '${req.body.tel}','${datetime}' , '${req.body.notification}');`;
  conn.query(registerSQL, function (err, result) {
    if (err) throw err;
    console.log(`${req.body.userName}님 회원가입 완료`);
  })
  res.render('loginForm');
})

//중복확인 기능
app.get('/overlapCheck', (req, res) => {
  const innerId = req.query.innerId;
  const overlapCheckSQL = `SELECT COUNT(id) id FROM account WHERE id='${innerId}'`;
  return conn.query(overlapCheckSQL, function (err, row) {
    if (err) throw err;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (row[0].id == '1') {
      res.write(`<script>alert('"${innerId}"는 중복된 아이디 입니다.');
      history.back();
      </script>`);
      return res.end();
    } else if (row[0].id == '0') {
      res.write(`<script>alert('"${innerId}"는 사용 가능한 아이디 입니다.');
      history.back();
      </script>`);
      return res.end();
    }
  })
});

//내정보
app.get('/account', (req, res) => {
  console.log(req.session);
  if (req.session.uid != null || req.session.isLogined == true) {
    const id = req.session.uid;
    const accountSQL = `SELECT name, tel, id, datetime, Notification FROM account WHERE id = '${id}';`
    conn.query(accountSQL, (err, result) => {
      console.log(result[0]);
      let Notificate = result[0].Notification;
      if (Notificate == 1) {
        Notificate = '예';
      } else {
        Notificate = '아니요';
      }
      console.log(result[0]);
      res.render('accountForm', {
        name: result[0].name,
        tel: result[0].tel,
        id: result[0].id,
        datetime: result[0].datetime,
        Notification: Notificate
      });
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//파티관리
app.get('/partyManageMain', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    res.render('partyManageMainForm');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//고객센터
app.get('/support', (req, res) => {
  console.log(req.session);
  if (req.session.uid != null || req.session.isLogined == true) {
    res.render('supportForm');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//파티생성
app.get('/createParty', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    res.render('createPartyForm');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//파티생성 쿼리
app.post('/cretePartySys', (req, res) => {
  console.log(req.body);
  const cretePartySQL = `INSERT INTO party (title, party_per, start_Date, end_Date, day_price, result_price, kakaoChat, kakaoChat_pass, answer, category_menu, party_leader)
                                      values ('${req.body.title}', '${req.body.party_per}', '${req.body.start_Date}', 
                                      '${req.body.end_Date}', '${req.body.dayPrice}', '${req.body.resultPrice}', 
                                      '${req.body.kakaoChat}', '${req.body.kakaoChat_pass}', '${req.body.answer}', '${req.body.category}', '${req.session.uid}');`;
  conn.query(cretePartySQL, (err, row) => {
    if (err) throw err;
    res.sendFile(__dirname + '/static/views/mainForm');
  })
})

//정산
app.get('/calculate', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    res.render('calculateForm');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//계정찾기
app.get('/findAccount', (req, res) => {
  res.render('findAccountForm');
});

//계정출력
app.get('/foundAccount', (req, res) => {
  res.render('foundAccountForm');
});

//계정찾기 기능
app.post('/findMyAcount', (req, res) => {
  console.log(req.body);
  const findMyAcountSQL = `SELECT name, tel, id, password, COUNT(*) as r FROM account WHERE name = '${req.body.findName}' AND tel = '${req.body.findTel}'`
  conn.query(findMyAcountSQL, function (err, row) {
    if (err) throw err;
    if (row[0].r == 1) {
      console.log(row[0]);
      console.log(req.session.findAccount);
      res.render('foundAccountForm', {
        name: row[0].name,
        tel: row[0].tel,
        id: row[0].id,
        password: row[0].password
      })
    } else {
      console.log("계정을 찾을수 없습니다.");
    }
  })
});

//파티 정보
app.get('/partyDetails', (req, res) => {
  res.render('partyDetailsForm');
});

//파티수정
app.get('/partyEdit', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    res.render('partyEditForm');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//파티참가
app.get('/partyJoin', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    res.render('partyJoinForm');
  } else {
    res.writeHead(200, { 'Content-Type': '``text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//문의내용
app.get('/recordDetails', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    res.render('recordDetailsForm');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//문의내역
app.get('/record', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    return res.render('recordForm');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});
