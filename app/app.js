(function(angular) {
  'use strict';
angular.module('app', ['ngComponentRouter', 'stores'])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})

.value('$routerRootComponent', 'app')

.component('app', {
  template:
    '<nav>\n' +
    '  <a ng-link="[\'Stores\']">Магазины</a>\n' +
    
    '</nav>\n' +
    '<ng-outlet></ng-outlet>\n',
  $routeConfig: [
    {path: '/stores/...', name: 'Stores', component: 'stores', useAsDefault: true},
    
  ]
});
})(window.angular);

/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/