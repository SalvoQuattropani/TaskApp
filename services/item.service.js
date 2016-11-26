/** 
 * @authors: Salvatore Quatropani & Paolo Walter Modica
 * @file: item.service.js
 * @description: this file contains the service that manipulates the items in the ToDoList
 */

(function() {
  'use strict';
  angular.module('todoApp')
  .factory('itemService', itemService);

  itemService.$inject =['storageService', '$filter'];
  
  function itemService(storageService, $filter){
    var vm=this;
    
    vm.selectedItem = null;
    vm.items =  [];  
    vm.listOfselection = [];
    var factory = {
      createItem: createItem,
      deleteItem: deleteItem
    };
    
    return factory;
    
    function createItem(name, description, exp_date, priority, done, id, items) {
      vm.items = items;
      console.log("Dalla createItem", vm.items);
      vm.dateFormatted = $filter('date')(exp_date,'dd/MM/yyyy');
      vm.items.push({
        name: name,
        description:description,
        exp_date: vm.dateFormatted ,
        done: done || false,
        priority: priority || 0,
        creation_date: Date.now(),
        checked: false,
        id: id
      });
      storageService.set(id, vm.items);
    }
    
    function deleteItem(ev, listOfselection, items) {
      vm.items=items;
      vm.listOfselection = listOfselection;
      var res;
      
      if (vm.listOfselection.length > 0) {
        for(var i=0; i<=vm.listOfselection.length-1;i++){
          var index = vm.items.indexOf(vm.listOfselection[i]);
          console.log(index);
          if (index != -1){
            vm.items.splice(index, 1);
            storageService.set(vm.listOfselection[i].id,vm.items);
          }
        }
        return true;
      }
    }
  }
})();