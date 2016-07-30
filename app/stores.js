(function (angular) {
    'use strict';
    angular.module('stores', ['dialog'])
        .service('storesService', StoresService)

        .component('stores', {
            template: '<h2>Магазины</h2><ng-outlet></ng-outlet>',
            $routeConfig: [
                { path: '/', name: 'StoresList', component: 'storesList', useAsDefault: true },
                { path: '/:id', name: 'StoreDetail', component: 'storeDetail' },
                { path: '/items', name: 'ItemsList', component: 'itemsList' }
            ]
        })

        .component('storesList', {
            templateUrl: 'storesList.html',
            bindings: { $router: '<' },
            controller: StoreListComponent,
            $canActivate: function ($nextInstruction, $prevInstruction) {
                console.log('$canActivate', arguments);
            }
        })

        .component('storeDetail', {
            templateUrl: 'storeDetail.html',
            bindings: { $router: '<' },
            controller: StoreDetailComponent
        })
        .component('itemsList', {
            templateUrl: 'itemsList.html',
            bindings: { $router: '<' },
            controller: itemsListComponent
        });


    function StoresService($q) {
        var storesPromise = $q.when([
            { id: 1, name: '35Element', adress: 'Prityckogo, 1', operation: '9:00-22:00', items: [{ name: 'refrigerator', description: 'Good refrigerator' }, { name: 'phone', description: 'Good phone' }] },
            { id: 2, name: 'NewTime', adress: 'Pushkina, 22', operation: '10:00-23:00', items: [{ name: 'refrigerator2', description: 'Good refrigerator2' }, { name: 'phone2', description: 'Good phone2' }] },
            { id: 3, name: '5Week', adress: 'Golubeva, 16', operation: '8:00-21:00', items: [{ name: 'refrigerator3', description: 'Good refrigerator3' }, { name: 'phone3', description: 'Good phone3' }] },
            { id: 4, name: 'Sunday', adress: 'Miroshnichenko, 1a', operation: '10:00-17:00', items: [{ name: 'refrigerator4', description: 'Good refrigerator4' }, { name: 'phone4', description: 'Good phone4' }] }
        ]);

        this.getStores = function () {
            return storesPromise;
        };

        this.getStore = function (id) {
            return storesPromise.then(function (stores) {
                for (var i = 0; i < stores.length; i++) {
                    if (stores[i].id == id) return stores[i];
                }
            });
        };
    }

    function itemsListComponent(storesService) {
        var ctrl = this;

        this.$routerOnActivate = function (next) {
            // Get the hero identified by the route parameter
            var id = next.params.id;
            storesService.getStore(id).then(function (store) {
                if (store) {
                    ctrl.store = store;
                } else { // id not found
                }
            });
        };
        this.onAdd = function () {
                ctrl.store.items.push({ name: ctrl.commodName, description: ctrl.commodDescription });
                ctrl.commodName = ctrl.commodDescription = '';
        };
        this.onDelete = function (commod) {
            ctrl.store.items.splice(ctrl.store.items.indexOf(commod), 1);
        };
    }

    function StoreListComponent(storesService) {
        var selectedId = null;
        var ctrl = this;

        this.$routerOnActivate = function (next) {
            console.log('$routerOnActivate', this, arguments);
            // Load up the crises for this view
            storesService.getStores().then(function (stores) {
                ctrl.stores = stores;
                selectedId = next.params.id;
            });
        };

        this.gotoItems = function (store) {
            var storeId = store && store.id;
            // Pass along the hero id if available
            // so that the CrisisListComponent can select that hero.
            this.$router.navigate(['ItemsList', { id: storeId }]);
        };

        this.isSelected = function (store) {
            return (store.id == selectedId);
        };

        this.onSelect = function (store) {
            this.$router.navigate(['StoreDetail', { id: store.id }]);
        };
        this.onAdd = function () {
            storesService.getStores().then(function (stores) {
                stores.push({ id: stores.length + 1, name: ctrl.storeName, adress: ctrl.storeAdress, operation: ctrl.storeModeOreration, items: [] });
                ctrl.storeName = ctrl.storeAdress = ctrl.storeModeOreration = '';
            });
        };
        this.onDelete = function (store) {
            storesService.getStores().then(function (stores) {
                stores.splice(store.id - 1, 1);
                for (var i = 1; i <= stores.length; i++) {
                    stores[i - 1].id = i;
                }
            });
        };
    }

    function StoreDetailComponent(storesService, dialogService) {
        var ctrl = this;
        this.$routerOnActivate = function (next) {
            // Get the crisis identified by the route parameter
            var id = next.params.id;
            storesService.getStore(id).then(function (store) {
                if (store) {
                    ctrl.editName = store.name;
                    ctrl.editAdress = store.adress;
                    ctrl.editOperation = store.operation;
                    ctrl.store = store;
                } else { // id not found
                    ctrl.gotoCrises();
                }
            });
        };

        this.$routerCanDeactivate = function () {
            // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged.
            if (!this.store || this.store.name === this.editName) {
                return true;
            }
            // Otherwise ask the user with the dialog service and return its
            // promise which resolves to true or false when the user decides
            return dialogService.confirm('Discard changes?');
        };

        this.cancel = function () {
            ctrl.editName = ctrl.store.name;
            ctrl.gotoCrises();
        };

        this.save = function () {
            ctrl.store.name = ctrl.editName;
            ctrl.store.adress = ctrl.editAdress;
            ctrl.store.operation = ctrl.editOperation;
            ctrl.gotoCrises();
        };

        this.gotoCrises = function () {
            var storeId = ctrl.store && ctrl.store.id;
            // Pass along the hero id if available
            // so that the CrisisListComponent can select that hero.
            this.$router.navigate(['StoresList', { id: storeId }]);
        };
    }

})(window.angular);

/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/