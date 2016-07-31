(function(angular) {
  'use strict';
angular.module('app', ['ngComponentRouter', 'stores'])

.config(function($locationProvider) {
  $locationProvider.html5Mode(false);
})

.value('$routerRootComponent', 'app')

.component('app', {
  template:
    '<ng-outlet></ng-outlet>',
  $routeConfig: [
    {path: '/...', name: 'Stores', component: 'stores', useAsDefault: true},
    
  ]
});
})(window.angular);

