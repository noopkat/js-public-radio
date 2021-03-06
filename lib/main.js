(function() {
  var AvrgirlIspmkii = require('avrgirl-ispmkii');
  var chips = require('avrgirl-chips-json');
  var intelhex = require('intel-hex');
  var fs = require('fs');
  var async = require('async');

  var attiny45 = chips.attiny45;

  var pr = fs.readFileSync('hex/pr.hex', {encoding: 'utf8'});
  var prBin = intelhex.parse(pr).data;

  var circle = new window.ProgressBar.Circle('#circle-container', {
    color: '#42B7FF',
    strokeWidth: 4,
    fill: 'rgba(1,1,1,0)',
    svgStyle: null,
    duration: 300,
    easing: 'easeOut'
  });

  var flashForm = document.getElementById('flashForm');
  var freqField = document.getElementById('frequency');
  var bandField = document.getElementById('band');
  var deemphField = document.getElementById('deemphasis');
  var cspacingField = document.getElementById('cspacing');
  var advancedLink = document.getElementById('advanced-link');
  var advanced = document.getElementById('advanced');

  flashForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var f = freqField.value;
    var b = bandField.value;
    var d = deemphField.value;
    var cs = cspacingField.value;

    console.log('flashing radio with:', f, b, d, cs);
    flashRadio(f, b, d, cs);
  });

  advancedLink.addEventListener('click', function(e) {
    e.preventDefault();
    $(advanced).slideDown();
    $(e.target).hide();
  });

  function advanceProgress(text, float, callback) {
    circle.animate(float, function() {
      circle.setText(text);
      callback();
    });
  }

  function clearProgress() {
    circle.set(0);
    circle.setText('');
  }

  function flashRadio(f, b, d, cs) {
    clearProgress();
    var eeprom = makeEeprom(f, b, d, cs);

    var avrgirl = new AvrgirlIspmkii(attiny45);
    avrgirl.on('ready', function() {
      async.series([
        advanceProgress.bind(window, 'connecting', 0),
        avrgirl.enterProgrammingMode.bind(avrgirl),
        advanceProgress.bind(window, 'erasing', 0.1),
        avrgirl.eraseChip.bind(avrgirl),
        advanceProgress.bind(window, 'flashing', 0.4),
        avrgirl.writeMem.bind(avrgirl, 'flash', prBin),
        advanceProgress.bind(window, 'flashing', 0.7),
        avrgirl.writeMem.bind(avrgirl, 'eeprom', eeprom),
        advanceProgress.bind(window, 'resetting', 0.9),
        avrgirl.exitProgrammingMode.bind(avrgirl),
        advanceProgress.bind(window, 'done', 1),
        ], function (error) {
          setTimeout(clearProgress, 1000);
          console.log(error);
          console.log('done with programmer.')
          avrgirl.close();
        }
      );
    });
  }
})();
