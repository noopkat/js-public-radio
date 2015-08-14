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
    color: '#FCB03C',
    strokeWidth: 4,
    fill: '#fff',
    svgStyle: null,
    duration: 300,
    easing: 'easeOut'
  });

  var flashForm = document.getElementById('flashForm');
  var freqField = document.getElementById('frequency');
  var bandField = document.getElementById('band');
  var deemphField = document.getElementById('deemphasis');
  var cspacingField = document.getElementById('cspacing');

  flashForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var f = freqField.value;
    var b = bandField.value;
    var d = deemphField.value;
    var cs = cspacingField.value;

    console.log('flashing radio with:', f, b, d, cs);
    flashRadio(f, b, d, cs);
  });

  function advanceProgress(text, float, callback) {
    circle.animate(float, function() {
      circle.setText(text);
      callback();
    });
  }

  function flashRadio(f, b, d, cs) {
    circle.set(0);
    circle.setText('');

    var eeprom = makeEeprom(f, b, d, cs);

    var avrgirl = new AvrgirlIspmkii(attiny45);
    avrgirl.on('ready', function() {
      async.series([
        advanceProgress.bind(window, 'connecting...', 0),
        avrgirl.enterProgrammingMode.bind(avrgirl),
        advanceProgress.bind(window, 'erasing...', 0.1),
        avrgirl.eraseChip.bind(avrgirl),
        advanceProgress.bind(window, 'flashing...', 0.4),
        avrgirl.writeMem.bind(avrgirl, 'flash', prBin),
        advanceProgress.bind(window, 'flashing...', 0.7),
        avrgirl.writeMem.bind(avrgirl, 'eeprom', eeprom),
        advanceProgress.bind(window, 'resetting...', 0.9),
        avrgirl.exitProgrammingMode.bind(avrgirl),
        advanceProgress.bind(window, 'done', 1),
        ], function (error) {
          console.log(error);
          console.log('done with programmer.')
          avrgirl.close();
        }
      );
    });
  }
})();
