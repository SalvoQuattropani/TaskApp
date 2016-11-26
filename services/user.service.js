/** 
 * @authors: Salvatore Quatropani & Paolo Walter Modica
 * @file: user.service.js
 * @description: this file contains the service that manipulates the user
 */

(function() {
  'use strict';
  
  angular
  .module('todoApp')
  .factory('userService', userService);

  userService.$inject = ['storageService','$mdDialog','loginService'];

  function userService(storageService,$mdDialog,loginService){
    var vm = this;

    vm.user={};
    vm.createUser = createUser;
    vm.editUser = editUser;
    
    var factory = {
      createUser: createUser,
      editUser: editUser
    };

    return factory;
    
    function createUser(usr){
      vm.user={
        id: usr.id,
        name: usr.name,
        lastname: usr.lastname ,
        email: usr.email,
        loggedIn : usr.loggedIn
      };
      storageService.setUser(vm.user);
    }

    function editUser(user){
      storageService.editUser(user);
    }
  }
})();