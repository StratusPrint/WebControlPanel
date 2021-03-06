app.controller('ListHubsCtrl', ListHubsCtrl);

ListHubsCtrl.$inject = ['$scope', '$state', '$stateParams', '$controller','$compile', '$sanitize', 'DTOptionsBuilder', 'DTColumnBuilder', 'hub'];

function ListHubsCtrl($scope, $state, $stateParams, $controller, $compile, $sanitize, DTOptionsBuilder, DTColumnBuilder, hub) {
  // Inject alert controller scope
  $controller('AlertCtrl', { $scope: $scope });
  var dtCtrl = this;

  /******************************************************
   *
   * DataTables funsies
   */

  /*
   * Starts building the DataTable when the function returns!
   * Fetches promise and waits until it is fulfilled
   */
  dtCtrl.dtOptions = DTOptionsBuilder.fromFnPromise(function() {
    return hub.getAllHubs();
  })
  .withPaginationType('simple_numbers')
  .withOption('createdRow',createdRow)
  .withOption('responsive', true);
  /*
   * Scoops up the data returned from the promise
   * Sets columns and fills data based off of that
   */
  dtCtrl.cols = [
    DTColumnBuilder.newColumn(null).renderWith(status).withTitle('Status').withOption('responsivePriority',3),
    DTColumnBuilder.newColumn(null).renderWith(id).withTitle('ID').withOption('responsivePriority',5),
    DTColumnBuilder.newColumn(null).renderWith(friendlyId).withTitle('HUB Name').withOption('responsivePriority',2),
    DTColumnBuilder.newColumn(null).renderWith(location).withTitle('Location').withOption('responsivePriority',7),
    DTColumnBuilder.newColumn(null).renderWith(hostname).withTitle('Hostname').withOption('responsivePriority',6),
    DTColumnBuilder.newColumn(null).renderWith(desc).withTitle('Description').withOption('responsivePriority',4),
    DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(detailsButtonHTML).withOption('responsivePriority',1),
  ];
  dtCtrl.reloadData = reloadData;
  dtCtrl.dtInstance = {};

  function friendlyId(data) {
    return $sanitize(data.friendly_id);
  }

  function location(data) {
    return $sanitize(data.location);
  }

  function hostname(data) {
    return $sanitize(data.hostname);
  }

  function desc(data) {
    return $sanitize(data.desc);
  }

  function status(data) {
    return $sanitize(data.status);
  }

  function id(data) {
    return $sanitize(data.id);
  }

  /**
   * CreatedRow
   * Lets datatables know what row just got created
   * Recompiles the table so that a directive can get binded to the DT
   * It is used to bind the data to the directive
   * Without this ng-click will not work
   *
   * @param row
   * @param data
   * @param dataIndex
   * @returns {undefined}
   */
  function createdRow(row, data, dataIndex) {
    $compile(angular.element(row).contents())($scope);
  }

  /**
   * DetailsButtonHTML
   *
   * This is pretty much a directive
   * It gets called by the DTColumnBuilder .renderWith()
   *
   * @param data
   * @returns {undefined}
   */
  function detailsButtonHTML(data) {
    return '<button class="btn btn-primary btn-block" ng-click="viewDetails(' + data.id + ')"><i class="fa fa-gears"></i> Manage Hub</button>';
  }

  /**
   * ReloadData
   * Fetches a new hub.getAllHubs() promise
   * When the promise is fulfilled it will reload the data in the table
   *
   * @returns {undefined}
   */
  function reloadData() {
    var resetPaging = true;
    var hubsPromise = hub.getAllHubs();
    hubsPromise.then(function(response) {
      dtCtrl.dtInstance.reloadData(response, resetPaging);
    });
  }

  /******************************************************
   *
   * Rest of the webpage
   * /

  /**
   * ToHubsPage
   * Sets the state to the main hubs page, takes in a boolean if the page should refresh or not
   * @param refresh
   * @returns {}
   */
  $scope.toHubsPage = function(refresh) {
    $state.go('dashboard.listHubs',{},{reload: refresh});
  };

  /**
   * AddHub
   * Calls addHub in the hubs service
   * Adds a hub in the DB with the hub object gathered from the form
   * Performs multiple checks on the form, check if there are no warnings
   *  checks if the form is empty or not
   *  Checks if the user is an admin, incase they edit some htlm and get the form to show
   * If all checks clear, then it adds the hub, if the entity is invalid it will add the alert to tell the user
   * @param _hub
   * @returns {}
   */
  $scope.addHub = function(_hub) {
    if (!$scope.addHubForm.$valid) {
      $scope.addAlert('danger', 'Please correct the errors below and try submitting the form again.');
      return;
    }

    // Check whether form has not been filled out
    if ($scope.addHubForm.$pristine) {
      $scope.addAlert('warning', 'Please fill out the form below before saving.');
      return;
    }

    // Remove empty fields from profile to prevent errors
    Object.keys($scope.hub).forEach(function(key) {
      if ($scope.hub[key] === '') {
        delete $scope.hub[key];
      }
    });

    if ($scope.user.isAdmin()) {
      addHubPromise = hub.addHub(_hub);

      addHubPromise.then(function(data) {
        if (typeof (data) === 'object') {
          $scope.hubs.push(data);
          $scope.resetForm();
          $scope.addAlert('success', 'The hub was successfully added.');
        } else {
          $scope.addAlert('danger', 'Unable to add hub. Please try again.');
        }
      });
      return;
    }
    $scope.addAlert('warning', 'You do not have permission to add a new hub.');
  };

  /**
   * ResetForm
   * clears the $scope.hub and sets the form to pristine(cleared)
   *
   * @returns {undefined}
   */
  $scope.resetForm = function() {
    $scope.hub = {};
    $scope.addHubForm.$setPristine();
  };

  /**
   * GetHub
   * Retrieves the hub from the hubs JSON array
   * @param _id
   * @returns {JSON} if hub is found else returns {NUMBER} 0
   */
  $scope.getHub = function(_id) {
    console.log('Fetching hub#: ' + _id);
    for (var i = 0; i < $scope.hubs.length; i++) {
      if ($scope.hubs[i].id === _id) {
        console.log('Returning hub: ' + $scope.hubs[i].id);
        return $scope.hubs[i];
      }
    }
    return 0;
  };

  /**
   * ViewDetails
   * Sets the current hub selected to the id passed in
   * Changes the view to the current hubs page
   * @param _hubId
   * @returns {}
   */
  $scope.viewDetails = function(_hubId) {
    $scope.currentHub = this.getHub(_hubId);
    console.log('Current hub: ' + $scope.currentHub.id);
    $state.go('dashboard.viewHub', { hubId: _hubId });
  };
}
