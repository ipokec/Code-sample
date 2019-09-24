
document.addEventListener("DOMContentLoaded", function (event) {

    var mainVue = new Vue({
        el: '#main-app',
        template: '<main-app/>',
        components: {
            'main-app': httpVueLoader('App.vue')
        }
    });
});



