/// 1. 서버를 포트 3000에서 실행(http://localhost:3000)
/// 2. SQL 접속 설정
/// 3. 데이터베이스 연결

// 웹 프레임워크
const express = require('express');
const app = express();

// SQL Server에 연결하기 위한 라이브러리
const sql = require('mssql');

// JSON 데이터 처리 미들웨어
app.use(express.json());

/// 서버를 포트 3000에서 실행(http://localhost:3000)
app.listen(3000, () => {
    console.log('Express server listening on port 3000');
});

/// SQL 접속 설정
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

/// 데이터베이스 연결 (node .\mssql_dbConnector.js)
pool.connect((err) => {
    // 연결이 안될 경우 에러 내용 콘솔에 출력
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }

    // 연결에 성공할 경우 연결 성공 메시지 콘솔에 출력
    console.log('Connected to database');
});

/**  READ  **/
// 1. 클라이언트가 서버(경로)로 데이터 조회(GET) 요청
// 2. 서버에서 SQL 쿼리 결과(result.recordset)를 조회 후 JSON 형식으로 클라이언트에 반환

/*
app.get('/user/select', ...) : /user/select 경로로 들어오는 GET 요청을 처리
 => app.get : 클라이언트가 서버에 데이터를 조회
 => req : 클라이언트의 요청 데이터 포함 객체 / res : 서버에서 클라이언트로 응답 보낼 때 사용 객체
*/

app.get('/user/select', (req, res) => {
    // 데이터베이스(SQL Server)에 요청을 준비하는 메서드
    pool.request().query('SELECT * FROM dbo.TbTest', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing query');
            return;
        }

        // 서버에서 SQL 쿼리 결과(result.recordset)를 조회 후 JSON 형식으로 클라이언트에 반환
        res.json(result.recordset);
    });
}); 

/** CREATE **/
// 1. 클라이언트에서 서버(경로)로 POST 요청(새로운 리소스 생성 / 클라이언트에서 데이터를 서버로 보냄)
// 2. 클라이언트 요청의 본문(req.body)에서 필요한 데이터를 구조 분해 할당으로 추출
// 3. 요청 본문에서 가져온 값으로 SQL 쿼리 실행

/* 
app.post('/user/create', ...) : /user 경로로 들어오는 POST 요청을 처리
 => app.post : HTTP POST 요청을 처리(서버에 데이터를 전송하고, 새로운 리소스를 생성할때 사용)
 =>'/user/create' : 해당 경로에서 요청을 받음 API의 엔드포인트 URL (이 경로로 POST 요청 보낼 수 있음)
 => async (req, res) : 비동기 함수 정의 
 => req : 클라이언트의 요청 데이터 포함 객체 / res : 서버에서 클라이언트로 응답 보낼 때 사용 객체 
*/

app.post('/user/create', async (req, res) => {
    // 클라이언트에서 받은 요청 본문 데이터 로그 출력
    console.log('Request received:', req.body);
    try {
        // 클라이언트 요청의 본문(req.body)에서 필요한 데이터를 구조 분해 할당으로 추출
        const { date, dayOfWeek, category, description, time, bank, income, expense, fulldate } = req.body;

        // 데이터베이스(SQL Server)에 요청을 준비하는 메서드
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
            // 성공 시 클라이언트에 메시지 보냄
            res.send('Data inserted successfully');    
    }
    catch (err) {
        // 오류 메세지 출력
        console.error('Server error:', err);
        // 클라이언트에 HTTP 500 상태 코드와 오류 메시지 보냄
        res.status(500).send(err.message);
    }
});

/** UPDATE **/
/// 1. 클라이언트에서 서버(경로)로 PUT 요청(기존 리소스 수정 / 클라이언트에서 데이터를 서버로 보냄) 
/// 2. 클라이언트 요청의 본문(req.body)과 URL에 포함된 ID 값 추출
/// 3. 요청 본문과 URL에 포함된 값으로 SQL 쿼리 실행

/* 
app.put('/user/update/:id', ...) : /user 경로로 들어오는 POST 요청을 처리
 => app.put : 클라이언트가 서버에 데이터를 전송하여 기존 리소스를 수정
 =>'/user/update/:id' : 해당 경로에서 요청을 받아 id는 URL 파라미터로 클라이언트가 특정 id 값을 경로에 포함하여 요청
 => async (req, res) : 비동기 함수 정의 
 => req : 클라이언트의 요청 데이터 포함 객체 / res : 서버에서 클라이언트로 응답 보낼 때 사용 객체 
*/
app.put('/user/update/:id', async (req, res) =>{
    try{
        // 클라이언트에서 받은 요청 본문 데이터 로그 출력
        console.log('Request received:', req.body);

        // URL 경로에 포함된 id 파라미터 값 추출
        const { id } = req.params;

        // 클라이언트 요청의 본문(req.body)에서 필요한 데이터를 구조 분해 할당으로 추출
        const { date, dayOfWeek, category, description, time, bank, income, expense, fulldate } = req.body;

        // 데이터베이스(SQL Server)에 요청을 준비하는 메서드
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
        // 오류 메세지 출력
        console.error('Server error:', err);
        // 클라이언트에 HTTP 500 상태 코드와 오류 메시지 보냄
        res.status(500).send(err.message);
    }
});


/** DELETE **/
/// 1. 클라이언트에서 서버(경로)로 DELETE 요청(데이터 삭제 / 클라이언트에서 데이터를 서버로 보냄) 
/// 2. URL에 포함된 ID 값 추출
/// 3. 요청 본문과 URL에 포함된 값으로 SQL 쿼리 실행

/* 
app.delete('/user/delete/:id', ...) : /user 경로로 들어오는 delete 요청을 처리
 => app.delete : 클라이언트가 서버에 데이터를 전송하여 해당 ID를 가진 데이터 삭제
 =>'/user/delete/:id' : 해당 경로에서 요청을 받아 id는 URL 파라미터로 클라이언트가 특정 id 값을 경로에 포함하여 요청
 => async (req, res) : 비동기 함수 정의 
 => req : 클라이언트의 요청 데이터 포함 객체 / res : 서버에서 클라이언트로 응답 보낼 때 사용 객체 
*/

app.delete('/user/delete/:id', async (req, res) => {
    try{
        console.log('Request received:', req.params);

        // URL 경로에 포함된 id 파라미터 값 추출
        const { id } = req.params;

        // 데이터베이스(SQL Server)에 요청을 준비하는 메서드
        await pool.request()
            // SQL 쿼리에 사용할 입력 파라미터 설정
            //  => 'date' : 파라미터 이름 / sql.VarChar : 데이터 타입 / date : 클라이언트가 보낸 값
            .input('id', sql.Int, id)

            // SQL 쿼리 실행
            .query('DELETE FROM dbo.TbTest WHERE id = @id');
        res.send('Data Delete successfully');
    }
    catch (err) {
        // 오류 메세지 출력
        console.error('Server error:', err);
        // 클라이언트에 HTTP 500 상태 코드와 오류 메시지 보냄
        res.status(500).send(err.message);
    }
});

// 로그인 API
app.post('/user/login', async (req, res) => {
    try {

        // 클라이언트 요청의 본문(req.body)에서 필요한 데이터를 구조 분해 할당으로 추출
        const { username, password } = req.body;
        console.log(req.body);

        // 아이디와 비밀번호가 없으면 오류 응답
        if (!username || !password) {
            return res.status(400).json({ message: "아이디와 비밀번호를 입력하세요." });
        }

        // SQL 쿼리 실행 (파라미터 바인딩 사용)
        const result = await pool.request()
            .input('username', sql.NVarChar, username) // 파라미터 바인딩
            .input('password', sql.NVarChar, password) // 파라미터 바인딩
            .query('SELECT * FROM dbo.TbTest2 WHERE username = @username AND password = @password');

        // 사용자가 존재하면 로그인 성공
        if (result.recordset.length > 0) {
            return res.json({ success: true });
        } else {
            // 사용자 정보가 없으면 로그인 실패
            return res.json({ success: false });
        }

    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
