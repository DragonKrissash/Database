import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"permalist",
  password:"1119",
  port:5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getitems(){
  const result=await db.query("SELECT * FROM items ORDER BY id ASC;");
  return result.rows;
}

app.get("/", async (req, res) => {
  items=await getitems();
  console.log(items);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log(item);
  const result=await db.query("INSERT INTO items(title) VALUES ('"+item+"');");
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const id=req.body.updatedItemId;
  const title=req.body.updatedItemTitle;
  console.log(id,title);
  const result=await db.query("UPDATE items SET title='"+title+"' WHERE id="+id+";");
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
console.log(req.body);
const delid=req.body.deleteItemId;
console.log(delid);
const result=await db.query("DELETE FROM items WHERE id="+delid);
res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
