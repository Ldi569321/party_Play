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

const maxAge = 1000 * 60 * 30;

//세션     ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.use(session({
  secret: "asdfasffdas",
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({ checkPeriod: maxAge }),
  cookie: { maxAge },
}))

//메인화면
app.get('/main', (req, res) => {
  //카테고리가 있을때
  if (req.query.cat != null) {
    console.log(req.query.cat);
    let categorySQL;
    if (req.query.cat == 'all') {
      categorySQL = `SELECT party_num, title, category, result_price, party_per, end_date, start_date, state, answer, IF(member like '%${req.session.uid}%', '1', '0') as mem FROM party ORDER BY party_num DESC`;
    } else {
      categorySQL = `SELECT party_num, title, category, result_price, party_per, end_date, start_date, state, answer, IF(member like '%${req.session.uid}%', '1', '0') as mem FROM party WHERE category = '${req.query.cat}' ORDER BY party_num DESC`;
    }

    conn.query(categorySQL, (err, row) => {
      if (err) throw err;
      const row_len = Object.keys(row).length;
      let result = [];
      row.forEach(row => {
        let info = {}
        info.party_num = row.party_num;
        info.title = row.title;
        info.category = row.category;
        info.result_price = row.result_price;
        info.party_per = row.party_per;
        info.end_date = row.end_date;
        info.start_date = row.start_date;
        info.state = row.state;
        info.answer = row.answer;
        info.mem = row.mem;
        result.push(info);
      })
      if (req.session.uid != null || req.session.isLogined == true) {
        res.render('mainFormLogined', { result: result, total: row_len, session_uid: req.session.uid });

      } else {
        req.session.uid = null;
        req.session.isLogined = false;
        res.render('mainForm', { result: result, total: row_len });
      }
    });
  }
  //카테고리가 없을때
  else {
    const mainSQL = `SELECT party_num, title, category, result_price, party_per, end_date, start_date, state, answer, IF(member like '%${req.session.uid}%', '1', '0') as mem FROM party ORDER BY party_num DESC`;
    conn.query(mainSQL, (err, row) => {
      if (err) throw err;
      const row_len = Object.keys(row).length;

      let result = [];

      row.forEach(row => {
        let info = {}
        info.party_num = row.party_num;
        info.title = row.title;
        info.category = row.category;
        info.result_price = row.result_price;
        info.party_per = row.party_per;
        info.end_date = row.end_date;
        info.start_date = row.start_date;
        info.state = row.state;
        info.answer = row.answer;
        info.mem = row.mem;
        result.push(info);
      })
      console.log(result);
      if (req.session.uid != null || req.session.isLogined == true) {
        res.render('mainFormLogined', { result: result, total: row_len, session_uid: req.session.uid });

      } else {
        req.session.uid = null;
        req.session.isLogined = false;
        res.render('mainForm', { result: result, total: row_len });
      }
    });
  }
});

//계정 섹션 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//로그인
app.get('/login', (req, res) => {
  res.render('loginForm');
});

//로그인 쿼리
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
    req.session.destroy(function () {
      req.session;
      res.write(`<script>location.href="/main";</script>`);
    });
  } else {
    req.session.destroy(function () {
      req.session;
      res.write(`<script>location.href="/main";</script>`);
    });
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
      if (err) throw err;
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


//계정찾기
app.get('/findAccount', (req, res) => {
  res.render('findAccountForm');
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

//계정출력
app.get('/foundAccount', (req, res) => {
  res.render('foundAccountForm');
});

//정산
app.get('/calculate', (req, res) => {
  console.log(req.query.party_num)
  if (req.session.uid != null || req.session.isLogined == true) {
    const calculateSQL = `select LENGTH(member) - LENGTH(REPLACE(member, ',', '')) as person, result_price from party where party_num='${req.query.party_num}';`
    conn.query(calculateSQL, (err, row) => {
      res.render('calculateForm', {
        max_price: row[0].person * row[0].result_price
      });
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});


//파티 섹션 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
app.post('/createPartySys', (req, res) => {
  console.log(req.body);
  const cretePartySQL = `INSERT INTO party (title, party_per, start_Date, end_Date, day_price, result_price, kakaoChat, kakaoChat_pass, answer, category, party_leader)
                                      values ('${req.body.title}', '${req.body.party_per}', '${req.body.start_Date}', 
                                      '${req.body.end_Date}','${req.body.dayPrice}', '${req.body.resultPrice}', 
                                      '${req.body.kakaoChat}','${req.body.kakaoChat_pass}','${req.body.answer}','${req.body.category}','${req.session.uid}');`;
  conn.query(cretePartySQL, (err, row) => {
    if (err) throw err;
    res.write('<script>location.href="/main"</script>')
  })
})

//파티 정보
app.get('/partyDetails', (req, res) => {
  console.log(req.params.party_num);
  const partyDetailSQL = `SELECT title, party_leader, party_num, category, end_date, start_date, result_price, answer, member, state, party_per FROM party WHERE party_num='${req.query.party_num}' ORDER BY party_num DESC`;
  conn.query(partyDetailSQL, (err, row) => {
    console.log(row[0].party_leader, )
    res.render('partyDetailsForm', {
      title: row[0].title,
      leader: row[0].party_leader,
      party_num: row[0].party_num,
      end_date: row[0].end_date,
      result_price: row[0].result_price,
      answer: row[0].answer,
      session_uid: req.session.uid,
      state: row[0].state,
      party_per: row[0].party_per
    })
  })
});

//파티수정
app.get('/partyEdit', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    const partyEditlSQL = `SELECT party_num, title, category, result_price, party_per, start_date, day_price, end_date, state, kakaoChat, kakaoChat_pass, answer FROM party WHERE party_num='${req.query.party_num}' ORDER BY party_num DESC`;
    conn.query(partyEditlSQL, (err, row) => {
      res.render('partyEditForm', {
        category: row[0].category,
        title: row[0].title,
        party_per: row[0].party_per,
        start_date: row[0].start_date,
        day_price: row[0].day_price,
        result_price: row[0].result_price,
        end_date: row[0].end_date,
        state: row[0].state,
        kakaoChat: row[0].kakaoChat,
        kakaoChat_pass: row[0].kakaoChat_pass,
        answer: row[0].answer,
        party_num: req.query.party_num
      });
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//파티 수정 쿼리
app.post('/reviseparty', (req, res) => {
  console.log(req.body);
  const revisepartySQL = `UPDATE party SET category = '${req.body.category}', title = '${req.body.title}',
  party_per = '${req.body.party_per}', start_date = '${req.body.start_date}', end_date = '${req.body.end_date}', 
  day_price = '${req.body.day_price}', result_price = '${req.body.result_price}', state = '${req.body.state}',
  kakaoChat = '${req.body.kakaoChat}', kakaoChat_pass = '${req.body.kakaoChat_pass}', answer = '${req.body.answer}' WHERE party_num = '${req.body.party_num}';`
  conn.query(revisepartySQL, (err, row) => {
    if (err) throw err;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert("파티 수정이 완료 되었습니다.");
    location.href="/partyManageMain"</script>`);
  })
})

//파티참가
app.get('/partyJoin', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    const partyJoinSQL = `SELECT title, party_leader, party_num, category, end_date, start_date, result_price, answer, member FROM party WHERE party_num='${req.query.party_num}' ORDER BY party_num DESC`;
    conn.query(partyJoinSQL, (err, row) => {
      if (err) throw err;
      res.render('partyJoinForm', {
        party_num: req.query.party_num
      });
    })
  } else {
    res.writeHead(200, { 'Content-Type': '``text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});

//파티참가 쿼리
app.post('/partyJoin', (req, res) => {
  
})

//파티관리
app.get('/partyManageMain', (req, res) => {
  const mainSQL = `SELECT party_num, title, category, result_price, party_per, end_date, start_date, state, answer FROM party WHERE party_leader='${req.session.uid}' ORDER BY party_num DESC`;
  conn.query(mainSQL, (err, row) => {
    if (err) throw err;
    if (req.session.uid != null || req.session.isLogined == true) {
      const row_len = Object.keys(row).length;
      let Myresult = [];
      row.forEach(row => {
        let info = {}
        info.party_num = row.party_num;
        info.title = row.title;
        info.category = row.category;
        info.result_price = row.result_price;
        info.party_per = row.party_per;
        info.end_date = row.end_date;
        info.start_date = row.start_date;
        info.state = row.state;
        info.answer = row.answer;
        Myresult.push(info);
      });
      console.log(Myresult);
      res.render('partyManageMainForm', { Myresult: Myresult, total: row_len });
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
    }
  });

});

//파티 삭제
app.get('/delete', (req, res) => {
  console.log(req.query.party_num, req.query.title);
  //제목일치확인
  const titleSQL = `SELECT *, COUNT(*) r FROM party WHERE title = '${req.query.title}' AND party_num = '${req.query.party_num}';`;
  conn.query(titleSQL, (err, row) => {
    if (err) throw err;
    //파티 삭제
    if (row[0].r == 1) {
      const deleteSQL = `DELETE FROM party WHERE title = '${req.query.title}' AND party_num = '${req.query.party_num}';`;
      conn.query(deleteSQL, (err, row) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(`<script>alert('파티가 삭제되었습니다.');
                 location.href='main';
                 </script>`);
      })
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(`<script>alert('제목이 일치하지 않습니다.');
                 history.back();
                 </script>`);
    }
  })
})

//파티 가입완료폼
app.get('/partyIn', (req, res) => {
  let party_member = null;
  if (req.session.uid != null || req.session.isLogined == true) {
    const findPersonSQL = `select member from party where party_num = '${req.query.party_num}'`;
    conn.query(findPersonSQL, (err, row) => {
      if (err) throw err;
      party_member = row[0].member;
      if (err) throw err;
      const partyEditlSQL = `SELECT party_num, title, category, result_price, party_per, start_date, day_price, end_date, state, kakaoChat, kakaoChat_pass, answer, party_leader FROM party WHERE party_num='${req.query.party_num}' ORDER BY party_num DESC`;
      conn.query(partyEditlSQL, (err, row) => {
        res.render('partyInForm', {
          category: row[0].category,
          title: row[0].title,
          party_per: row[0].party_per,
          start_date: row[0].start_date,
          day_price: row[0].day_price,
          result_price: row[0].result_price,
          end_date: row[0].end_date,
          state: row[0].state,
          kakaoChat: row[0].kakaoChat,
          kakaoChat_pass: row[0].kakaoChat_pass,
          answer: row[0].answer,
          party_num: req.query.party_num,
          party_leader: row[0].party_leader
        });
      })
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
})

//파티 가입완료 쿼리
app.post('/partyIn', (req, res) => {
  let party_member = null;
  if (req.session.uid != null || req.session.isLogined == true) {
    const partyJoinSQL = `INSERT INTO sendInfo VALUES ('${req.body.party_num}', '${req.session.uid}', '${req.body.send_id}', '${req.body.send_pay}', '${req.body.send_email}')`;
    conn.query(partyJoinSQL, (err, row) => {
      if (err) throw err;
      const findPersonSQL = `select member from party where party_num = '${req.body.party_num}'`;
    conn.query(findPersonSQL, (err, row) => {
      if (err) throw err;
      party_member = row[0].member;
      if (party_member == null) {
        party_member = '';
      }
      console.log()
      const partyInSQL = `UPDATE party SET member='${req.session.uid}, ${party_member}', party_per= party_per-1 where party_num = '${req.body.party_num}'`
      conn.query(partyInSQL, (err, row) => {
        if (err) throw err;
        const partyEditlSQL = `SELECT party_num, title, category, result_price, party_per, start_date, day_price, end_date, state, kakaoChat, kakaoChat_pass, answer, party_leader FROM party WHERE party_num='${req.body.party_num}' ORDER BY party_num DESC`;
        conn.query(partyEditlSQL, (err, row) => {
          res.render('partyInForm', {
            category: row[0].category,
            title: row[0].title,
            party_per: row[0].party_per,
            start_date: row[0].start_date,
            day_price: row[0].day_price,
            result_price: row[0].result_price,
            end_date: row[0].end_date,
            state: row[0].state,
            kakaoChat: row[0].kakaoChat,
            kakaoChat_pass: row[0].kakaoChat_pass,
            answer: row[0].answer,
            party_num: req.query.party_num,
            party_leader: row[0].party_leader
          });
        })
      })
    })
    })
    
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
})


//고객센터 섹션 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

//문의 발송
app.post('/recordSend', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    const recordSendSQL = `INSERT INTO CustomerService (category, question, id, state, date) VALUES ('${req.body.category}', '${req.body.question}', '${req.session.uid}', '0', curdate());`
    conn.query(recordSendSQL, (err, row) => {
      if(err) throw err;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(`<script>alert('성공적으로 발송 되었습니다.');
      location.href="record";
      </script>`);
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
})

//문의내용
app.get('/recordDetails', (req, res) => {
  if (req.session.uid != null || req.session.isLogined == true) {
    const recordDetailSQL = `SELECT service_num, category, question, DATE_FORMAT(date, "%Y-%m-%d") date, state, answer FROM CustomerService WHERE service_num='${req.query.service_num}';`;
    conn.query(recordDetailSQL, (err, row) => {
      if(err) throw err;
      res.render('recordDetailsForm', {
        service_num: row[0].service_num,
        category: row[0].category,
        question: row[0].question,
        date: row[0].date,
        state: row[0].state,
        answer: row[0].answer
      });
    })
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
    const recordSQL = `SELECT service_num, category, question, DATE_FORMAT(date, "%Y-%m-%d") date, state FROM CustomerService WHERE id='${req.session.uid}' ORDER BY service_num DESC;`;
    conn.query(recordSQL, (err, row) => {
      const row_len = Object.keys(row).length;
      let result = [];
      row.forEach(row => {
        let info = {}
        info.service_num = row.service_num;
        info.category = row.category;
        info.question = row.question;
        info.date = row.date;
        info.state = row.state;
        result.push(info);
      })
      res.render('recordForm', {result: result, total:row_len });
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
});


//어드민 관리 섹션 ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

app.get('/adminLusxO5L0NpJhJ8yqgv1v8t', (req, res) => {
  if (req.session.uid == 'admin5693' || req.session.isLogined == true) {
    const recordSQL = `SELECT service_num, category, question, DATE_FORMAT(date, "%Y-%m-%d") date, id, state FROM CustomerService ORDER BY service_num DESC;`;
    conn.query(recordSQL, (err, row) => {
      const row_len = Object.keys(row).length;
      let result = [];
      row.forEach(row => {
        let info = {}
        info.service_num = row.service_num;
        info.category = row.category;
        info.question = row.question;
        info.date = row.date;
        info.writer = row.id;
        info.state = row.state;
        result.push(info);
      })
      res.render('adminManagementForm', {result: result, total:row_len });
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('잘못된 접근입니다..');
    history.back();
    </script>`);
  }
})

app.get('/adminRecordAnswer', (req, res) => {
  if (req.session.uid == 'admin5693' || req.session.isLogined == true) {
    const recordDetailSQL = `SELECT service_num, category, question, DATE_FORMAT(date, "%Y-%m-%d") date, state, answer FROM CustomerService WHERE service_num='${req.query.service_num}';`;
    conn.query(recordDetailSQL, (err, row) => {
      if(err) throw err;
      res.render('adminRecordAnswerForm', {
        service_num: row[0].service_num,
        category: row[0].category,
        question: row[0].question,
        date: row[0].date,
        state: row[0].state,
        answer: row[0].answer
      });
    })
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('로그인후 이용 가능합니다.');
    history.back();
    </script>`);
  }
})

app.post('/supportAnswer', (req, res) => {
  if (req.session.uid == 'admin5693' || req.session.isLogined == true) {
  console.log(req.body);
  if(req.body.state == '답변완료'){
  const supportAnswer = `UPDATE CustomerService SET answer = '${req.body.answer}', state = '2' WHERE service_num = '${req.body.service_num}';`;
  conn.query(supportAnswer, (err, row) => {
    if(err) throw err;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(`<script>alert('답변 완료되었습니다.');
    location.href="adminLusxO5L0NpJhJ8yqgv1v8t";
    </script>`);
  })
  }else if(req.body.state == '검토중') {
    const supportAnswer = `UPDATE CustomerService SET state = '1' WHERE service_num = '${req.body.service_num}';`;
    conn.query(supportAnswer, (err, row) => {
      if(err) throw err;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(`<script>alert('상태가 검토중으로 변경되었습니다.');
      location.href="adminLusxO5L0NpJhJ8yqgv1v8t";
      </script>`);
    })
  }
  
} else {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write(`<script>alert('로그인후 이용 가능합니다.');
  history.back();
  </script>`);
}
})