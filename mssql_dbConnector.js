const express = require('express');
const sql = require('mssql');
const app = express();
// JSON 데이터 처리 미들웨어
app.use(express.json());

// SQL 접속 설정
const pool = new sql.ConnectionPool({
    user: 'sa',                         // DB 사용자 이름
    password: 'sunjin@6817',            // DB 사용자의 암호
    server: '192.168.10.21',            // DB 서버 주소
    database: 'TestDB',                 // DB의 데이터베이스 이름
    options:{
        encrypt : false,                // DB 서버 주소가 IP일 경우 에러 방지
        trustServerCertificate: true    // 자체 신뢰 서버 인증
    },
});

// 데이터베이스 연결
// node .\mssql_dbConnector.js
pool.connect((err) =>{
    // 연결이 안될 경우 에러 내용 콘솔에 출력
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }

    // 연결에 성공할 경우 연결 성공 메시지 콘솔에 출력
    console.log('Connected to database');
});

app.listen(3000, () => {
    console.log('Express server listening on port 3000');
});

/* CREATE */
// app.post : HTTP POST 요청을 처리하는 Express 라우트 핸들러
// '/user' : API의 엔드포인트 URL (이 경로로 POST 요청 보낼 수 있음)
// async (req, res) : 비동기 함수 정의 
//  => res : 클라이언트의 요청 데이터 포함 객체 / res : 서버에서 클라이언트로 응답 보낼 때 사용 객체
app.post('/user', async (req, res) => {
    console.log('Request received:', req.body);
    try {
        // 데이터베이스 연결 풀 저장하는 변수
        // 클라이언트 요청의 본문(req.body)에서 필요한 데이터를 구조 분해 할당으로 추출
        const { date, dayOfWeek, category, description, time, bank, income, expense, fulldate } = req.body;
        // 데이터베이스에 요청을 준비하는 메서드
        await pool.request()
            // SQL 쿼리에 사용할 입력 파라미터 설정
            //  => 'date' : 파라미터 이름 / sql.VarChar : 데이터 타입 / date : 클라이언트가 보낸 값
            .input('date', sql.VarChar, date)
            .input('dayOfWeek', sql.VarChar, dayOfWeek)
            .input('category', sql.VarChar, category)
            .input('description', sql.VarChar, description)
            .input('time', sql.VarChar, time)
            .input('bank', sql.VarChar, bank)
            .input('income', sql.Int, income)
            .input('expense', sql.Int, expense)
            .input('fulldate', sql.VarChar, fulldate)
            // SQL 쿼리 실행
            .query('INSERT INTO dbo.TbTest (date, dayOfWeek, category, description, time, bank, income, expense, fulldate) VALUES (@date, @dayOfWeek, @category, @description, @time, @bank, @income, @expense, @fulldate)');
        res.send('Data inserted successfully');    
    }
    catch (err) {
        console.error('Server error:', err);
        res.status(500).send(err.message);
    }
});

/* READ */
app.get('/user', (req, res) => {
    pool.request().query('SELECT * FROM dbo.TbTest', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }

        res.json(result.recordset);
    });
}); 

/* UPDATE */
app.put('/user/:id', async (req, res) =>{
    try{
        console.log('Request received:', req.body);
        const { id } = req.params;
        const { date, dayOfWeek, category, description, time, bank, income, expense, fulldate } = req.body;
        await pool.request()
            // SQL 쿼리에 사용할 입력 파라미터 설정
            //  => 'date' : 파라미터 이름 / sql.VarChar : 데이터 타입 / date : 클라이언트가 보낸 값
            .input('id', sql.Int, id)
            .input('date', sql.VarChar, date)
            .input('dayOfWeek', sql.VarChar, dayOfWeek)
            .input('category', sql.VarChar, category)
            .input('description', sql.VarChar, description)
            .input('time', sql.VarChar, time)
            .input('bank', sql.VarChar, bank)
            .input('income', sql.Int, income)
            .input('expense', sql.Int, expense)
            .input('fulldate', sql.VarChar, fulldate)
            // SQL 쿼리 실행
            .query('UPDATE dbo.TbTest SET date = @date, dayOfWeek = @dayOfWeek, category = @category, description = @description, time = @time, bank = @bank, income = @income, expense = @expense, fulldate = @fulldate WHERE id = @id');
        res.send('Data inserted successfully'); 
    }
    catch (err) {
        console.error('Server error:', err);
        res.status(500).send(err.message);
    }
});


/* DELETE */