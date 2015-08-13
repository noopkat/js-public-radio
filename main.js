(function() {
  var AvrgirlIspmkii = require('avrgirl-ispmkii');
  var chips = require('avrgirl-chips-json');
  var intelhex = require('intel-hex');
  var fs = require('fs');
  var async = require('async');

  var attiny45 = chips.attiny45;

  var avrgirl = new AvrgirlIspmkii(attiny45);

  var pr = fs.readFileSync('pr.hex', {encoding: 'utf8'});
  var ee = fs.readFileSync('eeprom.hex', {encoding: 'utf8'});
  var prBin = intelhex.parse(pr).data;
  var eeBin = intelhex.parse(ee).data;
  var sig = new Buffer('AVRISP_MK2');

  avrgirl.on('ready', function() {
    // run demos
    async.series([
      //avrgirl.verifyProgrammer.bind(avrgirl, sig),
      avrgirl.enterProgrammingMode.bind(avrgirl),
      function hi (callback) {
        avrgirl.getChipSignature(function(error, data) {
          console.log('signature response read:' , data.toString('hex'));
          callback();
        });
      },
      function hifuses (callback) {
        avrgirl.readFuses(function(error, data) {
          console.log('fuse response read:', JSON.stringify(data));
          callback();
        });
      },
      function readeeprom (callback) {
        avrgirl.readEeprom(0x04, function(error, data) {
          console.log('eeprom response read:', error, data.toString('hex'));
          callback();
        });
      },
      function readflash (callback) {
        avrgirl.readFlash(0x04, function(error, data) {
          console.log('flash response read:', error, data.toString('hex'));
          callback();
        });
      },
      avrgirl.eraseChip.bind(avrgirl),
      avrgirl.writeMem.bind(avrgirl, 'flash', prBin),
      avrgirl.writeMem.bind(avrgirl, 'eeprom', eeBin),
      avrgirl.exitProgrammingMode.bind(avrgirl)
      ], function (error) {
        console.log(error);
        console.log('done with programmer.')
        avrgirl.close();
      }
    );
  });
})();
