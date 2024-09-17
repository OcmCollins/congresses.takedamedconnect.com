// eslint-disable-next-line import/no-cycle
import { sampleRUM, loadScript } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

const loadAdobeDTM = async () => {
  // await loadScript('https://assets.adobedtm.com/8fee56b0a165/17899e6850f3/launch-1c377528b01b-development.min.js');
};

await loadAdobeDTM();
