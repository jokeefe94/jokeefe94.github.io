document.getElementById("foot01").innerHTML =
"<p>&copy;  " + new Date().getFullYear() + " jokeefe94. All rights reserved.</p>";

document.getElementById("nav01").innerHTML =
"<ul id='menu'>" +
"<li><a href='index.html'>Home</a></li>" +
"<li><a href='customers.html'>Data</a></li>" +
"<li><a href='about.html'>About</a></li>" +
"</ul>";

function validateForm() {
    var x = document.forms["logInForm"]["email"].value;
    var y = document.forms["logInForm"]["password"].value;
    if (x == null || x == "") {
        alert("Email must be filled out");
        return false;
    }
    else if (y == null || y == "") {
        alert("Password must be filled out");
        return false;
    }

    var atpos = x.indexOf("@");
    var dotpos = x.lastIndexOf(".");
    if (atpos< 1 || dotpos<atpos+2 || dotpos+2>=x.length) {
        alert("Not a valid e-mail address");
        return false;
    }
}