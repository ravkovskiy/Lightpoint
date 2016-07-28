'use strict';

angular.module('myApp.view1', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view1', {
      templateUrl: 'view1/view1.html',
      controller: 'View1Ctrl'
    });
  }])

  .controller('View1Ctrl', ['$scope', function ($scope) {
    $scope.stores = [
      {
        name: '35Element',
        adress: 'Olshevskogo, 1'
      },
      {
        name: 'New Time',
        adress: 'Prityckogo, 2'
      }
    ];
  }]);