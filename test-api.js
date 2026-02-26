async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            console.log('Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.data.token;

        const res = await fetch('http://localhost:5000/api/admin/analytics/daily-occupancy', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Status:', res.status);
        console.log('Data:', await res.text());
    } catch (e) {
        console.error(e.message);
    }
}
test();
