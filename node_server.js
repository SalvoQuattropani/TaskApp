/** 
 * @authors: Salvatore Quattropani & Paolo Walter Modica
 * @file: node_server.js
 * @description: this file contains the backend server application for TaskApp
 */

//Include the Express.JS framework
var express = require('express');

//Instatiates the application server
var app = express();

//Include the HTTP module
var http = require('http');

//Instatiates the HTTP server
var httpserver = http.createServer(app);

//Include the Socket.IO framework and instatiates the event listener on the Web Server
var io = require('socket.io').listen(httpserver);

//Instatiates a NodeMailer server used to send e-mail to notify the user about his/her todos
var nodemailer = require("nodemailer");

//Define the user object which will be received after the user registration in TaskApp
var user = {};

//Include the my sql module
var mysql = require('mysql');

//my sql connection

var connection = mysql.createConnection({
        host     : '',
        user     : '',
        password : '',
        database : '',
        port     : 3307
});



connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

//Define the SMTP Transport for te NodeMailer using Gmail
var smtpTransport = nodemailer.createTransport({
	service: "Gmail",
	auth: {
        user: "sep.solutions9193@gmail.com",
	    pass: "angulartask"
	}
});

var appConfig = {
    staticPath: __dirname   //__dirname+'/static''
}

//route to the main page of TaskApp
app.use(express.static(appConfig.staticPath));
app.get('/', function(request, response){
    response.sendFile('./index.html');
});

//HTTP server listener on port 8080
httpserver.listen(8080, function(){
    	console.log('HTTP Server listening on port 8080.');
});

//Socket.IO event managing
io.on('connection', function(socket){
    console.log('IO Socket connected');
    //Check if user already exist
    socket.on('checkIfExist', function(user){
        var query= connection.query('SELECT * from Utenti WHERE email = "'+user.email+'"', function(err, result){
            if(err){
                 throw err;
               
            }
            if(result.length>0){
                console.log("ESISTE");
                socket.emit('resultOfCheck', true);
            }else{
                console.log("NON ESISTE");
                socket.emit('resultOfCheck', false);
            }
        });
       
    });

    //Catch the registration of a user
    socket.on('registration', function(user){
        console.log('Got the new User information!', user.email);
        var post  = {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            loggedIn: user.loggedIn
        };
        var query1 = connection.query('INSERT INTO Utenti SET ?', post, function(err,result) {
            if(err){
                throw err;
            }
            console.log('data inserted');
        });

        //Define the e-mail object which will be sent using the NodeMailer
        var email = {
            from: 'sep.solutions9193@gmail.com',
            to: user.email,
			subject: 'TaskApp Registration',
			text: 'Dear ' + user.name + ' ' + user.lastname + ',\r \n'+
                  'your registration is completed. \r \n'+
                  'We are glad to welcome you to TaskApp. Enjoy!'
        };

        //Send the email
        smtpTransport.sendMail(email, function(error){
            if(error){
                console.log('Error type:', error);
            }
        });
    });
    
    socket.on('emailchange', function(data){
        //Define the e-mail object which will be sent using the NodeMailer
        console.log(data.prevEmail);
        var email = {
            from: 'sep.solutions9193@gmail.com',
            to: data.user.email,
            cc: data.prevEmail,
			subject: 'TaskApp User Email Changed',
			text: 'Dear ' + data.user.name + ' ' + data.user.lastname + ',\r \n'+
                  'this is to notify you that your email address has been changed. \r \n'+
                  'The same message will be sent in your previous e-mail address as well. \r\n'+
                  'TaskApp Team'
        };

        //Send the email
        smtpTransport.sendMail(email, function(error){
            if(error){
                console.log('Error type:', error);
            }
        });
    });
    
    //Set the Database and Insert ToDos
    socket.on('DatabaseSet', function(data){
        //elimino solo quelli con quell'id e ricarico i campi aggiornati
        var query = connection.query('DELETE FROM Dati WHERE id = "'+data.id+'"', function(err,result) {
            if(err) throw err;
            console.log('date removed');
        });
        if(data.value.length>0){
            //carico
            for(var i=0;i<=data.value.length-1;i++){
                var post  = {
                    name: data.value[i].name,
                    description: data.value[i].description,
                    exp_date: data.value[i].exp_date,
                    done: data.value[i].done,
                    priority: data.value[i].priority,
                    creation_date: data.value[i].creation_date,
                    checked: data.value[i].checked,
                    id: data.value[i].id
                };
                var query1 = connection.query('INSERT INTO Dati SET ?', post, function(err,result) {
                    if(err){
                        throw err;
                    }
                    console.log('data inserted');
                });
            }
        }
    });

    //Get ToDo data from Database
    socket.on('DatabaseGet', function(id){
        console.log('Beccato evento interno');
        var query= connection.query('SELECT * from Dati WHERE id = "'+id+'"', function(err, result) {
            if(err) {
                throw err;
            }else{
                console.log('data extracted->'+result);
                //ritorno i dati
                socket.emit('DataExtracted', result);
            }
        });
    });

    socket.on('editUser', function(user){
        console.log("node legge nella edit->"+JSON.stringify(user));
        //elimino solo quelli con quell'id e ricarico i campi aggiornati
        var post  = {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            loggedIn: user.loggedIn
        };
        var query = connection.query('UPDATE Utenti SET ? WHERE id = "'+user.id+'"',post, function(err,result) {
            if(err) throw err;
            console.log('date updated');
        });
     });

    socket.on('DatabaseUserGet', function(email){
        var query= connection.query('SELECT * from Utenti WHERE email = "'+email+'"', function(err, result){
            if(err){
                throw err;
            }else{
                console.log('User extracted->'+JSON.stringify(result));
                //ritorno i dati
                socket.emit('UserExtracted', result);
            }
        });
    });
});

//activate the Notifier Server, which executes every T time (time in millis)
var T = 300000; //5 minutes, for example
setInterval(notifierServer, T);

//Notifier Server - check in the DB if there are ToDos about to expire and notify the correspondant user
function notifierServer(){
    var exp_date;
    //Today Date
    var d = new Date(Date.now());
    //Today Date - Only day, month, year, no time
    var today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    //Parse the Today Date in the Javascript Date type (in millis)
    var today_date = Date.parse(today);

    var diff;

    var query = "SELECT U.id, U.name AS username, U.lastname, U.email, U.loggedIn, "+
                "D.name AS taskname, D.description, D.exp_date, D.done, D.priority, D.creation_date, D.checked, D.id "+
                "FROM Utenti AS U INNER JOIN Dati AS D WHERE U.id = D.id";
    var queryExp = connection.query(query, function(err, result){
        if(err){
            throw err;
        }else{
            //check if there are results (the DB may be empty)
            if(result.length>0){
                console.log('Results found! Recordset length:', result.length);
                for(var i=0; i<result.length; i++){
                    console.log('Result no.'+i+': '+result[i].exp_date);

                    //Convert the Expiration date of the ToDo, formatted as dd/MM/yyyy, into JavaScript Date type
                    exp_date = Date.parse(toDate(result[i].exp_date));
                    console.log("Expiry "+toDate(result[i].exp_date));                
                    console.log("Result Date converted:", exp_date);
                    console.log('Date Today:', today);

                    //if the ToDo is not done yet
                    if(!result[i].done){
                        //Difference between the current date and the expiration date
                        diff = exp_date - today_date;

                        //if the difference between the current date and the expiration date of the ToDo is less than one day (in milliseconds)
                        if(diff>=0 && diff<=86400000){
                            console.log("ToDo about to expire!");
                            
                            //Define the e-mail object which will be sent using the NodeMailer
                            var email = {
                                from: 'sep.solutions9193@gmail.com',
                                to: result[i].email,
			                    subject: 'TaskApp - ToDo Notify Service',
			                    text: 'Dear ' + result[i].username + ' ' + result[i].lastname + ',\r \n'+
                                      'this is to notify you that the following ToDo is about to expire. \r \n'+
                                      'Details \r \n'+
                                      'Task Name: '+result[i].taskname+'\r \n'+
                                      'Task Description: '+result[i].description+'\r \n'+
                                      'Expiry Date: '+result[i].exp_date+'\r \n'+
                                      'TaskApp Team'
                            };
                            //Send the email
                            smtpTransport.sendMail(email, function(error){
                                if(error){
                                    console.log('Error type:', error);
                                }
                            });
                        }
                    }            
                }   
            }else{
                console.log('No result found! Recordset length:', result.length);
            }
        }
    });
}
//Convert a dd/MM/yyyy string into ISO Date format
function toDate(dateStr) {
    var parts = dateStr.split("/");
    return new Date(parts[2], parts[1]-1, parts[0]);
}
