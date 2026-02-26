async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@company.com', password: 'admin' }) // check seeding password logic or just hardcode DB insert
        });

        // Wait, let's just use pg directly and print the status in the test-db file
    } catch (e) {
        console.error(e.message);
    }
}
test();
