const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers')
app.use(cookieSession({
  name: 'session',
  keys:["id"/*secret keys*/]
}))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
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

function generateRandomString() { // this function generates a random 6 character string of alphanumeric characters
  let stringId = '';
  let alphaNumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0987654321';
  for (let i = 0; i < 6; i++) {
    stringId += alphaNumeric.charAt(Math.floor(Math.random() * alphaNumeric.length));
  }
  return stringId;
}

function urlsForUser(id) { // id is req.session.user_id if the user is logged in. searches over the users object to identify the urls that belong to that user
  let userUrls = {};
  for(let element in urlDatabase) {
    if (id === urlDatabase[element].userID) {
      userUrls[element] = { longURL: urlDatabase[element].longURL, userID: id } // should make an object with the long url as the value and shor url as the key
    }
  }
  return userUrls;
}

app.get("/", (req, res) => { // when accessing the ul "/" the page redirects you to the "/urls" page 
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`); // the port that is being used is the 8080 port set at the top of the page
});

app.get("/urls", (req, res) => { // if the user is logged in this page shows a table populated with the urls that belong to that user. 

  if(req.session.user_id) {
    let id = req.session.user_id
    let allowedUrls = urlsForUser(id);
    let templateVars = { urls: allowedUrls, user_id: req.session.user_id, user: users[req.session.user_id] }
    res.render("urls_index", templateVars);
  } else { // if the user is not logged in it will show a message prompting the user to log in 
    let templateVars = { urls: urlDatabase,
      user_id: req.session.user_id, user: users[req.session.user_id] };
      res.render("urls_index", templateVars)
  }
})

app.get("/login", (req, res) => { // when the login button on the nav bar is clicked it renders a login page with input fields for an email and password and a submit button
  let templateVars = { urls: urlDatabase,
  user_id: req.session.user_id, user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => { // post a new url and 
  if (req.session.user_id) { // the new url is added to the database with a correspondin user id to determine who the url belongs to
    const newURL = generateRandomString();
    const newURLObject = { longURL: req.body.longURL , userID: req.session.user_id }
    urlDatabase[newURL] = newURLObject;
    res.redirect(`./urls/${newURL}`);         // Respond with 'Ok' (we will replace this)
  }

});


app.get("/urls/new", (req, res) => { // if the user is logged in and the user clicks the new url button render a page with an input field for a long url and a submit button 
  if (req.session.user_id) {
    let templateVars = { user_id: req.session.user_id, user: users[req.session.user_id] }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get("/register", (req, res) => {  // when the register button on the navbar is clicked a /register page is rendered. this get request renders the urls_register template which has an email and password input field and a submit button
  let templateVars = { user_id: req.session.user_id, user: users[req.session.user_id] }
  res.render("urls_register", templateVars)
})

app.get("/urls/:shortURL", (req, res) => { // after a short url is made, if the user is logged in and owns the url the user is redirected to a page where the short url can be viewed and edited (if the user owns it)
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.session.user_id, user: users[req.session.user_id] };
  res.render("urls_show", templateVars); // if the user is not logged in they can still see the page, but cannot edit (the edit input field will not appear)
})

app.post("/urls/:shortURL/delete", (req, res) => { //if a user is logged in a delete button will appear on the /urls page next to a url that the user owns. this post request will remove the url from the database if clicked and redirect back to the updated /urls page
  if(req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls")
  }
  
})
app.get("/u/:shortURL", (req, res) => { // from the /urls/:shortURL there is a link that will redirect the user to the long url when clicked
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  }
  res.send(404)
});

app.get("/urls/:shortURL", (req, res) => { // feeds the urls to the urls_index page to render in the table on the page. if the user is logged in and owns the urls they can see them on the /urls page
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.session.user_id, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
})

app.post("/urls/:shortURL/edit", (req, res) => { // allows a user to edit a shortURL that they own. when the submit button is clicked they are redirected to the /urls page
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls"); 
})

app.post("/logout", (req, res) => { // when the logout button is clicked the user's cookie is deleted
  req.session = null;
  res.redirect("/urls");
})

app.post("/login", (req, res) => { // checks over the users object and if the input email matches an email in the database and the corresponding password a cookie is created witht he users information user_id 
  for (let element in users) {
    // console.log(element);
    if (users[element].email === req.body.email && bcrypt.compareSync(req.body.password, users[element].password)=== true) {
      let newId = element;
      req.session.user_id = newId;
      res.redirect("/urls")
    } 
  }
  if (!req.session.user_id) {
    res.send(403);
  }
})

app.post("/register", (req, res) => { // when on the register page an email and password are input and submit is clicked this checks if the email exists, if it does not and the password and the email are valid a new cookie is created and the information is added to the users object
  if (req.body.email === '' && req.body.password === '') {
    res.send(404);
  } else if (req.body.email === '') {
    res.send(404);
  } else if(req.body.password === '') {
    res.send(404);
  } else if(getUserByEmail(req.body.email, users)) {
    res.send(404);
  } else {
    let newId = generateRandomString();
    users[newId] = { id: newId, 
      email: req.body.email, 
      password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_id = newId;
    res.redirect("/urls")
    // console.log(users)
  }
})