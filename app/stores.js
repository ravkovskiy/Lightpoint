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

    function itemsListComponent(storesService) {
        var ctrl = this;

        this.$routerOnActivate = function (next) {

            var order = next.params.order;
            storesService.getStore(order).then(function (store) {
                if (store) {
                    ctrl.store = store;
                } else { // order not found
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
        var selectedOrder = null;
        var ctrl = this;
        this.selected = null;

        this.$routerOnActivate = function (next) {
            console.log('$routerOnActivate', this, arguments);

            storesService.getStores().then(function (stores) {
                ctrl.stores = stores;
                selectedOrder = next.params.order;
            });


            ymaps.ready(initMap);
            function initMap() {
                ctrl.myMap = new ymaps.Map('myMap', {
                    // центр и коэффициент масштабирования однозначно
                    // определяют область картографирования
                    center: [53.90, 27.56],
                    zoom: 10
                });
                ctrl.myMap.controls.add('zoomControl', { right: '15px' });
                ctrl.addIcon();
            }

        };

        this.gotoItems = function (store) {
            var storeOrder = store && store.order;

            this.$router.navigate(['ItemsList', { order: storeOrder }]);
        };

        this.onSelect = function (store) {
            this.$router.navigate(['StoreDetail', { order: store.order }]);
        };
        this.onAdd = function () {
            storesService.getStores().then(function (stores) {
                stores.push({ order: stores.length + 1, name: ctrl.storeName, adress: ctrl.storeAdress, operation: ctrl.storeModeOreration, items: [] });
                ctrl.storeName = ctrl.storeAdress = ctrl.storeModeOreration = '';
                ctrl.addIcon(stores.length, stores);
            });
        };
        this.onDelete = function (store) {
            storesService.getStores().then(function (stores) {
                ctrl.removeIcon(store, stores)
                stores.splice(store.order - 1, 1);
                for (var i = 1; i <= stores.length; i++) {
                    stores[i - 1].order = i;
                }
            });
        };
        this.sortOrder = function () {
            storesService.getStores().then(function (stores) {
                for (var i = 1; i <= stores.length; i++) {
                    stores[i - 1].order = i;
                }
            });
        }

        this.addIcon = function (icon, stores) {
            if (!icon) {
                ctrl.createIcons();
            } else {
                ctrl.saveIcon(stores, icon - 1);
            }
        }
        this.removeIcon = function (store, stores) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].name == store.name && ctrl.icons[i].adress == store.adress) {
                    ctrl.myMap.geoObjects.remove(ctrl.icons[i].placemark);
                    ctrl.icons.splice(i, 1);
                    break;
                }
            }
        }
        this.icons = [];
        this.saveIcon = function (stores, i) {
            var geocoder = ymaps.geocode(stores[i].adress);
            geocoder.then(
                function (res) {
                    try {
                        var geoCoord = res.geoObjects.get(0).geometry.getCoordinates();

                        var placemark = new ymaps.Placemark(geoCoord, {
                            balloonContent: '<div>Адрес: ' + stores[i].adress + '</div><div>Время работы: ' + stores[i].operation + '</div><hr>',
                            iconContent: stores[i].name
                        }, {
                                preset: "twirl#redStretchyIcon",
                                // Отключаем кнопку закрытия балуна.
                                balloonCloseButton: false,
                                // Балун будем открывать и закрывать кликом по иконке метки.
                                hideIconOnBalloonOpen: false
                            });
                        ctrl.myMap.geoObjects.add(placemark);
                        placemark.events
                            .add('mouseenter', function (e) {
                                // Ссылку на объект, вызвавший событие,
                                // можно получить из поля 'target'.
                                e.get('target').options.set('preset', 'twirl#greenStretchyIcon');
                            })
                            .add('mouseleave', function (e) {
                                e.get('target').options.set('preset', 'twirl#redStretchyIcon');
                            });


                        ctrl.icons.push({ adress: stores[i].adress, name: stores[i].name, placemark: placemark });
                    } catch (err) {
                    }

                },
                function (err) {
                    alert('ошибка обработки адреса');
                }
            );
        }
        this.createIcons = function () {

            storesService.getStores().then(function (stores) {
                for (var i = 0; i < stores.length; i++) {
                    (function (i) {
                        ctrl.saveIcon(stores, i);
                    })(i);
                }
            });
        }

        this.onStoreEnter = function (store) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].name == store.name && ctrl.icons[i].adress == store.adress) {
                    ctrl.icons[i].placemark.options.set('preset', 'twirl#greenStretchyIcon');
                }
            }
        }
        this.onStoreLeave = function (store) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].name == store.name && ctrl.icons[i].adress == store.adress) {
                    ctrl.icons[i].placemark.options.set('preset', 'twirl#redStretchyIcon');
                    break;
                }
            }
        }
    }


    function StoreDetailComponent(storesService) {
        var ctrl = this;
        this.$routerOnActivate = function (next) {

            var order = next.params.order;
            storesService.getStore(order).then(function (store) {
                if (store) {
                    ctrl.editName = store.name;
                    ctrl.editAdress = store.adress;
                    ctrl.editOperation = store.operation;
                    ctrl.store = store;
                } else { // order not found
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
            var storeOrder = ctrl.store && ctrl.store.order;

            this.$router.navigate(['StoresList', { order: storeOrder }]);
        };
    }

})(window.angular);
