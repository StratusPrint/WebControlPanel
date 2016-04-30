angular.module('ControlPanel', [
    'ui.router',
    'ng-token-auth',
    'LocalStorageModule',
    'ui.bootstrap',
    'ui.bootstrap.showErrors',
    'validation.match',
    'datatables',
    'ngFileUpload',
    'angular.vertilize',
    'angular-table',
    'angular.morris-chart',
]);

var app = angular.module('ControlPanel');

app.config(function($stateProvider, $urlRouterProvider,$locationProvider) {
  $stateProvider
  .state('login', {
    url: '/login?accountConfirmed',
    params: {
      passwordResetEmailSent: {
        value: false,
      },
      passwordReset: {
        value: false,
      },
      hiddenParam: 'YES',
    },
    templateUrl: 'control-panel/views/auth/login.html',
    controller: 'AuthCtrl',
    data: {
      requireLogin: false,
    },
  })
  .state('reset-password', {
    url: '/reset-password',
    templateUrl: 'control-panel/views/auth/reset-password.html',
    controller: 'AuthCtrl',
    data: {
      requireLogin: false,
    },
  })
  .state('change-password', {
    url: '/change-password',
    templateUrl: 'control-panel/views/auth/change-password.html',
    controller: 'AuthCtrl',
    data: {
      requireLogin: false,
    },
  })
  .state('dashboard', {
    templateUrl: 'control-panel/views/dashboard/common.html',
    abstract: true,
  })
  .state('dashboard.overview', {
    url: '/dashboard',
    templateUrl: 'control-panel/views/dashboard/overview.html',
    controller: 'DashboardCtrl',
    data: {
      requireLogin: true,
    },
  })
  .state('dashboard.register', {
    url: '/register',
    templateUrl: 'control-panel/views/dashboard/register.html',
    controller: 'RegisterCtrl',
    data: {
      requireLogin: true,
    },
  })
  .state('dashboard.profile', {
    url: '/profile',
    templateUrl: 'control-panel/views/dashboard/profile.html',
    controller: 'ProfileCtrl',
    data: {
      requireLogin: true,
    },
  })
  .state('dashboard.listHubs', {
    url: '/hubs',
    templateUrl: 'control-panel/views/dashboard/listHubs.html',
    controller: 'ListHubsCtrl',
    data: {
      requireLogin: true,
    },
  })
  .state('dashboard.viewHub', {
    url: '/hubs/:hubId',
    templateUrl: 'control-panel/views/dashboard/viewHub.html',
    controller: 'ViewHubCtrl',
    data: {
      requireLogin: true,
    },
  })
  .state('dashboard.printer', {
    url: '/hubs/:hubId/printers/:printerId',
    templateUrl: 'control-panel/views/dashboard/printer.html',
    controller: 'PrinterCtrl',
    data: {
      requireLogin: true,
    },
  })
  .state('dashboard.users', {
    url: '/users',
    templateUrl: 'control-panel/views/dashboard/users.html',
    controller: 'UsersCtrl',
    data: {
      requireLogin: true,
    },
  });

  $urlRouterProvider.otherwise('dashboard');
});

app.config(function($authProvider) {
  $authProvider.configure({
    apiUrl: 'http://test.api.stratusprint.com/v1',
    passwordResetSuccessUrl: 'http://test.stratusprint.com/#/change-password',
    confirmationSuccessUrl: 'http://test.stratusprint.com/#/login?accountConfirmed=true',
  });
});

app.run(function($rootScope, $state, user, auth) {
  $rootScope.user = user;
  $rootScope.auth = auth;
});
