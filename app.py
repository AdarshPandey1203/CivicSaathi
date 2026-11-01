import os
import uuid
import base64
import random
from datetime import datetime
from functools import wraps
from flask import (
    Flask, render_template, request, redirect,
    url_for, session, flash, jsonify, send_from_directory
)
from werkzeug.utils import secure_filename

from config import Config
from database import (
    init_db, query_db, execute_db,
    hash_password, verify_password
)
from seed_data import seed_database, PUNE_WARDS

app = Flask(__name__)
app.config.from_object(Config)

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# -----------------------------------------------------------------------------
# Authentication & Role Decorators
# -----------------------------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this portal.', 'warning')
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                flash('Please log in to continue.', 'warning')
                return redirect(url_for('login'))
            if session.get('role') not in allowed_roles:
                flash('Unauthorized access: You do not have permissions for this section.', 'danger')
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def save_uploaded_or_camera_image(file_obj, camera_base64):
    """Saves either an uploaded image file or a base64 camera snapshot."""
    if file_obj and file_obj.filename and allowed_file(file_obj.filename):
        ext = file_obj.filename.rsplit('.', 1)[1].lower()
        filename = f"evidence_{uuid.uuid4().hex[:12]}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file_obj.save(filepath)
        return f"/static/uploads/{filename}"

    if camera_base64 and 'data:image' in camera_base64:
        try:
            header, encoded = camera_base64.split(',', 1)
            image_data = base64.b64decode(encoded)
            filename = f"camera_{uuid.uuid4().hex[:12]}.jpg"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            with open(filepath, 'wb') as f:
                f.write(image_data)
            return f"/static/uploads/{filename}"
        except Exception as e:
            print(f"Error saving camera image: {e}")
    return None

# -----------------------------------------------------------------------------
# Module 1: Authentication & Navigation Routes
# -----------------------------------------------------------------------------
@app.route('/')
def index():
    departments = query_db("SELECT * FROM departments WHERE is_active = 1 ORDER BY id ASC") or []
    
    # Compute City Metrics
    total = query_db("SELECT COUNT(*) as count FROM complaints", one=True)['count']
    resolved = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'", one=True)['count']
    in_progress = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'", one=True)['count']
    under_review = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Under Review'", one=True)['count']
    submitted = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Submitted'", one=True)['count']

    stats = {
        'total': total,
        'resolved': resolved,
        'in_progress': in_progress,
        'under_review': under_review,
        'submitted': submitted
    }
    return render_template('index.html', departments=departments, stats=stats, wards=PUNE_WARDS)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()
        expected_role = request.form.get('expected_role', '').strip()

        user = query_db("SELECT * FROM users WHERE LOWER(email) = %s AND is_active = 1", (email,), one=True)
        if user and verify_password(password, user['password_hash']):
            if expected_role and user['role'] != expected_role:
                flash(f"Account exists but is a '{user['role'].capitalize()}' account, not '{expected_role.capitalize()}'. Please switch tabs.", 'warning')
                return render_template('login.html')

            # Populate session
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['email'] = user['email']
            session['role'] = user['role']
            session['ward_area'] = user['ward_area']
            
            if user['role'] == 'officer' and user['department_id']:
                dept = query_db("SELECT name FROM departments WHERE id = %s", (user['department_id'],), one=True)
                session['department_id'] = user['department_id']
                session['dept_name'] = dept['name'] if dept else 'Department'

            flash(f"Welcome back, {user['name']}!", 'success')

            # Redirect by role
            if user['role'] == 'citizen':
                return redirect(url_for('citizen_dashboard'))
            elif user['role'] == 'officer':
                return redirect(url_for('officer_dashboard'))
            elif user['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password. Please verify your credentials.', 'danger')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        ward_area = request.form.get('ward_area', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        if not name or not email or not password:
            flash('Please fill in all mandatory fields.', 'warning')
            return render_template('register.html', wards=PUNE_WARDS)

        if password != confirm_password:
            flash('Passwords do not match. Please re-enter.', 'danger')
            return render_template('register.html', wards=PUNE_WARDS)

        existing = query_db("SELECT id FROM users WHERE LOWER(email) = %s", (email,), one=True)
        if existing:
            flash('An account with this email already exists. Please log in.', 'info')
            return redirect(url_for('login'))

        execute_db(
            """INSERT INTO users (name, email, password_hash, role, phone, ward_area)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (name, email, hash_password(password), 'citizen', phone, ward_area)
        )

        flash('Registration successful! You can now log in with your credentials.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html', wards=PUNE_WARDS)

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out securely.', 'info')
    return redirect(url_for('index'))

# -----------------------------------------------------------------------------
# Module 2 & 3: Citizen Portal & Grievance Registration
# -----------------------------------------------------------------------------
@app.route('/citizen/dashboard')
@role_required(['citizen'])
def citizen_dashboard():
    user_id = session.get('user_id')
    user = query_db("SELECT * FROM users WHERE id = %s", (user_id,), one=True)

    complaints = query_db(
        """SELECT c.*, d.name as dept_name, cat.name as cat_name
           FROM complaints c
           JOIN departments d ON c.department_id = d.id
           JOIN complaint_categories cat ON c.category_id = cat.id
           WHERE c.citizen_id = %s
           ORDER BY c.id DESC""",
        (user_id,)
    ) or []

    resolved_count = sum(1 for c in complaints if c['status'] == 'Resolved')
    in_progress_count = sum(1 for c in complaints if c['status'] == 'In Progress')
    submitted_count = sum(1 for c in complaints if c['status'] == 'Submitted')

    return render_template(
        'citizen/dashboard.html',
        user=user,
        complaints=complaints,
        resolved_count=resolved_count,
        in_progress_count=in_progress_count,
        submitted_count=submitted_count
    )

@app.route('/complaint/new', methods=['GET', 'POST'])
@role_required(['citizen'])
def new_complaint():
    user_id = session.get('user_id')
    user = query_db("SELECT * FROM users WHERE id = %s", (user_id,), one=True)
    departments = query_db("SELECT * FROM departments WHERE is_active = 1 ORDER BY id ASC") or []

    selected_dept_id = request.args.get('dept_id', '')
    initial_categories = []
    if selected_dept_id:
        initial_categories = query_db(
            "SELECT * FROM complaint_categories WHERE department_id = %s AND is_active = 1",
            (selected_dept_id,)
        ) or []

    if request.method == 'POST':
        dept_id = request.form.get('department_id')
        cat_id = request.form.get('category_id')
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        urgency = request.form.get('urgency', 'Medium')
        ward_area = request.form.get('ward_area', '').strip()
        address_landmark = request.form.get('address_landmark', '').strip()
        latitude = request.form.get('latitude') or None
        longitude = request.form.get('longitude') or None

        # Evidence photo handler (File upload or camera base64)
        photo_file = request.files.get('photo_file')
        camera_base64 = request.form.get('camera_image_data')
        photo_url = save_uploaded_or_camera_image(photo_file, camera_base64)

        if not dept_id or not cat_id or not title or not description or not ward_area or not address_landmark:
            flash('Please complete all required fields.', 'warning')
            return render_template(
                'citizen/new_complaint.html',
                user=user,
                departments=departments,
                wards=PUNE_WARDS,
                initial_categories=initial_categories,
                selected_dept_id=int(selected_dept_id) if selected_dept_id else None
            )

        # Generate unique Pune Reference Number (e.g. CS-PUN-2026-8492)
        year = datetime.now().year
        rand_code = random.randint(1000, 9999)
        ref_no = f"CS-PUN-{year}-{rand_code}"

        # Insert Complaint
        comp_id = execute_db(
            """INSERT INTO complaints (reference_no, citizen_id, department_id, category_id,
                                       title, description, ward_area, address_landmark,
                                       latitude, longitude, urgency, photo_url, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Submitted')""",
            (ref_no, user_id, dept_id, cat_id, title, description, ward_area, address_landmark,
             latitude, longitude, urgency, photo_url)
        )

        # Insert initial Audit Trail timeline
        execute_db(
            """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks)
               VALUES (%s, %s, %s, %s, 'Submitted', %s)""",
            (comp_id, user_id, user['name'], 'Citizen', 'Grievance registered with evidence photograph and location landmark.')
        )

        flash(f'Grievance registered successfully! Your unique reference number is {ref_no}', 'success')
        return redirect(url_for('complaint_receipt', ref=ref_no))

    return render_template(
        'citizen/new_complaint.html',
        user=user,
        departments=departments,
        wards=PUNE_WARDS,
        initial_categories=initial_categories,
        selected_dept_id=int(selected_dept_id) if selected_dept_id else None
    )

@app.route('/citizen/complaint/<int:comp_id>/delete', methods=['POST'])
@role_required(['citizen'])
def delete_complaint(comp_id):
    user_id = session.get('user_id')
    comp = query_db("SELECT * FROM complaints WHERE id = %s AND citizen_id = %s", (comp_id, user_id), one=True)
    if not comp:
        flash('Complaint not found or unauthorized.', 'danger')
        return redirect(url_for('citizen_dashboard'))

    if comp['status'] != 'Submitted':
        flash('Cannot cancel a complaint that is already being investigated or resolved by the department.', 'warning')
        return redirect(url_for('citizen_dashboard'))

    execute_db("DELETE FROM complaints WHERE id = %s", (comp_id,))
    flash('Complaint has been cancelled and removed.', 'info')
    return redirect(url_for('citizen_dashboard'))

# -----------------------------------------------------------------------------
# Module 3: Tracking & Acknowledgement Receipts
# -----------------------------------------------------------------------------
@app.route('/track')
def track_complaint():
    ref_query = request.args.get('ref', '').strip()
    complaint = None
    timeline = []

    if ref_query:
        complaint = query_db(
            """SELECT c.*, d.name as dept_name, d.authority as dept_authority,
                      d.contact_email as dept_email, d.contact_phone as dept_phone,
                      d.sla_days, cat.name as cat_name, u.name as citizen_name,
                      u.email as citizen_email, u.phone as citizen_phone,
                      off.name as assigned_officer_name
               FROM complaints c
               JOIN departments d ON c.department_id = d.id
               JOIN complaint_categories cat ON c.category_id = cat.id
               JOIN users u ON c.citizen_id = u.id
               LEFT JOIN users off ON c.assigned_officer_id = off.id
               WHERE UPPER(c.reference_no) = UPPER(%s)""",
            (ref_query,),
            one=True
        )

        if complaint:
            timeline = query_db(
                "SELECT * FROM complaint_timeline WHERE complaint_id = %s ORDER BY id DESC",
                (complaint['id'],)
            ) or []

    return render_template('track.html', ref_query=ref_query, complaint=complaint, timeline=timeline)

@app.route('/receipt/<ref>')
def complaint_receipt(ref):
    complaint = query_db(
        """SELECT c.*, d.name as dept_name, d.authority as dept_authority,
                  d.contact_email as dept_email, d.contact_phone as dept_phone,
                  d.sla_days, cat.name as cat_name, u.name as citizen_name,
                  u.email as citizen_email, u.phone as citizen_phone
           FROM complaints c
           JOIN departments d ON c.department_id = d.id
           JOIN complaint_categories cat ON c.category_id = cat.id
           JOIN users u ON c.citizen_id = u.id
           WHERE UPPER(c.reference_no) = UPPER(%s)""",
        (ref,),
        one=True
    )

    if not complaint:
        flash('Complaint reference not found.', 'danger')
        return redirect(url_for('index'))

    return render_template('citizen/receipt.html', complaint=complaint)

# -----------------------------------------------------------------------------
# Module 4: Department Officer Portal
# -----------------------------------------------------------------------------
@app.route('/officer/dashboard')
@role_required(['officer'])
def officer_dashboard():
    user_id = session.get('user_id')
    officer = query_db(
        """SELECT u.*, d.name as dept_name, d.authority as dept_authority, d.sla_days
           FROM users u
           JOIN departments d ON u.department_id = d.id
           WHERE u.id = %s""",
        (user_id,),
        one=True
    )

    if not officer:
        flash('Officer department profile not found.', 'danger')
        return redirect(url_for('login'))

    dept_id = officer['department_id']
    status_filter = request.args.get('status', '').strip()

    # Query complaints for this department
    if status_filter:
        complaints = query_db(
            """SELECT c.*, cat.name as cat_name, u.name as citizen_name, u.phone as citizen_phone, u.email as citizen_email
               FROM complaints c
               JOIN complaint_categories cat ON c.category_id = cat.id
               JOIN users u ON c.citizen_id = u.id
               WHERE c.department_id = %s AND c.status = %s
               ORDER BY c.id DESC""",
            (dept_id, status_filter)
        ) or []
    else:
        complaints = query_db(
            """SELECT c.*, cat.name as cat_name, u.name as citizen_name, u.phone as citizen_phone, u.email as citizen_email
               FROM complaints c
               JOIN complaint_categories cat ON c.category_id = cat.id
               JOIN users u ON c.citizen_id = u.id
               WHERE c.department_id = %s
               ORDER BY c.id DESC""",
            (dept_id,)
        ) or []

    # Compute department queue stats
    all_dept_tickets = query_db("SELECT status FROM complaints WHERE department_id = %s", (dept_id,)) or []
    total = len(all_dept_tickets)
    submitted = sum(1 for t in all_dept_tickets if t['status'] in ['Submitted', 'Under Review'])
    in_progress = sum(1 for t in all_dept_tickets if t['status'] == 'In Progress')
    resolved = sum(1 for t in all_dept_tickets if t['status'] == 'Resolved')

    stats = {
        'total': total,
        'submitted': submitted,
        'in_progress': in_progress,
        'resolved': resolved
    }

    return render_template(
        'officer/dashboard.html',
        officer=officer,
        complaints=complaints,
        stats=stats,
        status_filter=status_filter
    )

@app.route('/officer/complaint/<int:comp_id>/update', methods=['GET', 'POST'])
@role_required(['officer'])
def officer_update_ticket(comp_id):
    user_id = session.get('user_id')
    officer = query_db("SELECT * FROM users WHERE id = %s", (user_id,), one=True)
    dept_id = officer['department_id']

    complaint = query_db(
        """SELECT c.*, d.name as dept_name, cat.name as cat_name, u.name as citizen_name,
                  u.phone as citizen_phone, u.email as citizen_email
           FROM complaints c
           JOIN departments d ON c.department_id = d.id
           JOIN complaint_categories cat ON c.category_id = cat.id
           JOIN users u ON c.citizen_id = u.id
           WHERE c.id = %s AND c.department_id = %s""",
        (comp_id, dept_id),
        one=True
    )

    if not complaint:
        flash('Complaint not found or not assigned to your department.', 'danger')
        return redirect(url_for('officer_dashboard'))

    timeline = query_db(
        "SELECT * FROM complaint_timeline WHERE complaint_id = %s ORDER BY id DESC",
        (comp_id,)
    ) or []

    if request.method == 'POST':
        new_status = request.form.get('status')
        remarks = request.form.get('remarks', '').strip()
        res_photo_file = request.files.get('resolution_photo_file')

        if not remarks:
            flash('Mandatory: Please provide official investigation or resolution remarks.', 'warning')
            return render_template('officer/update_ticket.html', complaint=complaint, timeline=timeline)

        res_photo_url = complaint['resolution_photo_url']
        if res_photo_file and res_photo_file.filename and allowed_file(res_photo_file.filename):
            res_photo_url = save_uploaded_or_camera_image(res_photo_file, None)

        resolved_at_val = datetime.now().strftime('%Y-%m-%d %H:%M:%S') if new_status == 'Resolved' else complaint['resolved_at']

        # Update Complaint
        execute_db(
            """UPDATE complaints
               SET status = %s, officer_remarks = %s, resolution_photo_url = %s,
                   assigned_officer_id = %s, resolved_at = %s, updated_at = CURRENT_TIMESTAMP
               WHERE id = %s""",
            (new_status, remarks, res_photo_url, user_id, resolved_at_val, comp_id)
        )

        # Add Timeline Entry
        execute_db(
            """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, evidence_photo)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (comp_id, user_id, officer['name'], f"Department Officer ({session.get('dept_name', 'Dept')})",
             new_status, remarks, res_photo_url)
        )

        flash(f'Ticket {complaint["reference_no"]} updated to "{new_status}" successfully.', 'success')
        return redirect(url_for('officer_dashboard'))

    return render_template('officer/update_ticket.html', complaint=complaint, timeline=timeline)

# -----------------------------------------------------------------------------
# Module 5: Administrator Portal & Reporting
# -----------------------------------------------------------------------------
@app.route('/admin/dashboard')
@role_required(['admin'])
def admin_dashboard():
    departments = query_db("SELECT * FROM departments WHERE is_active = 1") or []
    
    total = query_db("SELECT COUNT(*) as count FROM complaints", one=True)['count']
    resolved = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'", one=True)['count']
    in_progress = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'In Progress'", one=True)['count']
    under_review = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Under Review'", one=True)['count']
    submitted = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Submitted'", one=True)['count']
    rejected = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Rejected'", one=True)['count']

    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

    stats = {
        'total': total,
        'resolved': resolved,
        'in_progress': in_progress,
        'under_review': under_review,
        'submitted': submitted,
        'rejected': rejected,
        'resolution_rate': resolution_rate
    }

    # Department Chart Data
    dept_stats = query_db(
        """SELECT d.name, COUNT(c.id) as count
           FROM departments d
           LEFT JOIN complaints c ON d.id = c.department_id
           GROUP BY d.id
           ORDER BY count DESC
           LIMIT 8"""
    ) or []

    chart_dept_labels = [row['name'][:18] for row in dept_stats]
    chart_dept_counts = [row['count'] for row in dept_stats]

    recent_complaints = query_db(
        """SELECT c.*, d.name as dept_name, cat.name as cat_name, u.name as citizen_name
           FROM complaints c
           JOIN departments d ON c.department_id = d.id
           JOIN complaint_categories cat ON c.category_id = cat.id
           JOIN users u ON c.citizen_id = u.id
           ORDER BY c.id DESC
           LIMIT 6"""
    ) or []

    return render_template(
        'admin/dashboard.html',
        stats=stats,
        recent_complaints=recent_complaints,
        chart_dept_labels=chart_dept_labels,
        chart_dept_counts=chart_dept_counts
    )

@app.route('/admin/complaints')
@role_required(['admin'])
def admin_complaints():
    departments = query_db("SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC") or []
    
    selected_dept_id = request.args.get('dept_id', '')
    selected_status = request.args.get('status', '')
    selected_ward = request.args.get('ward', '')

    query = """
        SELECT c.*, d.name as dept_name, cat.name as cat_name,
               u.name as citizen_name, u.phone as citizen_phone, u.email as citizen_email
        FROM complaints c
        JOIN departments d ON c.department_id = d.id
        JOIN complaint_categories cat ON c.category_id = cat.id
        JOIN users u ON c.citizen_id = u.id
        WHERE 1=1
    """
    params = []

    if selected_dept_id:
        query += " AND c.department_id = %s"
        params.append(selected_dept_id)
    if selected_status:
        query += " AND c.status = %s"
        params.append(selected_status)
    if selected_ward:
        query += " AND c.ward_area = %s"
        params.append(selected_ward)

    query += " ORDER BY c.id DESC"
    complaints = query_db(query, tuple(params)) or []

    return render_template(
        'admin/complaints.html',
        complaints=complaints,
        departments=departments,
        wards=PUNE_WARDS,
        selected_dept_id=selected_dept_id,
        selected_status=selected_status,
        selected_ward=selected_ward
    )

@app.route('/admin/complaint/<int:comp_id>/reassign', methods=['POST'])
@role_required(['admin'])
def admin_reassign_complaint(comp_id):
    new_dept_id = request.form.get('new_department_id')
    remarks = request.form.get('reassign_remarks', '').strip()
    admin_id = session.get('user_id')

    comp = query_db("SELECT * FROM complaints WHERE id = %s", (comp_id,), one=True)
    new_dept = query_db("SELECT name FROM departments WHERE id = %s", (new_dept_id,), one=True)

    if comp and new_dept:
        # Fetch first category of the new department as fallback
        new_cat = query_db("SELECT id FROM complaint_categories WHERE department_id = %s LIMIT 1", (new_dept_id,), one=True)
        cat_id = new_cat['id'] if new_cat else comp['category_id']

        execute_db(
            """UPDATE complaints
               SET department_id = %s, category_id = %s, assigned_officer_id = NULL,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = %s""",
            (new_dept_id, cat_id, comp_id)
        )

        admin_note = f"Reassigned by Central Administrator to {new_dept['name']}. Note: {remarks}"
        execute_db(
            """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks)
               VALUES (%s, %s, %s, 'Central Administrator', %s, %s)""",
            (comp_id, admin_id, session.get('user_name', 'Administrator'), comp['status'], admin_note)
        )

        flash(f"Complaint {comp['reference_no']} successfully transferred to {new_dept['name']}.", 'success')

    return redirect(url_for('admin_complaints'))

@app.route('/admin/departments')
@role_required(['admin'])
def admin_departments():
    departments = query_db(
        """SELECT d.*, COUNT(c.id) as total_complaints
           FROM departments d
           LEFT JOIN complaints c ON d.id = c.department_id
           GROUP BY d.id
           ORDER BY d.id ASC"""
    ) or []
    return render_template('admin/departments.html', departments=departments)

@app.route('/admin/officers')
@role_required(['admin'])
def admin_officers():
    departments = query_db("SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC") or []
    officers = query_db(
        """SELECT u.*, d.name as dept_name, d.authority as dept_authority
           FROM users u
           LEFT JOIN departments d ON u.department_id = d.id
           WHERE u.role = 'officer'
           ORDER BY u.id DESC"""
    ) or []
    return render_template('admin/officers.html', officers=officers, departments=departments, wards=PUNE_WARDS)

@app.route('/admin/officers/create', methods=['POST'])
@role_required(['admin'])
def admin_create_officer():
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip().lower()
    department_id = request.form.get('department_id')
    official_id = request.form.get('official_id', '').strip()
    designation = request.form.get('designation', '').strip()
    ward_area = request.form.get('ward_area', '').strip()
    password = request.form.get('password', 'pune123')

    if not name or not email or not department_id or not official_id:
        flash('Please fill in all mandatory officer fields.', 'warning')
        return redirect(url_for('admin_officers'))

    existing = query_db("SELECT id FROM users WHERE LOWER(email) = %s", (email,), one=True)
    if existing:
        flash('An officer with this email already exists.', 'danger')
        return redirect(url_for('admin_officers'))

    execute_db(
        """INSERT INTO users (name, email, password_hash, role, department_id, official_id, designation, ward_area)
           VALUES (%s, %s, %s, 'officer', %s, %s, %s, %s)""",
        (name, email, hash_password(password), department_id, official_id, designation, ward_area)
    )

    flash(f"Officer profile for '{name}' created successfully.", 'success')
    return redirect(url_for('admin_officers'))

@app.route('/admin/reports')
@role_required(['admin'])
def admin_reports():
    departments = query_db("SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC") or []
    
    selected_dept_id = request.args.get('dept_id', '')
    selected_status = request.args.get('status', '')
    selected_ward = request.args.get('ward', '')

    query = """
        SELECT c.*, d.name as dept_name, d.authority as dept_authority, cat.name as cat_name
        FROM complaints c
        JOIN departments d ON c.department_id = d.id
        JOIN complaint_categories cat ON c.category_id = cat.id
        WHERE 1=1
    """
    params = []
    if selected_dept_id:
        query += " AND c.department_id = %s"
        params.append(selected_dept_id)
    if selected_status:
        query += " AND c.status = %s"
        params.append(selected_status)
    if selected_ward:
        query += " AND c.ward_area = %s"
        params.append(selected_ward)

    query += " ORDER BY c.id DESC"
    reports = query_db(query, tuple(params)) or []

    resolved_count = sum(1 for r in reports if r['status'] == 'Resolved')
    pending_count = len(reports) - resolved_count
    resolution_percentage = round((resolved_count / len(reports) * 100), 1) if reports else 0

    return render_template(
        'admin/reports.html',
        reports=reports,
        departments=departments,
        wards=PUNE_WARDS,
        selected_dept_id=selected_dept_id,
        selected_status=selected_status,
        selected_ward=selected_ward,
        resolved_count=resolved_count,
        pending_count=pending_count,
        resolution_percentage=resolution_percentage,
        current_time=datetime.now().strftime('%d %B %Y, %I:%M %p')
    )

# -----------------------------------------------------------------------------
# REST API Endpoints
# -----------------------------------------------------------------------------
@app.route('/api/departments/<int:dept_id>/categories')
def api_department_categories(dept_id):
    categories = query_db(
        "SELECT id, name, default_urgency FROM complaint_categories WHERE department_id = %s AND is_active = 1",
        (dept_id,)
    ) or []
    return jsonify({'categories': categories})

@app.route('/api/stats')
def api_stats():
    total = query_db("SELECT COUNT(*) as count FROM complaints", one=True)['count']
    resolved = query_db("SELECT COUNT(*) as count FROM complaints WHERE status = 'Resolved'", one=True)['count']
    return jsonify({'total': total, 'resolved': resolved})

# -----------------------------------------------------------------------------
# Application Startup & Initialization
# -----------------------------------------------------------------------------
if __name__ == '__main__':
    # Initialize and seed if not already done
    seed_database()
    port = int(os.environ.get('PORT', 5000))
    print(f"\n=======================================================")
    print(f" CivicSaathi - Pune City Grievance Redressal Portal")
    print(f" Running at: http://127.0.0.1:{port}")
    print(f" Citizen Demo: rajesh.patil@gmail.com / pune123")
    print(f" Officer Demo: officer.roads@pmc.gov.in / pune123")
    print(f" Admin Demo:   admin@civicsaathi.pune.gov.in / admin123")
    print(f"=======================================================\n")
    app.run(host='0.0.0.0', port=port, debug=True)
