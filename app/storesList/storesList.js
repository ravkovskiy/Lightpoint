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
            ctrl.icons = [];
            ctrl.search = '';
            ctrl.filterTime = new Date();
            ctrl.timer;
            ctrl.filteredArray = filterFilter(ctrl.stores, ctrl.search);

            /*Start pagination code*/
            ctrl.currentPage = 1;
            ctrl.numPerPage = 4;
            ctrl.maxSize = 3;
            ctrl.begin = ((ctrl.currentPage - 1) * this.numPerPage);
            ctrl.end = ctrl.begin + ctrl.numPerPage;
            ctrl.paginationArray = ctrl.filteredArray.slice(ctrl.begin, ctrl.end);
            ctrl.sortOrder();

            ymaps.ready(initMap);
            function initMap() {
                ctrl.myMap = new ymaps.Map('myMap', {
                    center: [53.90, 27.56],
                    zoom: 10
                });
                ctrl.myMap.controls.add('zoomControl', { right: '15px' });
                ctrl.addIcon();
            }

        };

        this.onChangePage = function () {
            ctrl.begin = ((ctrl.currentPage - 1) * this.numPerPage);
            ctrl.end = ctrl.begin + ctrl.numPerPage;
            ctrl.paginationArray = ctrl.filteredArray.slice(ctrl.begin, ctrl.end);
            ctrl.updateMap();
        }

        this.filterStores = function () {
            ctrl.filteredArray = filterFilter(ctrl.stores, ctrl.search);
            ctrl.begin = ((ctrl.currentPage - 1) * this.numPerPage);
            ctrl.end = ctrl.begin + ctrl.numPerPage;
            ctrl.paginationArray = ctrl.filteredArray.slice(ctrl.begin, ctrl.end);
            ctrl.sortOrder();
            if (new Date() - ctrl.filterTime < 1000) {
                clearTimeout(ctrl.timer);
                ctrl.timer = setTimeout(ctrl.updateMap, 1000);
            } else {
                ctrl.timer = setTimeout(ctrl.updateMap, 300);
            }
            ctrl.filterTime = new Date();
        };

        this.updateMap = function () {
            for (var i = 0; i < ctrl.icons.length; i++) {
                ctrl.removeIcon(ctrl.icons[i]);
                i--;
            }
            ctrl.addIcon();
        };

        this.gotoItems = function (store) {
            var storeId = store && store.id;

            this.$router.navigate(['ItemsList', { id: storeId }]);
        };

        this.onSelect = function (store) {
            this.$router.navigate(['StoreDetail', { id: store.id }]);
        };

        this.onAdd = function () {
            var stores = ctrl.stores;
            var id = 1;
            for (var i = 0; i < stores.length; i++) {
                if (stores[i].id >= id) {
                    id = stores[i].id + 1;
                }
            }
            stores.push({ id: id, order: stores.length + 1, name: ctrl.storeName, adress: ctrl.storeAdress, operation: ctrl.storeModeOreration, items: [] });
            ctrl.storeName = ctrl.storeAdress = ctrl.storeModeOreration = '';
            ctrl.filterStores();
            this.onChangePage();
        };

        this.onDelete = function (store) {
            var stores = ctrl.paginationArray;
            ctrl.removeIcon(store);
            var order = stores.indexOf(store);
            stores.splice(order, 1);
            stores = ctrl.stores;
            for (var i = 0; i < stores.length; i++) {
                if (stores[i].id == store.id) {
                    stores.splice(i, 1);
                    break;
                }
            }
            stores = ctrl.filteredArray;
            for (var i = 0; i < stores.length; i++) {
                if (stores[i].id == store.id) {
                    stores.splice(i, 1);
                    break;
                }
            }
            for (var i = 1; i <= stores.length; i++) {
                stores[i - 1].order = i;
            }
            this.onChangePage();
        };

        this.sortOrder = function () {
            var stores = ctrl.paginationArray;
            for (var i = 1; i <= stores.length; i++) {
                stores[i - 1].order = i + (ctrl.currentPage - 1) * ctrl.numPerPage;
            }
        };

        this.addIcon = function (icon) {
            if (icon === undefined) {
                ctrl.createIcons();
            } else {
                ctrl.saveIcon(ctrl.stores[icon - 1]);
            }
        };

        this.removeIcon = function (store) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].id == store.id) {
                    ctrl.myMap.geoObjects.remove(ctrl.icons[i].placemark);
                    ctrl.icons.splice(i, 1);
                    break;
                }
            }
        };

        this.saveIcon = function (store) {
            var geocoder = ymaps.geocode(store.adress);
            geocoder.then(
                function (res) {
                    try {
                        var geoCoord = res.geoObjects.get(0).geometry.getCoordinates();

                        var placemark = new ymaps.Placemark(geoCoord, {
                            balloonContent: '<div>Адрес: ' + store.adress + '</div><div>Время работы: ' + store.operation + '</div><hr>',
                            iconContent: store.name
                        }, {
                                preset: "twirl#redStretchyIcon",
                                balloonCloseButton: false,
                                hideIconOnBalloonOpen: false
                            });
                        ctrl.myMap.geoObjects.add(placemark);
                        placemark.events
                            .add('mouseenter', function (e) {
                                e.get('target').options.set('preset', 'twirl#greenStretchyIcon');
                            })
                            .add('mouseleave', function (e) {
                                e.get('target').options.set('preset', 'twirl#redStretchyIcon');
                            });

                        ctrl.icons.push({ id: store.id, placemark: placemark });
                    } catch (err) {
                        console.log('Ошибка обработки адреса.')
                    }

                },
                function (err) {
                }
            );
        };

        this.createIcons = function () {
            var stores = ctrl.paginationArray;
            for (var i = 0; i < stores.length; i++) {
                (function (i) {
                    ctrl.saveIcon(stores[i]);
                })(i);
            }
        };

        this.onStoreEnter = function (store) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].id == store.id) {
                    ctrl.icons[i].placemark.options.set('preset', 'twirl#greenStretchyIcon');
                    break;
                }
            }
        };

        this.onStoreLeave = function (store) {
            for (var i = 0; i < ctrl.icons.length; i++) {
                if (ctrl.icons[i].id == store.id) {
                    ctrl.icons[i].placemark.options.set('preset', 'twirl#redStretchyIcon');
                    break;
                }
            }
        };

    }

})(window.angular);
