from app import app

client = app.test_client()

# 1. Test Home
res = client.get('/')
assert res.status_code == 200, f'Home failed: {res.status_code}'
print('[PASS] 1. Home Page: 200 OK')

# 2. Test Track
res = client.get('/track?ref=CS-PUN-2026-1042')
assert res.status_code == 200, f'Track failed: {res.status_code}'
assert b'CS-PUN-2026-1042' in res.data, 'Ref not found in track page'
print('[PASS] 2. Track Page with Reference: 200 OK')

# 3. Test Receipt
res = client.get('/receipt/CS-PUN-2026-1042')
assert res.status_code == 200, f'Receipt failed: {res.status_code}'
assert b'Digital Acknowledgement' in res.data, 'Receipt header not found'
print('[PASS] 3. Official Digital Acknowledgement Receipt: 200 OK')

# 4. Test API Categories
res = client.get('/api/departments/1/categories')
assert res.status_code == 200
data = res.get_json()
assert len(data['categories']) > 0
print(f'[PASS] 4. Dynamic Categories API: 200 OK ({len(data["categories"])} categories returned)')

# 5. Test Citizen Login
res = client.post('/login', data={'email': 'rajesh.patil@gmail.com', 'password': 'pune123', 'expected_role': 'citizen'}, follow_redirects=True)
assert res.status_code == 200
assert b'Rajesh Patil' in res.data
print('[PASS] 5. Citizen Login & Dashboard: 200 OK')

# 6. Test Officer Login
res = client.post('/login', data={'email': 'officer.roads@pmc.gov.in', 'password': 'pune123', 'expected_role': 'officer'}, follow_redirects=True)
assert res.status_code == 200
assert b'Er. Amit Kulkarni' in res.data
print('[PASS] 6. Officer Login & Queue: 200 OK')

# 7. Test Admin Login
res = client.post('/login', data={'email': 'admin@civicsaathi.pune.gov.in', 'password': 'admin123', 'expected_role': 'admin'}, follow_redirects=True)
assert res.status_code == 200
assert b'Pune Central Grievance' in res.data
print('[PASS] 7. Super Administrator Console: 200 OK')

print('\n>>> ALL 7 CORE FUNCTIONAL TESTS PASSED FLAWLESSLY! <<<')
