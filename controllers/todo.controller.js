/** 
 * @authors: Salvatore Quatropani & Paolo Walter Modica
 * @file: todo.controller.js
 * @description: this file contains the controller that manages the ToDos
 */

(function () {
    'use strict';

    angular
    .module('todoApp')
    .controller('TodoController', TodoController);

    TodoController.$inject = ['$scope', 'itemService', 'loginService', 'storageService', '$mdDialog', 'socketService'];

    function TodoController($scope, itemService, loginService, storageService, $mdDialog, socketService) {
        var vm = this;

        vm.filterByName = '';
        vm.filterByDate = '';
        vm.selectedItem = null;

        //represents the list of selected todos
        vm.listOfselection = [];
        vm.res;

        vm.addTask = addTask;
        vm.all = all;
        vm.CallCreateItem = CallCreateItem;
        vm.CallDeleteItem = CallDeleteItem;
        vm.callUserSettings = callUserSettings;
        vm.done = done;
        vm.notDone = notDone;
        vm.resetListOfSelection = resetListOfSelection;         //function to reset list of selected items
        vm.setItems = setItems;
        
        //Add a new task to the items list
        function addTask(ev) {
            $mdDialog.show({
                templateUrl: 'addTask.html',
                parent: angular.element(document.body),
                bindToController: true,
                controller: AddTaskController,
                controllerAs: 'atc',
                targetEvent: ev
            });
        }

        function all(item) {
            return true;
        }

        //Creates a new item with the given parameters
        function CallCreateItem(items) {
            itemService.createItem(items.name, items.description, items.exp_date, items.priority, items.done, $scope.IDUser, vm.items);
            vm.res = storageService.get($scope.IDUser) || [];
            vm.res.then(function (res) {
                vm.items = res;
            });
        }

        //Delete the current selected item, if any
        function CallDeleteItem(ev) {
            if(vm.listOfselection.length == 1) {
                var confirm = $mdDialog.confirm()
                    .textContent('The task "' + vm.listOfselection[0].name + '" will be deleted. Are you sure?')
                    .ariaLabel('Delete task')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');
            }else{
                var confirm = $mdDialog.confirm()
                    .textContent('The  "' + vm.listOfselection.length + '" tasks will be deleted. Are you sure?')
                    .ariaLabel('Delete tasks')
                    .targetEvent(ev)
                    .ok('Yes')
                    .cancel('No');
            }
            $mdDialog.show(confirm).then(function(result){
                if(result){
                    itemService.deleteItem(ev, vm.listOfselection, vm.items);
                    vm.listOfselection = [];
                    vm.selectedItem = null;
                    vm.res = storageService.get($scope.IDUser) || [];
                    vm.res.then(function (res) {
                        vm.items = res;
                    });

                }
            });
        }

        //User settings form
        function callUserSettings(ev) {
            $mdDialog.show({
                templateUrl: 'userSettings.html',
                parent: angular.element(document.body),
                bindToController: true,
                controller: UserSettingsController,
                controllerAs: 'usc',
                targetEvent: ev
            }).then(function () {                                
                $scope.isLoggedIn = loginService.getState();   
                $scope.IDUser = "";                             
                $scope.nameUser = "";                           
                $scope.emailUser = "";                          
            })                                                  
        }

        //Filter function for ToDos
        function done(item) {
            return item.done == true;
        }

        //Filter function for ToDos
        function notDone(item) {
            return item.done == false;
        }

        function resetListOfSelection() {
            vm.listOfselection.splice(0, vm.listOfselection.length);        //erase every element of the array
            for (var i = 0; i <= vm.items.length - 1; i++) {
                vm.items[i].checked = false;                //set state "unchecked" in every element of the tskStorage
            }
            while (vm.items.length > 0) {
                vm.items.splice(0, 1);              //set state "unchecked" in every element of the tskStorage
            }
        }

        /*Reset the list of selected items after logout */
        function setItems() {
            vm.res = storageService.get($scope.IDUser) || [];
            vm.res.then(function (res) {
                vm.items = res;

                //this to mantain the list of selected items even after logging out or closing browser window
                for (var i = 0; i < vm.items.length; i++) {
                    if (vm.items[i].checked) {
                        if (vm.listOfselection.length == 0) {
                            vm.selectedItem = vm.items[i];
                        }
                        vm.listOfselection.push(vm.items[i]);
                    }
                }
            }); 
        }

        AddTaskController.$inject = ['$scope', '$mdDialog', 'itemService', 'storageService'];

        function AddTaskController($scope, $mdDialog, itemService, storageService) {
            var vm = this;
            vm.dateOptions = new Date();
            vm.items = {};
            vm.cancel = cancel;
            vm.save_task = save_task;

            function cancel() {
                $mdDialog.hide();
            };

            function save_task() {
                CallCreateItem(vm.items);
                cancel();
            };
        };

        UserSettingsController.$inject = ['$scope', '$mdDialog', 'loginService', 'userService', 'storageService', '$window', 'socketService'];

        function UserSettingsController($scope, $mdDialog, loginService, userService, storageService, $window, socketService) {
            var vm = this;

            var res = loginService.checkIfLoggedIn();
            vm.user = {};
            vm.index = res.id;
            vm.user.id = res.id;
            vm.user.name = res.name;
            vm.user.lastname = res.lastname;
            vm.user.email = res.email;
            vm.user.loggedIn = res.loggedIn

            vm.cancel = cancel;
            vm.editUser = editUser;

            function cancel() {
                $mdDialog.hide();
            };

            function editUser() {
                if (vm.user.email != res.email) {
                    var data = {
                        prevEmail: res.email,
                        user: vm.user
                    }
                    socketService.emit('emailchange', data);
                }
                userService.editUser(vm.user);
                storageService.cancelSession();
                vm.cancel();
                $window.location.reload();
            };
        };
    }

})();

