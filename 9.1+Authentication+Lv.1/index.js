import express from "express"
import pg from "pg"
import bodyParser from "body-parser"
const app=express();
import bcrypt, { hash } from "bcrypt"
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const saltRounds=10;

const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"secrets",
    password:"1119",
    port:"5432"
});

db.connect();

app.get("/",(req,res)=>{
    res.render("home.ejs");
});

app.get("/register",(req,res)=>{
    res.render("register.ejs");
});

app.get("/login",(req,res)=>{
    res.render("login.ejs");
});

app.post("/register",async (req,res)=>{
    const email=req.body.username;
    const password=req.body.password;
    try{
    const result=await db.query("SELECT * FROM users WHERE email='"+email+"';") 
        if(result.rows.length>0)
        res.send("Username already exits!");
        else
        {bcrypt.hash(password,saltRounds,async(err,hash)=>{
            if(err)
                console.log("Error hashing the password: ",err);
            else{
        const result=await db.query("INSERT INTO users(email,password) VALUES('"+email+"','"+hash+"')");
        res.render("secrets.ejs");
        }
    })};
    }
    catch(error){
    console.log(error);
    }
});

app.post("/login",async (req,res)=>{
    const email=req.body.username;
    const loginpassword=req.body.password;
    try{
        const result=await db.query("SELECT * FROM users WHERE email='"+email+"';") 
        console.log(result.rows);
        if(result.rows.length==1){
            const hashpassword=result.rows[0].password;
            console.log(hashpassword);
        bcrypt.compare(loginpassword,hashpassword,(err,result)=>{
            if(err)
            console.log("Error comparing passwords: ",err);
            else{
                if(result)
                res.render('secrets.ejs');
            else
            res.send("wrong password");
            }    
        });
    }else
        res.send("Wrong username");
    }catch(error){
        console.error(error.message);
    }
})

app.listen(3000,()=>{
    console.log('Server is up and running!');
});