(function (angular) {
    'use strict';
    angular.module('stores', ['dndLists'])
        .service('storesService', StoresService)

        .component('stores', {
            template: '<h2>Магазины</h2><ng-outlet></ng-outlet>',
            $routeConfig: [
                { path: '/', name: 'StoresList', component: 'storesList', useAsDefault: true },
                { path: '/:id', name: 'StoreDetail', component: 'storeDetail' },
                { path: '/:id/items', name: 'ItemsList', component: 'itemsList' }
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
            { id: 1, name: '1', adress: 'Prityckogo, 1', operation: '1:00-22:00', items: [{ name: 'refrigerator1', description: 'Good refrigerator1' }, { name: 'phone1', description: 'Good phone1' }] },
            { id: 2, name: '2', adress: 'Pushkina, 2', operation: '2:00-23:00', items: [{ name: 'refrigerator2', description: 'Good refrigerator2' }, { name: 'phone2', description: 'Good phone2' }] },
            { id: 3, name: '3', adress: 'Golubeva, 3', operation: '3:00-21:00', items: [{ name: 'refrigerator3', description: 'Good refrigerator3' }, { name: 'phone3', description: 'Good phone3' }] },
            { id: 4, name: '4', adress: 'Miroshnichenko, 4', operation: '4:00-17:00', items: [{ name: 'refrigerator4', description: 'Good refrigerator4' }, { name: 'phone4', description: 'Good phone4' }] },
            { id: 4, name: '5', adress: 'Yakubovskogo, 5', operation: '5:00-17:00', items: [{ name: 'refrigerator5', description: 'Good refrigerator5' }, { name: 'phone5', description: 'Good phone5' }] },
            { id: 4, name: '6', adress: 'Timoshenko, 6', operation: '6:00-17:00', items: [{ name: 'refrigerator6', description: 'Good refrigerator6' }, { name: 'phone6', description: 'Good phone6' }] }
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

            var id = next.params.id;
            storesService.getStore(id).then(function (store) {
                if (store) {
                    ctrl.store = store;
                } else { // id not found
                }
            });
        };
        this.onAdd = function () {
            ctrl.store.items.push({ name: ctrl.itemName, description: ctrl.itemDescription });
            ctrl.itemName = ctrl.itemDescription = '';
        };
        this.onDelete = function (item) {
            ctrl.store.items.splice(ctrl.store.items.indexOf(item), 1);
        };
    }

    function StoreListComponent(storesService) {
        var selectedId = null;
        var ctrl = this;
        this.selected = null;

        this.$routerOnActivate = function (next) {
            console.log('$routerOnActivate', this, arguments);

            storesService.getStores().then(function (stores) {
                ctrl.stores = stores;
                selectedId = next.params.id;
            });
        };

        this.gotoItems = function (store) {
            var storeId = store && store.id;

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
        this.sortID = function () {
            storesService.getStores().then(function (stores) {
                for (var i = 1; i <= stores.length; i++) {
                    stores[i - 1].id = i;
                }
            });
        }


        ymaps.ready(initMap);
        function initMap() {
            var myMap = new ymaps.Map('myMap', {
                // центр и коэффициент масштабирования однозначно
                // определяют область картографирования
                center: [53.90, 27.56],
                zoom: 11
            });
            myMap.controls.add('zoomControl', { right: '15px' });

            // Соответствует геообъекту с типом геометрии "точка" (type: "Point")
            var myPlacemark = new ymaps.Placemark([53.90, 27.56], [53.91, 27.57]);

            var placemark = new ymaps.Placemark([53.90, 27.56], {
                balloonContent: '<img src="http://img-fotki.yandex.ru/get/6114/82599242.2d6/0_88b97_ec425cf5_M" />',
                iconContent: "1"
            }, {
                    preset: "twirl#redIcon",
                    // Отключаем кнопку закрытия балуна.
                    balloonCloseButton: false,
                    // Балун будем открывать и закрывать кликом по иконке метки.
                    hideIconOnBalloonOpen: false
                });

            myMap.geoObjects.add(placemark);

            var myGeocoder = ymaps.geocode("Петрозаводск");
            myGeocoder.then(
                function (res) {
                    alert('Координаты объекта :' + res.geoObjects.get(0).geometry.getCoordinates());
                },
                function (err) {
                    alert('Ошибка');
                }
            );
        }



    }

    function StoreDetailComponent(storesService) {
        var ctrl = this;
        this.$routerOnActivate = function (next) {

            var id = next.params.id;
            storesService.getStore(id).then(function (store) {
                if (store) {
                    ctrl.editName = store.name;
                    ctrl.editAdress = store.adress;
                    ctrl.editOperation = store.operation;
                    ctrl.store = store;
                } else { // id not found
                    ctrl.gotoStores();
                }
            });
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
            var storeId = ctrl.store && ctrl.store.id;

            this.$router.navigate(['StoresList', { id: storeId }]);
        };
    }

})(window.angular);
