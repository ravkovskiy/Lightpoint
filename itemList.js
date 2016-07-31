(function (angular) {
    'use strict';
    angular.module('stores')
        .component('itemsList', {
            templateUrl: 'itemsList.html',
            bindings: { $router: '<' },
            controller: itemsListController
        });

    function itemsListController(storesService) {
        var ctrl = this;

        this.$routerOnActivate = function (next) {

            var order = next.params.order;
            ctrl.store = storesService.getStore(order);
        };

        this.sortType = 'name'; // set the default sort type
        this.sortReverse = false;  // set the default sort order
        this.search = '';     // set the default search/filter term

        this.onAdd = function () {
            ctrl.store.items.push({ name: ctrl.itemName, description: ctrl.itemDescription });
            ctrl.itemName = ctrl.itemDescription = '';
        };
        this.onDelete = function (item) {
            ctrl.store.items.splice(ctrl.store.items.indexOf(item), 1);
        };
        this.return = function () {
            this.$router.navigate(['StoresList']);
        };
    }
})(window.angular);
