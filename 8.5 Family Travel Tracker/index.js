import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "school",
  password: "1119",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let userid = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisited(userid) {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id="+userid);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log("countries: "+countries);

  return countries;
}

async function checkUsers(){
  const result=await db.query("SELECT * FROM users");
  return result.rows;
}

async function getCurrentUser(){
  const result=await db.query("SELECT * FROM users WHERE id="+userid);
  console.log(result.rows);
  return result.rows[0];
}

app.get("/", async (req, res) => {
  const countries = await checkVisited(userid);
  const users=await checkUsers();
  console.log(countries);
  const currentUser=await getCurrentUser();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});


app.post("/add", async (req, res) => {
  console.log(req);
  const input=req.body.country;
  try{
    const result=await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '"+input.toLowerCase()+"'");
    console.log(result.rows[0].country_code);
    const country_code=result.rows[0].country_code
    console.log(userid);
    try{
       const result=await db.query("INSERT INTO visited_countries(country_code,user_id) VALUES('"+country_code+"',"+userid+");")
       res.redirect("/");
    }catch{
      console.log("Already Present");
    }
  }
  catch(error){
    console.log(error);
    res.redirect("/");
  }
}
);




  // try {
  //   const result = await db.query(
  //     "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
  //     [input.toLowerCase()]
  //   );

  //   const data = result.rows[0];
  //   const countryCode = data.country_code;
  //   try {
  //     await db.query(
  //       "INSERT INTO visited_countries (country_code) VALUES ($1)",
  //       [countryCode]
  //     );
  //     res.redirect("/");
  //   } catch (err) {
  //     console.log(err);
  //   }
  // } catch (err) {
  //   console.log(err);
  // }

app.post("/user", async (req, res) => {
  if(req.body.add)
  res.render("new.ejs");
 else{
  userid=req.body.user;
  const result=await db.query("SELECT * FROM visited_countries JOIN users ON user_id=users.id WHERE user_id="+userid);
  if(result.rows.length!=0){
  const countries=await checkVisited(userid);
  const users=await checkUsers();
  res.render("index.ejs",{
    countries:countries,
    total:countries.length,
    users:users,
    color:result.rows[0].color
  });
}else{
  const result=await db.query("SELECT * FROM users WHERE id="+userid);
  const countries=await checkVisited(userid);
  const users=await checkUsers();
  res.render("index.ejs",{
    countries:countries,
    total:countries.length,
    users:users,
    color:result.rows[0].color
  });
}

 }});


app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  console.log(req.body);
  const name=req.body.name;
  const color=req.body.color;
  const result=await db.query("INSERT INTO users(name,color) VALUES('"+name+"','"+color+"')");
  console.log(result);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
