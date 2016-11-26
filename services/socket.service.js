(function(){
    'use strict';

    angular
    .module('todoApp')
    .factory('socketService', socketService);

    function socketService(){
        var vm = this; 
        vm.socket = io('http://localhost:8080');

        vm.emit = emit;
        vm.on = on;

        var factory = {
            emit: emit,
            on: on
        }

        return factory;

        function emit(event, data){
            vm.socket.emit(event, data);
        }


        function on(event, callback){
                vm.socket.on(event, callback);
        }

    }
})();