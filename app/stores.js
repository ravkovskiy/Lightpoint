(function (angular) {
    'use strict';
    angular.module('stores', ['dndLists'])
        .service('storesService', StoresService)

        .component('stores', {
            template: '<ng-outlet></ng-outlet>',
            $routeConfig: [
                { path: '/', name: 'StoresList', component: 'storesList', useAsDefault: true },
                { path: '/:order', name: 'StoreDetail', component: 'storeDetail' },
                { path: '/:order/items', name: 'ItemsList', component: 'itemsList' }
            ]
        })

    function StoresService($q) {
        var storesPromise = $q.when([
            { order: 1, name: 'Алми', adress: 'Минск, Притыцкого 1', operation: '1:00-22:00', items: [{ name: 'refrigerator1', description: 'Good refrigerator1' }, { name: 'phone1', description: 'Good phone1' }] },
            { order: 2, name: 'Green', adress: 'Минск, Пушкина 2', operation: '2:00-23:00', items: [{ name: 'refrigerator2', description: 'Good refrigerator2' }, { name: 'phone2', description: 'Good phone2' }] },
            { order: 3, name: 'Евроопт', adress: 'Минск, Голубева 3', operation: '3:00-21:00', items: [{ name: 'refrigerator3', description: 'Good refrigerator3' }, { name: 'phone3', description: 'Good phone3' }] },
            { order: 4, name: 'Соседи', adress: 'Минск, Мирошниченко 4', operation: '4:00-17:00', items: [{ name: 'refrigerator4', description: 'Good refrigerator4' }, { name: 'phone4', description: 'Good phone4' }] },
            { order: 5, name: 'Prostore', adress: 'Минск, Якубовского 5', operation: '5:00-17:00', items: [{ name: 'refrigerator5', description: 'Good refrigerator5' }, { name: 'phone5', description: 'Good phone5' }] },
            { order: 6, name: 'Корона', adress: 'Минск, Тимошенко 6', operation: '6:00-17:00', items: [{ name: 'refrigerator6', description: 'Good refrigerator6' }, { name: 'phone6', description: 'Good phone6' }] }
        ]);

        this.getStores = function () {
            return storesPromise;
        };

        this.getStore = function (order) {
            return storesPromise.then(function (stores) {
                for (var i = 0; i < stores.length; i++) {
                    if (stores[i].order == order) return stores[i];
                }
            });
        };
    }
    
})(window.angular);
