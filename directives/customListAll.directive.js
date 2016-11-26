(function() {
    'use strict';

    angular
    .module('todoApp')
    .directive('customListAll', customListAll);
    
    function customListAll(){
        return {
            scope: {  
            },
            bindToController: {
                items: '=',
                idUser: '=',
                listOfselection: '=',
                selectedItem: '=',
                filterFunction: '=',
                filterName: '=',
                filterDate: '='
            },
            controller: customListAllController,
            controllerAs: 'customListAllCtrl',
            transclude: true,
            restrict: 'E',
            template: '' +
                '<md-list class"scroll">' +
                '<md-list-item class="md-2-line" ng-repeat="item in customListAllCtrl.items | filter: customListAllCtrl.filterFunction | filter: customListAllCtrl.filterName | filter: customListAllCtrl.filterDate">' +
                '<div class="el md-padding">' +
                '<div ng-click="customListAllCtrl.toggleSelection(item)">'+
                '<md-checkbox ng-checked="item.checked" class="md-primary  box_ck" >' +
                '</md-checkbox>' +
                '</div>' +
                '<div class="box_priority" ><md-button ng-click="customListAllCtrl.changePriority(item)" class="md-icon-button box_priority" aria-label="Priority">' +
                '<md-icon style="color: green;" ng-if="item.priority ==-1">low_priority</md-icon>' +
                '<md-icon ng-if="item.priority == 0">label</md-icon>' +
                '<md-icon style="color: red" ng-if="item.priority == 1">priority_high</md-icon>' +
                '</md-button></div> ' +
				'<div class="box1"><md-button aria-label="Info" ng-click="customListAllCtrl.ShowDescription(item.description,item.name)" />info</md-button></div>' +
                '<div class="box1"><div class="md-list-item-text" ' +
                '<h3><b>{{item.name}}</b></h3></div>' +
                '<p>Expiration date:{{item.exp_date | date: "dd/MM/yyyy "}}</p>' +
                '</div>' +
                '<div class="box_state_all">' +
                '<p class="md-primary md-align-top-right" ng-if="item.done">Current State: DONE <md-icon> check </md-icon>' +
                '</p>' +
                '<p class="md-primary md-align-top-right" ng-if="!item.done">Current State: TODO <md-icon> chevron_right </md-icon>' +
                '</p></div>' +
                '</md-list-item>' +
                '</md-list>' 
            };
        }

    //Directive controller
    function customListAllController($scope,storageService, $mdDialog){
        var vm = this;
        vm.IsVisible = false;
        var item;
       
        vm.change_to_done = change_to_done;
        vm.change_to_todo = change_to_todo;
        vm.changePriority = changePriority;
        vm.checkStateChanged = checkStateChanged;
        vm.reset_select = reset_select;
        vm.ShowDescription = ShowDescription;
        vm.ShowHide = ShowHide;
        vm.toggleSelection = toggleSelection;
        
        var alreadySelected;
        //add for description 
        var index;
       
        //change to done
        function change_to_done(item){
            item.done=true;
            vm.checkStateChanged();
            reset_select(vm);
        }

        //change to todo
        function change_to_todo(item){
            item.done=false;
            vm.checkStateChanged();
            reset_select(vm);
        }
      
        //Changes the priority of the given item
        function changePriority(item) {
            if (item.priority <= 0)
                item.priority++;
            else
                item.priority = -1;
         
            storageService.set(vm.idUser, vm.items);
        }
      
        //Occurs when the status of an items changes
        function checkStateChanged(){
            storageService.set(vm.idUser, vm.items);
        }

        //reset select after selection
        function reset_select(vm) {
            vm.select_model = 0;
        }

        function ShowDescription(info,name){
            $mdDialog.show({
                template: 
                    '<md-dialog  class="dialog" class="no-scroll" aria-label="Description" >'
                  + '<md-toolbar>'
                  + '<div class="md-toolbar-tools">'
                  + '<span flex>Description of {{sdc.locals.name}}</span>'
                  + '<md-button class="md-icon-button" ng-click="sdc.locals.cancel()">'
                  + '<md-icon>close</md-icon>'
                  + '</md-button>'
                  + '</div>  '
                  + '</md-toolbar>'
                  + '<md-dialog-content>'
                  + '<md-content layout-padding ng-cloak>'
                  + '{{sdc.locals.info}}'
                  + '</md-content>'
                  + '</md-dialog-content> '
                  + '</md-dialog> ',
                parent: angular.element(document.body),
                bindToController: true,
                controller:showDescriptionCtrl,
                controllerAs: 'sdc',
                clickOutsideToClose: false,
                locals : {
                    info : info,
                    name: name,
                    cancel : function cancel(){$mdDialog.hide();}
                }
            });
        }
       
        showDescriptionCtrl.$inject = ['$scope','$mdDialog'];
       
        function showDescriptionCtrl($scope,$mdDialog, info,name) {
            $scope.info = info;
            $scope.name = name;
        }
        
        function ShowHide(index) {
            //If DIV is visible it will be hidden and vice versa.
            vm.IsCorrect=index;//check if the record selected is correct or not
            vm.IsVisible = vm.IsVisible ? false : true;
        }

        //Selects or deselects the given item
        function toggleSelection(item) {
            if(vm.listOfselection.length>0){
                for(var i=0; i<=vm.listOfselection.length-1; i++){
                    if(vm.listOfselection[i].creation_date == item.creation_date){
                        for(var j=0; j<= vm.items.length-1; j++){
                            console.log(vm.items.length);
                            if( vm.items[j].creation_date == item.creation_date){
                                vm.items[j].checked=false;
                                storageService.set(vm.idUser, vm.items);
                            }
                        }
                        alreadySelected = true;
                        break;
                    }else{
                        for(var k=0; k<= vm.items.length-1; k++){
                            console.log(vm.items.length);
                            if(vm.items[k].creation_date == item.creation_date){
                                vm.items[k].checked=true;
                                storageService.set(vm.idUser, vm.items);
                            }
                        }
                        alreadySelected = false;
                    }
                }
            }
            if(vm.selectedItem == null || !alreadySelected){
                vm.listOfselection.push(item);
                for(var k=0; k<= vm.items.length-1; k++){
                    console.log(vm.items.length);
                    if(vm.items[k].creation_date == item.creation_date){
                        vm.items[k].checked=true;
                        storageService.set(vm.idUser, vm.items);
                    }
                }
                if(vm.listOfselection.length>=0){
                    vm.selectedItem = item;
                }
            }else{
                for(var i=0; i<=vm.listOfselection.length-1; i++){
                    if(vm.listOfselection[i].$$hashKey == item.$$hashKey){
                        vm.listOfselection.splice(i, 1);
                        i=0;
                    }
                }
                if(vm.listOfselection.length==0){
                    vm.selectedItem = null;
                }
            }  
        }
    }
})();