(function (angular) {
    'use strict';
    angular.module('stores')

        .component('storesList', {
            templateUrl: 'storesList/storesList.html',
            bindings: { $router: '<' },
            controller: StoreListController
        })

    function StoreListController(storesService, filterFilter) {
        var ctrl = this;
        this.selected = null;

        this.$routerOnActivate = function (next) {
            ctrl.stores = storesService.getStores();
            ymaps.ready(initMap);
            function initMap() {
                ctrl.initMap = true;
                ctrl.myMap = new ymaps.Map('myMap', {
                    // центр и коэффициент масштабирования однозначно
                    // определяют область картографирования
                    center: [53.90, 27.56],
                    zoom: 10
                });
                ctrl.myMap.controls.add('zoomControl', { right: '15px' });
                ctrl.addIcon();
            }
            ctrl.filterStores();

        };
        this.filterStores = function () {
            ctrl.filteredArray = filterFilter(ctrl.stores, ctrl.search);
            ctrl.changeIcons();
            ctrl.sortOrder();
        }

        this.gotoItems = function (store) {
            var storeId = store && store.id;

            this.$router.navigate(['ItemsList', { id: storeId }]);
        };

        this.onSelect = function (store) {
            this.$router.navigate(['StoreDetail', { id: store.id }]);
        };
        this.onAdd = function () {
            var stores = ctrl.stores;
            var id = Math.ceil(Math.random() * 100000);
            stores.push({ id: id, order: stores.length + 1, name: ctrl.storeName, adress: ctrl.storeAdress, operation: ctrl.storeModeOreration, items: [] });
            ctrl.storeName = ctrl.storeAdress = ctrl.storeModeOreration = '';
            ctrl.filterStores();
            ctrl.addIcon(stores.length, stores);
        };
        this.onDelete = function (store) {
            var stores = ctrl.stores;
            ctrl.removeIcon(store, stores);
            var order = stores.indexOf(store);
            stores.splice(order, 1);
            for (var i = 1; i <= stores.length; i++) {
                stores[i - 1].order = i;
            }
            ctrl.filterStores();
        };
        this.sortOrder = function () {
            var stores = ctrl.filteredArray;
            for (var i = 1; i <= stores.length; i++) {
                stores[i - 1].order = i;
            }
        }

        this.addIcon = function (icon, stores) {
            if (icon === undefined) {
                ctrl.createIcons();
            } else {
                ctrl.saveIcon(stores, icon - 1);
            }
        }
        this.removeIcon = function (store, stores) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].id == store.id) {
                    ctrl.myMap.geoObjects.remove(ctrl.icons[i].placemark);
                    ctrl.icons.splice(i, 1);
                    break;
                }
            }
        }
        this.changeIcons = function () {
            var newArray = [];
            var isFound = false;
            if (ctrl.icons.length >= ctrl.filteredArray.length || ctrl.icons.length == 0 && !ctrl.initMap) {
                for (var j = 0; j < ctrl.icons.length; j++) {
                    for (var i = 0; i < ctrl.filteredArray.length; i++) {
                        if (ctrl.icons[j].id == ctrl.filteredArray[i].id) {
                            isFound = true;
                            newArray.push(ctrl.icons[j]);
                            break;
                        }
                    }
                    if (isFound) {
                        isFound = false;
                    } else {
                        ctrl.myMap.geoObjects.remove(ctrl.icons[j].placemark);
                    }
                }
                ctrl.icons = newArray;
            } else {
                for (var j = 0; j < ctrl.filteredArray.length; j++) {
                    for (var i = 0; i < ctrl.icons.length; i++) {
                        if (ctrl.icons[i].id == ctrl.filteredArray[j].id) {
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound) {
                        isFound = false;
                    } else {
                        ctrl.saveIcon(ctrl.filteredArray, j);
                    }
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

                        ctrl.icons.push({ id: stores[i].id, placemark: placemark });
                    } catch (err) {
                        console.log('ошибка обработки адреса!')
                    }

                },
                function (err) {
                    alert('ошибка обработки адреса');
                }
            );
        }
        this.createIcons = function () {
            var stores = ctrl.stores;
            for (var i = 0; i < stores.length; i++) {
                (function (i) {
                    ctrl.saveIcon(stores, i);
                })(i);
            }
        }

        this.onStoreEnter = function (store) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].id == store.id) {
                    ctrl.icons[i].placemark.options.set('preset', 'twirl#greenStretchyIcon');
                    break;
                }
            }
        }
        this.onStoreLeave = function (store) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].id == store.id) {
                    ctrl.icons[i].placemark.options.set('preset', 'twirl#redStretchyIcon');
                    break;
                }
            }
        }
    }

})(window.angular);
