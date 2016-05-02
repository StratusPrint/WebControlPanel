app.controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope', '$state', '$q', 'hub', 'printer', 'sensor'];

function DashboardCtrl($scope, $state, $q, hub,  printer, sensor) {
  var defaultHubId = $scope.user._user.default_hub_id;

  $scope.currentHub = {};
  $scope.hubs = {};
  $scope.stats = {};
  $scope.printers = {};
  $scope.printer = {};
  $scope.sensors = {};

  $scope.lineChartdata = [
    { y: '2002', a: 75,  b: 65 },
  ];
  /********************************************************
   * Promise Handling methods
   * Fetchs everything from the API, sets all variables
   */

  /**
   * setAllData
   * sets all scope variables by calling their associated functions
   *
   * Variables Set
   *  $scope.currentHub
   *  $scope.hubs
   *  $scope.stats
   *  $scope.printers
   *  $scope.printer
   *  $scope.printer.currentJob
   *  $scope.sensors
   *  $scope.sensors.data
   *
   * @param _hubId
   * @returns {undefined}
   */
  $scope.setAllData = function(_hubId) {
    $scope.setCurrentHub(_hubId);
    $scope.setAllHubs();
    $scope.setStats(_hubId);
    $scope.setPrinters(_hubId);
    $scope.setSensors(_hubId);
  };

  /**
   * setCurrentHub
   * $scope.currentHub = the hub retrieved by _hubId
   *
   * @param {number} _hubId
   * @returns {undefined}
   */
  $scope.setCurrentHub = function(_hubId) {
    var defaultHubPromise = hub.getHub(_hubId);
    defaultHubPromise.then(function(_hub) {
      $scope.currentHub = _hub;
    });
  };

  /**
   * setAllHubs
   * $scope.hubs = all hubs in the DB
   *
   * @returns {undefined}
   */
  $scope.setAllHubs = function() {
    var hubsPromise = hub.getAllHubs();
    hubsPromise.then(function(_hubs) {
      $scope.hubs = _hubs;
    });
  };

  /**
   * setStats
   * $scope.stats = statistics retrieved from the hub
   *
   * @param {number} _hubId
   * @returns {undefined}
   */
  $scope.setStats = function(_hubId) {
    var statsPromise = hub.getStatistics(_hubId);
    statsPromise.then(function(_stats) {
      $scope.stats = _stats;
    });
  };

  /**
   * setPrinters
   * $scope.printers = printers retrieved from the hub id
   * $scope.printer = first printer in the array
   *
   * @param {number} _hubId
   * @returns {undefined}
   */
  $scope.setPrinters = function(_hubId) {
    var printersPromise = hub.getPrinters(_hubId);
    printersPromise .then(function(_printers) {
      var currentJobsPromise = [];
      $scope.printers = _printers;
      $scope.printer = $scope.printers[0];
    });
  };

  /**
   * setPrinter
   * $scope.printer = the printer with the id passed in
   * calls $scope.setCurrentJob($scope.printer.id)
   *
   * @param {number} _printerId
   * @returns {undefined}
   */
  $scope.setPrinter = function(_printerId) {
    for (var i = 0; i < $scope.printers.length; i++) {
      if ($scope.printers[i].id === _printerId) {
        $scope.printer = $scope.printers[i];
        $scope.setCurrentJob($scope.printer.id);
      }
    }
  };

  /**
   * setCurrentJob
   * $scope.printer.currentJob = current job of the printer
   *
   * @param _printerId
   * @returns {undefined}
   */
  $scope.setCurrentJob = function(_printerId) {
    printer.getCurrentJob(_printerId)
    .success(function(response) {
      $scope.printer.currentJob = response;
    })
    .error(function(response) {
      console.log('Unable to retrieve current job.');
      console.log(response);
    });
  };

  /**
   * setSensors
   *
   * Retrieving all sensors that are connected to the hub
   * $scope.sensors = sensors attached to the a hub
   *
   * Handling the promise for retrieving the sensor data and assigning that data to the associated sensor
   *
   * $scope.sensors.data = data associated with each sensor
   * $scope.sensors.newestDatum
   *
   * @param {number} _hubId
   * @returns {undefined}
   */
  $scope.setSensors = function(_hubId) {
    var sensorsPromise = hub.getSensors(_hubId);
    sensorsPromise.then(function(_sensors) {
      var sensorDataPromises = [];
      $scope.sensors = _sensors.data;

      for (var i = 0; i < $scope.sensors.length; i++) {
        sensorDataPromises.push(sensor.getData($scope.sensors[i].id));
      }

      // Execute all promises
      $q.all(sensorDataPromises).then(function(_data) {
        var sensorData = _data;
        var tempSensors = [];
        var humidSensors = [];


        for (var j = 0; j < sensorData.length; j++) {
          // Bind to a variable in the sensor itself
          $scope.sensors[j].data = sensorData[j];
          if ($scope.sensors[j].category === 'temperature') {
            // $scope.sensors[j].data = truncateData($scope.sensors[j].data);
            // $scope.sensors[j] = truncateData($scope.sensors[j]);
            // truncateData($scope.sensors[j]);

            // Console.log($scope.sensors[j].data);
            // TempSensor.push($scope.sensors[j]);
            // PopulateTempGraph($scope.sensors[j]);
            // Populate temperature data for graph

          } else if ($scope.sensors[j].category === 'humidity') {
            // Populate humidity graph
          }
        }

        setTempData($scope.sensors);
      });
    });
  };

  $scope.setAllData(defaultHubId);

  /*******************************************************
   * Functions
   */

  /**
   * ViewPrinter
   * Sets the state to that of the printer with the associated _printerId
   *
   * @param _printerId
   * @returns {undefined}
   */
  $scope.viewPrinter = function(_printerId) {
    $state.go('dashboard.printer', {hubId: $scope.currentHub.id, printerId: _printerId });
  };

  /********************************************************
   * Chart Data
   */
  var setTempData = function(sensors) {
    // console.log(sensors[1]);
    // console.log(sensors[2]);
    var sensor1Data = sensors[1].data;
    var sensor2Data = sensors[2].data;

    var someData = [
    ];
    console.log(someData[0]);

    var data = {};
    data.y = sensors[0].data[0].created_at;
    data.a = sensors[0].data[0].value;
    data.b = sensors[1].data[0].value;
    someData.push(data);
    console.log(data);

    data = {};
    data.y = sensors[0].data[1].created_at;
    data.a = sensors[0].data[1].value;
    data.b = sensors[1].data[1].value;
    someData.push(data);

    $scope.lineChartData = someData;
  };

  /********************************************************
   * Local functions
   */
  function truncateData(_sensor) {
    for (var i; i < _sensor.data.length; i++) {
      // _sensor.data[i].value = parseFloat(_sensor.data[i].value.toFixed(2));
      _sensor.data[i].value = 5;
      // Console.log('Truncated data ' + _sensor.data[i].value);
    }
    // Console.log('Truncated');
    // Console.log(_sensor.data);
  }
}
