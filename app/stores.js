(function (angular) {
    'use strict';
    angular.module('stores', ['dndLists'])
        .service('storesService', StoresService)

        .component('stores', {
            template: '<ng-outlet></ng-outlet>',
            $routeConfig: [
                { path: '/', name: 'StoresList', component: 'storesList', useAsDefault: true },
                { path: '/:id', name: 'StoreDetail', component: 'storeDetail' },
                { path: '/:id/items', name: 'ItemsList', component: 'itemsList' }
            ]
        })

    function StoresService() {
        var stores = [
            {id: 1, order: 1, name: 'Алми', adress: 'Минск, пр. Дзержинского, 91', operation: '08:00-22:00', items: [{ name: 'Молоко', description: 'Брест-Литовск - 1.25 руб.' }, { name: 'Сметана', description: 'Савушкин продукт - 8.50 руб.' }, { name: 'Масло', description: 'Бабушкина крынка - 18.54 руб.' }] },
            {id: 2, order: 2, name: 'Green', adress: 'Минск, ул. Петра Глебки, 5', operation: '08:00-23:00', items: [{ name: 'Молоко', description: 'Брест-Литовск - 1.22 руб.' }, { name: 'Сметана', description: 'Савушкин продукт - 9.00 руб.' }, { name: 'Масло', description: 'Бабушкина крынка - 16.20 руб.' }] },
            {id: 3, order: 3, name: 'Евроопт', adress: 'Минск, ул. Веры Хоружей, 15', operation: '3:00-21:00', items: [{ name: 'Молоко', description: 'Брест-Литовск - 1.25 руб.' }, { name: 'Сметана', description: 'Савушкин продукт - 8.50 руб.' }, { name: 'Масло', description: 'Бабушкина крынка - 18.54 руб.' }] },
            {id: 4, order: 4, name: 'Соседи', adress: 'Минск, ул. Антоновская, 30', operation: '4:00-17:00', items: [{ name: 'Молоко', description: 'Брест-Литовск - 1.25 руб.' }, { name: 'Сметана', description: 'Савушкин продукт - 8.50 руб.' }, { name: 'Масло', description: 'Бабушкина крынка - 18.54 руб.' }] },
            {id: 5, order: 5, name: 'Prostore', adress: 'Минск, пр. Победителей, 84', operation: '5:00-17:00', items: [{ name: 'Молоко', description: 'Брест-Литовск - 1.25 руб.' }, { name: 'Сметана', description: 'Савушкин продукт - 8.50 руб.' }, { name: 'Масло', description: 'Бабушкина крынка - 18.54 руб.' }] },
            {id: 6, order: 6, name: 'Корона', adress: 'Минск, ул. Кальварийская, 24', operation: '6:00-17:00', items: [{ name: 'Молоко', description: 'Брест-Литовск - 1.25 руб.' }, { name: 'Сметана', description: 'Савушкин продукт - 8.50 руб.' }, { name: 'Масло', description: 'Бабушкина крынка - 18.54 руб.' }] }
        ];

        this.getStores = function () {
            return stores;
        };

        this.getStore = function (id) {
                for (var i = 0; i < stores.length; i++) {
                    if (stores[i].id == id) return stores[i];
                }
        };
    }
    
})(window.angular);
