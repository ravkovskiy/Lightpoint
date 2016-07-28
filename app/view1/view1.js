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
        adress: 'Olshevskogo, 1',
        operation: '8:00-20:00'
      },
      {
        name: 'New Time',
        adress: 'Prityckogo, 2',
        startOperation: '9:00',
        operation: '9:00-21:00'
      }
    ];
    $scope.AddNewStore = function () {
      if ($scope.addFormClass == '') {
        $scope.addFormClass = '-active';
        return;
      }
      $scope.stores.push(
        {
          name: $scope.addName,
          adress: $scope.addAdress,
          operation: $scope.addOperation
        }
      );
      $scope.addFormClass = $scope.addName = $scope.addAdress = $scope.addOperation = '';
    };
    $scope.addFormClass = '';
  }]);