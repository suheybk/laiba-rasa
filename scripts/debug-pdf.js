
try {
    const pdf = require('pdf-parse');
    console.log('--- require("pdf-parse") ---');
    console.log('Type:', typeof pdf);
    console.log('Is Function:', typeof pdf === 'function');
    console.log('Keys:', Object.keys(pdf));

    if (pdf.default) {
        console.log('--- .default ---');
        console.log('Type:', typeof pdf.default);
        console.log('Is Function:', typeof pdf.default === 'function');
    }

    if (pdf.PDFParse) {
        console.log('--- .PDFParse ---');
        console.log('Type:', typeof pdf.PDFParse);
        console.log('Is Function:', typeof pdf.PDFParse === 'function');
    }

    // Check if we can find the old style function
    // Usually it accepts a buffer
    // Let's see if any key looks like the main function
} catch (e) {
    console.error('Require failed:', e);
}
