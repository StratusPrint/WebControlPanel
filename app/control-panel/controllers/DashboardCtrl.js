app.controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope', '$q', 'hub', 'printer', 'sensor'];

function DashboardCtrl($scope, $q, hub, printer, sensor) {
  $scope.message = 'Welcome to the Dashboard!';
  console.log('Default Hub: ' + $scope.user._user.default_hub_id);
  console.log('Fetching Hub id 27');
  var defaultHubId = 27;
  // Var defaultHubPromise = hub.getHub($scope.user._user.default_hub_id);

  var defaultHubPromise = hub.getHub(defaultHubId);
  defaultHubPromise.then(function(response) {
    $scope.hub = response;
  });

  var statsPromise = hub.getStatistics(defaultHubId);
  statsPromise.then(function(response) {
    $scope.stats = response;
    console.log('Hubs stats: ' + JSON.stringify($scope.stats));
  });

  var printersPromise = hub.getPrinters(defaultHubId);
  printersPromise .then(function(response) {
    $scope.printers = response;
    console.log('Hubs printers: ' + JSON.stringify($scope.printers));
  });

  var sensorsPromise = hub.getSensors(defaultHubId);
  sensorsPromise.then(function(_sensors) {
    var sensorDataPromises = [];
    $scope.sensors = _sensors;

    for (var i = 0; i < $scope.sensors.length; i++) {
      sensorDataPromises.push(sensor.getData($scope.sensors[i].id));
    }

    $q.all(sensorDataPromises).then(function(_data) {
      var sensorData = _data;
      console.log('Sensor Data Size: ' + sensorData.length);

      for (var j = 0; j < sensorData.length; j++) {
        $scope.sensors[j].data = sensorData[j];
        var dataLength = $scope.sensors[j].data.length;
        $scope.sensors[j].newestDatum = $scope.sensors[j].data[dataLength - 1];
        if ($scope.sensors[j].data[dataLength - 1].value === '1' || $scope.sensors[j].data[dataLength - 1].value === '0') {
          if ($scope.sensors[j].data[dataLength - 1].value === '1') {
            $scope.sensors[j].newestDatum.value = 'True';
          } else {
            $scope.sensors[j].newestDatum.value = 'False';
          }
        }else {
          $scope.sensors[j].newestDatum.value = parseFloat($scope.sensors[j].data[dataLength - 1].value).toFixed(2);
        }
      }
    });
  });

}
