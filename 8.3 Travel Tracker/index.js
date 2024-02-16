import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const db=new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database:'world',
  password: '1119',
  port:5432
});
var country=[];
var countries=[];
const app = express();
const port = 3000;
db.connect();
// db.query("SELECT country_code FROM visited_countries",(err,res)=>{
//   if(err)
//   console.error("Error executing query",err.stack);
//   else
//   {countries =res.rows;
//     country=countries.map(country=>country.country_code);
//     console.log(country);
//   }

// });



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.get("/", async (req, res) => {
//   //Write your code here.
//   res.render("index.ejs",{countries:country,total:country.length});
// });
var countries=[];
app.get("/",async(req,res)=>{
  const result=await db.query("SELECT country_code FROM visited_countries");
  console.log(result.rows);
  countries=[];
  result.rows.forEach((country)=>countries.push(country.country_code));
  console.log(countries);
  res.render("index.ejs",{countries:countries,total:countries.length});
});

app.post("/add",async(req,res)=>{
  try{
  console.log(req.body);
  const country=req.body.country;
  console.log(country);
  const result=await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%"+country.toLowerCase()+"%'");
  console.log(result.rows);
  if(result.rows.length!=0){
  const code=result.rows[0].country_code;
  console.log(code);
  const result2=await db.query("INSERT INTO visited_countries(country_code) VALUES($1)",[code]);
  console.log(result2.rows);
  res.redirect('/');}
  else
  res.redirect('/');
  }catch(error){
    console.log(error);
    res.redirect("/");
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
