function makeEeprom(f, b, d, cs) {
  var bufferpack = require('bufferpack');
  var crc = require('crc');

  var freq = f || 0.0;
  var band = b || 0;     // US 87.5 - 108
  var demphasis = d || 0;  // US 75uS
  var spacing = cs || 0;   // US 200KHz
  var volume = 0x0f;  // max (0 dBFS)

  var base = [87.5, 76, 76];
  var step = [5, 10, 20];

  var chan = ((freq - base[band]) * step[spacing]).toFixed(4);

  //if modf(chan)[0] != 0.0:
  // or something
  if ((chan % 1) !== 0.0000) {
    chan = 0
  };

  var t = bufferpack.pack('<BBBHB8x', [band, demphasis, spacing, chan, volume]);
  var crcval = crc.crc16(t).toString(16);

  var split = crcval.split('');
  var revcrcval = [split[2], split[3], split[0], split[1]].join('');
  var crcpack = new Buffer(revcrcval, 'hex');

  // console.log('crcval:', revcrcval, 'crcpack:', crcpack.toString('hex'));
  var eeprom = Buffer.concat([t, crcpack, t, crcpack]);
  return eeprom;
}
