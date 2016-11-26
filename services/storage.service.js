(function() {
    'use strict';

    angular
    .module('todoApp')
    .service('storageService', storageService);
        
    storageService.$inject = ['$window'];

    function storageService($window) {
        var vm = this;

        vm.socket = io('http://localhost:8080');
        vm.received_data;

        vm.activeSession = activeSession;
        vm.cancelSession = cancelSession;
        vm.createSession = createSession;
        vm.editUser = editUser;
        vm.get = get;
        vm.getUser = getUser;
        vm.set = set;
        vm.setUser = setUser;

        function activeSession(){
            var json = $window.localStorage.getItem("UserStorage");
            if (json != null) {
                return (angular.fromJson(json));
            }
            return null;
        }

        function cancelSession(){
            $window.localStorage.removeItem("UserStorage");
        } 

        function createSession(value){
            $window.localStorage.setItem("UserStorage", angular.toJson(value));
        }

        function editUser(value) {
            //transmit the User data to the NodeJS Server via SocketIO socket to update the database
            vm.socket.emit('editUser', value);
        }    

        //Get the ToDos of the user identified by ID
        function get(id) {
            if(id!= undefined){
                //request the ToDos data to the NodeJS server via SocketIO socket
                vm.socket.emit('DatabaseGet', id);

                var promise = new Promise(function(resolve, reject) {
                    $window.setTimeout(function() {
                        //wait for the ToDos data to be transmitted by NodeJS server via the SocketIO socket
                        vm.socket.on('DataExtracted', function(dati){
                            resolve(dati);
                        });
                    }, 0);
                });
                
                //returns the promise object containing the retrieved data
                return promise;
            }
        }

       function getUser(email) {
           //request the User data with the specific email to the NodeJS server via SocketIO socket
           vm.socket.emit('DatabaseUserGet', email);

           var promise2 = new Promise(function(resolve, reject){
               $window.setTimeout(function() {
                   //wait for the User data to be transmitted by NodeJS server via the SocketIO socket
                   vm.socket.on('UserExtracted', function(user){
                       resolve(user);
                    });
                });
            });

            //returns the promise object containing the retrieved data
            return promise2;
        }

        //Saves the ToDos data of the User associated to the specific ID into the DB
        function set(id, values) {
            var data = {
                id: id,
                value:  values
            }
            //transmit the ToDos data to the NodeJS Server via SocketIO socket to update the database
            vm.socket.emit('DatabaseSet', data);
            console.log(id);
        }

        //Saves the ToDos data of the User associated to the specific ID into the DB
        function setUser(value) {
            //transmit the User data to the NodeJS Server via SocketIO socket to update the database
            vm.socket.emit('checkIfExist', value);  //up
            $window.setTimeout(function() {
                vm.socket.on('resultOfCheck', function(ext){
                    if(ext){
                        window.alert("User already existst!");
                    }else{
                        vm.socket.emit('registration', value);  //up
                    }
                });
            });
        }
    }
})();