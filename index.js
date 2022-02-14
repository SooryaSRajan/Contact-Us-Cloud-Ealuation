const http = require('http');
const fs = require("fs");
const url = require("url");
const validator = require("email-validator");

const requestListener = function (req, res) {
    console.log("REQUESTED ROUTE: ", req.url)
    if (req.url === "/")
        fs.readFile(__dirname + '/html/ContactUs.html', function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });

    else if (req.url === "/index.css")
        fs.readFile(__dirname + '/css/index.css', function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });

    else if (req.url.includes("/submit")) {
        const query = url.parse(req.url, true).query;
        try{
            let errorList = validateData(query)
            if (errorList.length === 0) {
                fs.readFile(__dirname + '/html/success.html', function (err, data) {
                    if (err) {
                        res.writeHead(404);
                        res.end(JSON.stringify(err));
                        return;
                    }
                    res.writeHead(200);
                    res.end(data);
                });
            } else {
                fs.readFile(__dirname + '/html/failure.html', "utf8", function (err, data) {
                    if (err) {
                        res.writeHead(404);
                        res.end(JSON.stringify(err));
                        return;
                    }

                    res.writeHead(200);
                    let errorString = errorList.toString()
                    for (let i = 0; i < errorList.length; i++) {
                        errorString = errorString.replace(",", "<br>")
                    }
                    res.end(data.replace("%ERROR%", errorString))
                });
            }
        }
        catch (e){
            console.log(e)
        }
    }

}

function isValidWebUrl(url) {
    let regEx = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/gm;
    return regEx.test(url);
}

function validateData(data) {
    let errorList = []

    let name = data.name
    let email = data.email
    let websiteLink = data.web_address
    let comments = data.comments

    if (name === '' || name === undefined) {
        errorList.push("Please fill user name")
    } else if (name.length < 2) {
        errorList.push("Name has to be at least two characters long")
    } else if (/\d/.test(name)) {
        errorList.push("Name cannot have numbers")
    }

    if (email === '' || email === undefined) {
        errorList.push("Please fill email ID")
    } else if (!validator.validate(email)) {
        errorList.push("Please enter valid email ID")
    }

    if (comments === '' || comments === undefined) {
        errorList.push("Please fill comment field")
    } else if (comments.length < 3) {
        errorList.push("Comment has to be at least three characters long")
    }

    if (websiteLink === '' || websiteLink === undefined) {
        errorList.push("Please fill website link")
    } else if (!isValidWebUrl(websiteLink)) {
        errorList.push("Invalid website link")
    }


    return errorList


}

const server = http.createServer(requestListener);
server.listen(8080);
console.log("Server running in port 8080")
