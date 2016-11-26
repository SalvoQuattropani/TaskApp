/** 
 * @authors: Salvatore Quatropani & Paolo Walter Modica
 * @file: login.controller.js
 * @description: this file contains the main controller for the login interface
 */

(function () {
    'use strict';

    angular
        .module('todoApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$scope', 'storageService', '$mdDialog', 'loginService'];

    function LoginController($scope, storageService, $mdDialog, loginService) {
        var vm = this;

        vm.email;

        $scope.isLoggedIn = false;
        $scope.nameUser = '';
        $scope.emailUser = '';

        vm.CallCheckActiveUserSession = CallCheckActiveUserSession;
        vm.CallUserLogin = CallUserLogin;
        vm.CallUserLogout = CallUserLogout;
        vm.CallUserSignIn = CallUserSignIn;
        
        

        function CallCheckActiveUserSession() {
            var user_sess = loginService.checkActiveSession();

            if (user_sess != undefined) {
                window.alert("Active Session for the User " + user_sess.name + " " + user_sess.lastname);
                storageService.cancelSession();
                loginService.login(user_sess.email);
                $scope.isLoggedIn = user_sess.loggedIn;    //gets user state in the view
                $scope.nameUser = user_sess.name;   //gets the user name in the view
                $scope.emailUser = user_sess.email; //gets the user email in the view
                $scope.IDUser = user_sess.id;
                user_sess = null;
            } else {
                console.log("No Active Session");
            }
        }
        
        function CallUserLogin() {
            $mdDialog.show({
                templateUrl: 'login.html',
                parent: angular.element(document.body),
                bindToController: true,
                controller: loginCtrl,
                controllerAs: 'lc'
            }).then(function () {
                $scope.isLoggedIn = loginService.getState();    //gets user state in the view
                $scope.nameUser = loginService.getNameUser();   //gets the user name in the view
                $scope.emailUser = loginService.getEmailUser(); //gets the user email in the view
                $scope.IDUser = loginService.getIdUser();
            });
        }

        function CallUserLogout() {
            loginService.logout();
            $scope.isLoggedIn = loginService.getState(); //updates the user state in the view
            $scope.emailUser = "";
        }

        function CallUserSignIn() {
            $mdDialog.show({
                templateUrl: 'signIn.html',
                parent: angular.element(document.body),
                bindToController: true,
                controller: SignInController,
                controllerAs: 'sc'
            })
        }

        loginCtrl.$inject = ['$scope', 'storageService', '$mdDialog', 'loginService'];

        function loginCtrl($scope, storageService, $mdDialog, loginService) {
            vm = this;

            vm.cancel = cancel;
            vm.Checklogin = Checklogin;

            //close the login input form
            function cancel() {
                $mdDialog.hide();
            };

            //check if the user email exist in the local storage
            function Checklogin() {
                loginService.login(vm.email);
                if (loginService.getState()) {
                    vm.cancel();
                } else {
                    vm.cancel();
                }
            }
        }


        //User setting dialog controller
        SignInController.$inject = ['$mdDialog', 'userService', 'storageService', 'socketService', '$window'];

        function SignInController($mdDialog, userService, storageService, socketService, $window) {

            var vm = this;
            vm.user = {};
            vm.cancel = cancel;
            vm.save = save;

            function cancel() {
                $mdDialog.hide();
            };

            function save() {
                vm.cancel();
                vm.user.loggedIn = false;
                vm.user.id = (Math.floor((Math.random() * 1000) + 1) * (Math.floor((Math.random() * 1000) + 1)));
                userService.createUser(vm.user);
                $window.setTimeout(function () {
                    $window.location.reload();
                }, 700);
            }
        };
    }
})();

