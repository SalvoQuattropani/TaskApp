/** 
 * @authors: Salvatore Quatropani & Paolo Walter Modica
 * @file: login.service.js
 * @description: this file contains the service that manages the login and logout procedure of the User
*/

(function() {
  'use strict';
  
  angular
  .module('todoApp')
  .factory('loginService', loginService);

  loginService.$inject = ['storageService', '$window'];

  function loginService(storageService, $window){
    var vm = this;

    vm.isLoggedIn = false;

    vm.checkActiveSession = checkActiveSession;
    vm.checkIfLoggedIn = checkIfLoggedIn;
    vm.getEmailUser = getEmailUser;
    vm.getIdUser = getIdUser;
    vm.getLastName = getLastName;
    vm.getNameUser = getNameUser;
    vm.getState = getState;
    vm.setEmailUser = setEmailUser;
    vm.setIdUser = setIdUser;
    vm.setLastName = setLastName;
    vm.setNameUser = setNameUser;
    vm.setState = setState;
    
    vm.nameUser='';
    vm.email='';
    vm.IdUser='';
    vm.lastname='';

    //the factory contains the available functions
    var factory = {
          checkActiveSession: checkActiveSession,
          checkIfLoggedIn: checkIfLoggedIn,
          getEmailUser : getEmailUser,
          getIdUser:getIdUser,
          getLastName : getLastName,
          getNameUser: getNameUser,
          getState: getState,
          login: login,
          logout: logout,
          setEmailUser: setEmailUser,
          setIdUser:setIdUser,
          setLastName : setLastName,
          setNameUser: setNameUser,
          setState: setState

      };

      function checkActiveSession(){
            vm.activeUser = storageService.activeSession();          
            return(vm.activeUser);
      }

      //returns the current logged in User, and set his/her state not logged in for edit purpose
      function checkIfLoggedIn(){
            var value = {
                  id: vm.getIdUser(),
                  name: vm.getNameUser(),
                  lastname: vm.getLastName(),
                  email: vm.getEmailUser(),
                  loggedIn: false
            }
            return value;
      }

      //returns the email address of the current User
      function getEmailUser(){
            return vm.email;
      }

      //returns the ID of the current User
      function getIdUser(){
            return vm.IdUser;
      }

      //returns the lastname of the current User
      function getLastName(){
            return vm.lastname;
      }

      //returns the name of the current User
      function getNameUser(){
            return vm.nameUser;
      }

      //returns if the current User is logged in
      function getState(){
            return vm.isLoggedIn;
      }

      //this function check if the user exists inside the DB
      function login(email){
            vm.res = storageService.getUser(email) || [];
            vm.res.then(function(res){
                  vm.setNameUser(res[0].name);
                  vm.setEmailUser(res[0].email);
                  vm.setIdUser(res[0].id);
                  vm.setLastName(res[0].lastname);
                  vm.setState(true);
                  var value = {
                        id: res[0].id,
                        name: res[0].name,
                        lastname: res[0].lastname,
                        email: res[0].email,
                        loggedIn: true
                  }
                  //set the user state to loggedIn
                  storageService.editUser(value);
                  storageService.createSession(value);
            }).catch(function(e) {
                  vm.setState(false);
                  window.alert("Account non esistete!");
            });
      }

      //logout the current User
      function logout(){
            vm.setState(false);
            var value = {
                  id: vm.getIdUser(),
                  name: vm.getNameUser(),
                  lastname: vm.getLastName(),
                  email: vm.getEmailUser(),
                  loggedIn: vm.getState()
            };            
            storageService.editUser(value);
            storageService.cancelSession();
      }

      //returns the email address of the current User
      function setEmailUser(email){
            vm.email = email;
      }

      //set the ID of the current User
      function setIdUser(IdUser){
            vm.IdUser=IdUser;
      }

      //set the lastname of the current User
      function setLastName(lastname){
            vm.lastname = lastname;
      }

      //set the name of the current User
      function setNameUser(name){
            vm.nameUser=name;
      }
      
      //set the state of the current User (logged in or not)
      function setState(state){
            vm.isLoggedIn = state;
      }

      return factory;

  }
})();