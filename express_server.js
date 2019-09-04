const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const cookie = require("cookie-parser");
app.use(cookie());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  let stringId = '';
  let alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321';
  for (let i = 0; i < 6; i++) {
    stringId += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length));
  }
  return stringId;
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] };
  // console.log(templateVars.user)
  res.render("urls_index", templateVars);
})

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
  user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const newURL = generateRandomString();
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`./urls/${newURL}`);         // Respond with 'Ok' (we will replace this)
});


app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] }
  // console.log(users[req.cookies["user_id"]])
  res.render("urls_register", templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
})
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  }
  res.send(404)
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
})

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  console.log("hello");
  res.clearCookie('user_id', req.body.email);
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  for (let element in users) {
    // console.log(element);
    if (users[element].email === req.body.email) {
      console.log(element);
      if (users[element].password === req.body.password) {
        let newId = element;
        res.cookie('user_id', newId);
        res.redirect("/urls")
      } else {
        res.send(403);
      }
    } else {
      res.send(403);
    }
  }
  
})

app.post("/register", (req, res) => {
  if (req.body.email === '' && req.body.password === '') {
    res.send(404);
  } else if (req.body.email === '') {
    res.send(404);
  } else if(req.body.password === '') {
    res.send(404);
  } else {
    let newId = generateRandomString();
    users[newId] = { id: newId, 
      email: req.body.email, 
      password: req.body.password };
    res.cookie('user_id', newId);
    res.redirect("/urls")
    // console.log(users)
  }
})