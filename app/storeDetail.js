(function (angular) {
    'use strict';
    angular.module('stores')

        .component('storeDetail', {
            templateUrl: 'storeDetail.html',
            bindings: { $router: '<' },
            controller: StoreDetailController
        })

    function StoreDetailController(storesService) {
        var ctrl = this;
        this.$routerOnActivate = function (next) {

            var id = next.params.id;
            var store = storesService.getStore(id);

            ctrl.editName = store.name;
            ctrl.editAdress = store.adress;
            ctrl.editOperation = store.operation;
            ctrl.store = store;
        };

        this.$routerCanDeactivate = function () {

            if (!this.store || this.store.name === this.editName) {
                return true;
            }

        };

        this.cancel = function () {
            ctrl.editName = ctrl.store.name;
            ctrl.gotoStores();
        };

        this.save = function () {
            ctrl.store.name = ctrl.editName;
            ctrl.store.adress = ctrl.editAdress;
            ctrl.store.operation = ctrl.editOperation;
            ctrl.gotoStores();
        };

        this.gotoStores = function () {

            this.$router.navigate(['StoresList']);
        };
    }

})(window.angular);
