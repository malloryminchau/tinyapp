# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["urls page with urls that belong to logged in user"](tinyapp/docs/populated-urls-page.png)
!["Register page"](tinyapp/docs/register-page.png)
!["Edit page for a shortURL that belongs to user"](tinyapp/docs/shorturl-edit-redirect-page.png)
!["urls page without being logged in"](tinyapp/docs/urls-logged-out.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Access the web app using localhost:8080/
  - This first page will redirect the user to the "/urls" page
  - If the user is not logged in they have the option to navigate to either the register or login pag using the nav bar at the top of the page.
  - Registering a new user will create a new cookie with the users information, and add the user to the "users" object. 
    - If the email that is entered already exists in the users object the user will see an error.
    - if either the email or the password are not valid, or are empty strings, the user will se an error.
  - The login page will search over the users object and if the input email exists and matches the corresponding password, a new cookie will be created for the user, logging the user in. 
    - when the user is logged in they will be redirected to the "/urls" page
  - the "/urls" page will only show the urls that belong to the user
    - there are buttons for editing and deleting each specific url
  - Users can only edit urls that belong to them, but they can view the short urls of other users and use the navigation link, but the input field to edit the url will not appear. 
  - When a user selects "Edit" they are redirected to the short url page and an input field appears. the user may put a new url in that input field and when they click submit the shortURL's long url will be updated and the user will be redirected to the /urls page.
  - The user may logout by clicking the logout button on the top right of the header. When the button is clicked the cookie corresponding with the user is deleted and the user is redirected to the /urls page, which shows a message prompting the user to login. 
  - When the user is not logged in the options to register and login can be viewed at the top of the page. When the user is logged in those options are not visible.
    - When the user is logged in a message appears at the top showing "Logged in as: email" and a logout button.
  - When the user is not logged in they cannot access the "Create a new URL" page. The user will be redirected to the "login" page. 