(function (angular) {
    'use strict';
    angular.module('stores')

        .component('storesList', {
            templateUrl: 'storesList.html',
            bindings: { $router: '<' },
            controller: StoreListController,
            $canActivate: function ($nextInstruction, $prevInstruction) {
                console.log('$canActivate', arguments);
            }
        })

    function StoreListController(storesService) {
        var ctrl = this;
        this.selected = null;

        this.$routerOnActivate = function (next) {
            console.log('$routerOnActivate', this, arguments);

            storesService.getStores().then(function (stores) {
                ctrl.stores = stores;
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

})(window.angular);
