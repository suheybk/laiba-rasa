
const fs = require('fs');
const path = require('path');

async function testUpload() {
    try {
        const filePath = path.join(process.cwd(), 'tde12.pdf');

        if (!fs.existsSync(filePath)) {
            console.error('Test file not found:', filePath);
            return;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const { Blob } = require('buffer');
        const blob = new Blob([fileBuffer], { type: 'application/pdf' });

        const formData = new FormData();
        formData.append('file', blob, 'tde12.pdf');

        console.log('Uploading tde12.pdf...');

        // Note: This requires the server to be running on localhost:3000
        // And we might need to bypass auth for this test or mock session
        // If auth is strictly enforced, this might fail with 401. 
        // In that case, we need a session token.
        // For now, let's see if we get 401.

        const response = await fetch('http://localhost:3000/api/teacher/upload-pdf', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testUpload();
