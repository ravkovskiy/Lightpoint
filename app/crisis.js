(function(angular) {
  'use strict';
angular.module('crisis-center', ['dialog'])
  .service('crisisService', CrisisService)

  .component('crisisCenter', {
    template: '<h2>Crisis Center</h2><ng-outlet></ng-outlet>',
    $routeConfig: [
      {path:'/',    name: 'CrisisList',   component: 'crisisList', useAsDefault: true},
      {path:'/:id', name: 'CrisisDetail', component: 'crisisDetail'}
    ]
  })

  .component('crisisList', {
    templateUrl: 'crisisList.html',
    bindings: { $router: '<' },
    controller: CrisisListComponent,
    $canActivate: function($nextInstruction, $prevInstruction) {
      console.log('$canActivate', arguments);
    }
  })

  .component('crisisDetail', {
    templateUrl: 'crisisDetail.html',
    bindings: { $router: '<' },
    controller: CrisisDetailComponent
  });


function CrisisService($q) {
  var crisesPromise = $q.when([
    {id: 1, name: '35Element', adress: 'Prityckogo, 1', operation: '9:00-22:00'},
    {id: 2, name: 'NewTime', adress: 'Pushkina, 22', operation: '10:00-23:00'},
    {id: 3, name: '5Week', adress: 'Golubeva, 16', operation: '8:00-21:00'},
    {id: 4, name: 'Sunday', adress: 'Miroshnichenko, 1a', operation: '10:00-17:00'}
  ]);

  this.getCrises = function() {
    return crisesPromise;
  };

  this.getCrisis = function(id) {
    return crisesPromise.then(function(crises) {
      for(var i=0; i<crises.length; i++) {
        if ( crises[i].id == id) return crises[i];
      }
    });
  };
}

function CrisisListComponent(crisisService) {
  var selectedId = null;
  var ctrl = this;

  this.$routerOnActivate = function(next) {
    console.log('$routerOnActivate', this, arguments);
    // Load up the crises for this view
    crisisService.getCrises().then(function(crises) {
      ctrl.crises = crises;
      selectedId = next.params.id;
    });
  };

  this.isSelected = function(crisis) {
    return (crisis.id == selectedId);
  };

  this.onSelect = function(crisis) {
    this.$router.navigate(['CrisisDetail', { id: crisis.id }]);
  };
}

function CrisisDetailComponent(crisisService, dialogService) {
  var ctrl = this;
  this.$routerOnActivate = function(next) {
    // Get the crisis identified by the route parameter
    var id = next.params.id;
    crisisService.getCrisis(id).then(function(crisis) {
      if (crisis) {
        ctrl.editName = crisis.name;
        ctrl.crisis = crisis;
      } else { // id not found
        ctrl.gotoCrises();
      }
    });
  };

  this.$routerCanDeactivate = function() {
    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged.
    if (!this.crisis || this.crisis.name === this.editName) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // promise which resolves to true or false when the user decides
    return dialogService.confirm('Discard changes?');
  };

  this.cancel = function() {
    ctrl.editName = ctrl.crisis.name;
    ctrl.gotoCrises();
  };

  this.save = function() {
    ctrl.crisis.name = ctrl.editName;
    ctrl.gotoCrises();
  };

  this.gotoCrises = function() {
    var crisisId = ctrl.crisis && ctrl.crisis.id;
    // Pass along the hero id if available
    // so that the CrisisListComponent can select that hero.
    this.$router.navigate(['CrisisList', {id: crisisId}]);
  };
}
})(window.angular);

/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/