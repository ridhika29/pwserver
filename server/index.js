const express = require('express');
const app=express();
const cors = require('cors');
var bodyParser = require('body-parser');
var multer = require('multer')
const { Pool, Client } = require("pg");
const pool = new Pool({
   host: 'localhost',
  user: 'postgres',
  password : 'test',
  database: 'contacts'
 
});

function sendViewMiddleware(req, res, next) {
    res.sendView = function(view) {
        return res.sendFile(__dirname + "/public/" + view);
    }
    next();
}

app.use(sendViewMiddleware);

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

var storage = multer.diskStorage({
      destination: function (req, file, cb) {
      cb(null, 'server/public')
    },
    filename: function (req, file, cb) {
      cb(null,file.originalname )
    }
})

var upload = multer({ storage: storage }).single('file');

app.post('/upload',function(req, res) {
     
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
      return res.status(200).send(req.file)

    })
  })

app.post('/public',(req,res)=>{
  var pic=req.body.id;
res.sendView(`${pic}`)
})

app.post('/register',(req,res)=>{
	var name=req.body.name;
	var email=req.body.email;
	var phone=req.body.phone;
	var job=req.body.job;
	var password=req.body.password;
//console.log(req.body);
//	
 
  var q=`INSERT INTO login(email,password)VALUES('${email}','${password}')`;
  pool.query(q,(err1,res1) =>{
    if(err1)  throw err1;
})

   var query=`INSERT INTO users(name, email, job, phone)VALUES('${name}','${email}','${job}',${phone})`;
   pool.query(query,(err2,res2) =>{
    if(err2)  throw err2;
    
})
   var qq=`SELECT * from users where email='${email}'`;
   pool.query(qq)
  .then(data => res.status(200).json(data.rows[0]))
  .catch(err => res.status(400).json('Not Valid Registration'))
    //pool.end();

   
})

app.get('/viewlist',function(req,res){
  
  getUsers(function (err, Result){ 
       //you might want to do something is err is not null...      
      // res.json(Result);
      res.json(Result.rows);
   });
})

function getUsers(callback) {    
        pool.query("SELECT * FROM users",
            function (err, rows) {
                //here we return the results of the query
                callback(err, rows); 
            }
        );    
}

app.post('/signin',(req,res)=>{
  
  var email=req.body.email;
  var password=req.body.password;
//console.log(req.body);
//  
  var query=`SELECT * FROM login WHERE email='${email}' AND password='${password}'`;
   pool.query(query,(err3,res3) =>{
    if(err3)  throw err3;
    
})
   var query1=`SELECT * from users WHERE email='${email}'`;
  pool.query(query1)
  .then(data => res.status(200).json(data.rows[0]))
  .catch(err => res.status(400).json('notValid User'));

  //console.log(res);
})

app.listen(3002,()=>{
	console.log(`app is running on server port : 3002`);
});