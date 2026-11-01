from database import init_db, query_db, execute_db, hash_password

PUNE_DEPARTMENTS = [
    {
        "code": "PMC_ROADS",
        "name": "PMC - Road and Infrastructure Department",
        "authority": "Pune Municipal Corporation",
        "description": "Maintenance of city roads, pothole repairs, asphalt resurfacing, footpaths, and pedestrian crossings across Pune municipal wards.",
        "contact_email": "roads@punecorporation.org",
        "contact_phone": "020-25501000",
        "sla_days": 5,
        "icon": "fa-road",
        "categories": [
            ("Road Potholes", "Hazardous potholes and broken asphalt surface on arterial and internal ward roads.", "High"),
            ("Damaged Roads", "Structural pavement failures, deep cracks, and missing top bitumen layers.", "High"),
            ("Footpath Damage", "Broken interlocking tiles, unpaved pedestrian walkways, or missing covers.", "Medium"),
            ("Road Maintenance", "Need for resurfacing, speed breaker painting, or curb restoration.", "Medium"),
            ("Damaged Public Infrastructure", "Broken road dividers, missing safety railings, or collapsed guard rails.", "High")
        ]
    },
    {
        "code": "PMC_WASTE",
        "name": "PMC - Solid Waste Management Department",
        "authority": "Pune Municipal Corporation",
        "description": "Door-to-door garbage collection, community dustbin management, road sweeping, and zero-garbage drives in Pune City.",
        "contact_email": "swm@punecorporation.org",
        "contact_phone": "020-25501234",
        "sla_days": 3,
        "icon": "fa-trash-can",
        "categories": [
            ("Garbage Accumulation", "Unattended municipal dump piles overflowing near residential areas.", "High"),
            ("Irregular Garbage Collection", "Garbage collection ghantagadi vehicle skipping scheduled pickups.", "Medium"),
            ("Overflowing Dustbins", "Public roadside containers spilling onto road and attracting strays.", "High"),
            ("Illegal Garbage Dumping", "Construction debris or commercial food waste dumped openly on vacant plots.", "Medium"),
            ("Public Cleanliness Issues", "Littering in public marketplaces, bus stands, and road corners.", "Medium")
        ]
    },
    {
        "code": "PMC_WATER",
        "name": "PMC - Water Supply Department",
        "authority": "Pune Municipal Corporation",
        "description": "Potable drinking water treatment, distribution pipelines, water pressure regulation, and pipeline repairs from Khadakwasla & Parvati plants.",
        "contact_email": "water@punecorporation.org",
        "contact_phone": "020-25501111",
        "sla_days": 4,
        "icon": "fa-faucet-drip",
        "categories": [
            ("Water Leakage", "Main feeder or distribution pipe burst causing drinking water gushing on road.", "High"),
            ("Irregular Water Supply", "Scheduled water supply not provided for over 24-48 hours.", "Critical"),
            ("Low Water Pressure", "Insufficient water head reaching domestic overhead/underground tanks.", "Medium"),
            ("Water Wastage", "Public tap left flowing continuously or valve leakage.", "Medium"),
            ("Damaged Public Water Pipelines", "Broken valve chambers, rusted pipes, or contaminated water mixing.", "High")
        ]
    },
    {
        "code": "PMC_DRAINAGE",
        "name": "PMC - Drainage and Sewerage Department",
        "authority": "Pune Municipal Corporation",
        "description": "Underground sewerage network, chamber de-silting, storm-water drainage maintenance, and anti-waterlogging measures.",
        "contact_email": "drainage@punecorporation.org",
        "contact_phone": "020-25501333",
        "sla_days": 4,
        "icon": "fa-water",
        "categories": [
            ("Blocked Drainage", "Clogged underground drainage causing foul water backflow.", "High"),
            ("Overflowing Sewage", "Manhole chambers overflowing on roads posing serious health hazards.", "Critical"),
            ("Damaged Drainage Systems", "Broken or missing manhole covers risking pedestrian and vehicle accidents.", "Critical"),
            ("Waterlogging Caused by Drainage Issues", "Monsoon storm drain blockages resulting in knee-deep water on roads.", "High")
        ]
    },
    {
        "code": "PMC_LIGHTS",
        "name": "PMC - Streetlight and Electrical Maintenance",
        "authority": "Pune Municipal Corporation",
        "description": "Installation and maintenance of LED streetlights, automated switching timers, high-mast lamps, and municipal electric poles.",
        "contact_email": "streetlights@punecorporation.org",
        "contact_phone": "020-25501444",
        "sla_days": 3,
        "icon": "fa-lightbulb",
        "categories": [
            ("Non-functional Streetlights", "Complete dark stretch of streetlights creating safety hazards at night.", "High"),
            ("Damaged Public Lighting", "Broken light fixtures, hanging LED panels, or damaged lamp heads.", "Medium"),
            ("Exposed Public Electrical Infrastructure", "Open junction boxes or hanging cables on PMC lamp posts.", "Critical")
        ]
    },
    {
        "code": "PMC_GARDENS",
        "name": "PMC - Garden and Public Spaces Department",
        "authority": "Pune Municipal Corporation",
        "description": "Maintenance of PMC public parks, botanical gardens, children's play parks, jogging tracks, and roadside tree trimming.",
        "contact_email": "gardens@punecorporation.org",
        "contact_phone": "020-25501555",
        "sla_days": 7,
        "icon": "fa-tree",
        "categories": [
            ("Damaged Public Gardens", "Overgrown weeds, broken fences, dried lawns, or unmaintained greenery.", "Low"),
            ("Poor Maintenance of Public Parks", "Broken benches, lack of watering, or unsanitary littering inside parks.", "Medium"),
            ("Damaged Playground Facilities", "Rusted swings, broken slides, and unsafe play equipment for children.", "Medium")
        ]
    },
    {
        "code": "PMC_HEALTH",
        "name": "PMC - Public Health and Sanitation",
        "authority": "Pune Municipal Corporation",
        "description": "Vector control (mosquito fogging), sanitary inspections, public toilet maintenance, and epidemic prevention across Pune.",
        "contact_email": "health@punecorporation.org",
        "contact_phone": "020-25501666",
        "sla_days": 4,
        "icon": "fa-shield-virus",
        "categories": [
            ("Unclean Public Areas", "Accumulation of filth, uncleaned public urinals, and foul smell.", "High"),
            ("Mosquito Breeding Locations", "Stagnant water bodies causing dengue/malaria outbreak risks.", "High"),
            ("Public Sanitation Problems", "Non-functional public toilets, missing doors, or zero water supply in toilets.", "High")
        ]
    },
    {
        "code": "PMC_ENCROACHMENT",
        "name": "PMC - Encroachment and Public Property",
        "authority": "Pune Municipal Corporation",
        "description": "Removal of illegal hawking, unauthorized roadside stalls, illegal structures on public rights of way, and footpath blockades.",
        "contact_email": "encroachment@punecorporation.org",
        "contact_phone": "020-25501777",
        "sla_days": 7,
        "icon": "fa-person-booth",
        "categories": [
            ("Unauthorized Occupation of Public Spaces", "Illegal permanent structures built on municipal land.", "Medium"),
            ("Obstructions on Public Footpaths", "Hawkers, kiosks, or private merchandise completely blocking pedestrians.", "Medium"),
            ("Unauthorized Public-Space Encroachments", "Illegal parking sheds, barriers, or fences erected on public streets.", "Medium")
        ]
    },
    {
        "code": "PUNE_TRAFFIC",
        "name": "Pune Police and Traffic Police",
        "authority": "Pune Police Commissionerate",
        "description": "Traffic flow management, signal synchronization, anti-congestion drives, illegal parking control, and road safety enforcement.",
        "contact_email": "traffic.pune@mahapolice.gov.in",
        "contact_phone": "020-26123300",
        "sla_days": 3,
        "icon": "fa-traffic-light",
        "categories": [
            ("Traffic Signal Malfunction", "Traffic signal lights blinking red/green or completely turned off.", "Critical"),
            ("Traffic Congestion-Related Reporting", "Severe gridlock caused by ill-managed bottlenecks or uncoordinated diversions.", "High"),
            ("Illegal Parking", "Double parking, heavy trucks parked on narrow roads blocking traffic movement.", "Medium"),
            ("Road Obstructions", "Abandoned vehicles or construction materials blocking active traffic lanes.", "High"),
            ("Damaged Traffic Signs", "Missing speed limit, one-way, or no-entry road signage.", "Low"),
            ("Public Traffic-Safety Concerns", "Blind corners lacking convex mirrors or unpainted zebra crossings.", "Medium"),
            ("Non-Emergency Public Safety", "General traffic violations and pedestrian crossing hazards.", "Medium")
        ]
    },
    {
        "code": "MSEDCL",
        "name": "Maharashtra State Electricity Distribution Co. (MSEDCL)",
        "authority": "Government of Maharashtra (Mahavitaran)",
        "description": "Power transmission, consumer electricity distribution, sub-station maintenance, transformer upkeep, and electric billing in Pune.",
        "contact_email": "support@mahadiscom.in",
        "contact_phone": "1912 / 1800-233-3435",
        "sla_days": 2,
        "icon": "fa-bolt",
        "categories": [
            ("Electricity Supply Interruptions", "Unannounced power outages and recurring voltage fluctuations.", "High"),
            ("Damaged Electricity Poles", "Tilted electric poles, bent cement masts after vehicle collisions.", "Critical"),
            ("Exposed Electrical Wires", "Loose high-tension or low-tension power cables hanging low.", "Critical"),
            ("Street-Level Electrical Safety Issues", "Open feeder pillars or sparkling street transformers.", "Critical"),
            ("Meter-Related Complaints", "Burnt energy meters or sparking service line cables.", "Medium"),
            ("Electricity Infrastructure Problems", "Oil leakage from distribution transformers or overgrown tree branches on wires.", "High")
        ]
    },
    {
        "code": "PMPML",
        "name": "PMPML – Pune Mahanagar Parivahan Mahamandal Ltd.",
        "authority": "PMPML Pune & Pimpri-Chinchwad",
        "description": "Public bus transportation network operating across Pune, Pimpri-Chinchwad, and PMRDA fringe areas.",
        "contact_email": "grievance@pmpml.org",
        "contact_phone": "020-24503355",
        "sla_days": 5,
        "icon": "fa-bus",
        "categories": [
            ("Bus Service-Related Problems", "Irregular bus frequency, skipping stops, or sudden cancellation of trips.", "Medium"),
            ("Bus Stop Maintenance", "Broken bus shelter glass, missing schedule boards, or collapsed shelter roofs.", "Medium"),
            ("Damaged Bus-Stop Facilities", "Broken passenger seating, missing route maps, or unlit shelters.", "Low"),
            ("Bus Cleanliness", "Unsanitary bus interiors, dusty seats, or broken windows on city buses.", "Low"),
            ("Public Transport Service Complaints", "Rash driving by bus captains or rude staff behavior.", "Medium"),
            ("Passenger Facility-Related Issues", "Ticket machine failures or issues with e-pass validation.", "Medium")
        ]
    },
    {
        "code": "PUNE_RTO",
        "name": "Pune Regional Transport Office (RTO)",
        "authority": "Transport Department, Govt of Maharashtra",
        "description": "Vehicle registration (MH-12 Pune Central & MH-14 PCMC), auto-rickshaw fare regulation, and public carrier fitness certification.",
        "contact_email": "rto.pune@mahatransco.in",
        "contact_phone": "020-26058080",
        "sla_days": 7,
        "icon": "fa-id-card",
        "categories": [
            ("RTO Service-Related Complaints", "Delays in document verification, vehicle transfer, or fitness inspection.", "Medium"),
            ("Public Transport Permit Concerns", "Overcharging or refusal to ply by auto-rickshaws at Pune stations.", "Medium"),
            ("Road Transport Service Issues", "Overloaded private buses or unauthorized commercial stage carriages.", "High"),
            ("Transport Administrative Grievances", "Discrepancies in Sarathi/Vahan portal records.", "Low")
        ]
    },
    {
        "code": "MPCB_PUNE",
        "name": "Maharashtra Pollution Control Board (MPCB)",
        "authority": "Environment Dept, Govt of Maharashtra",
        "description": "Environmental monitoring, industrial effluent control, ambient air quality monitoring, and noise abatement in Pune Region.",
        "contact_email": "ropune@mpcb.gov.in",
        "contact_phone": "020-25811694",
        "sla_days": 7,
        "icon": "fa-smog",
        "categories": [
            ("Air Pollution", "Toxic smoke emission from industrial clusters in Hadapsar or Bhosari.", "High"),
            ("Noise Pollution", "Illegal use of sound systems/generators past permitted nighttime decibel limits.", "Medium"),
            ("Water Pollution", "Untreated chemical effluents discharged into Mula-Mutha river streams.", "Critical"),
            ("Industrial Pollution", "Air particulate and hazardous chemical odors from chemical/foundry units.", "High"),
            ("Improper Waste Disposal", "Open burning of toxic rubber, plastic tyres, or industrial refuse.", "High"),
            ("Environmental Concerns", "Destruction of hill slopes, illegal quarrying, or wetland encroachment.", "Medium")
        ]
    },
    {
        "code": "MAHA_PWD",
        "name": "Maharashtra Public Works Department (PWD)",
        "authority": "Govt of Maharashtra (Pune Circle)",
        "description": "Construction and maintenance of State Highways, Major District Roads, and Pune Government Administrative Complexes.",
        "contact_email": "ee.pune@mahapwd.com",
        "contact_phone": "020-26122224",
        "sla_days": 7,
        "icon": "fa-trowel-bricks",
        "categories": [
            ("Public Road Maintenance Issues", "Potholes and culvert damage on Pune-Saswad or Pune-Paud State Highway stretches.", "High"),
            ("Damaged Government Infrastructure", "Structural damage to government hospital wings or revenue offices.", "Medium"),
            ("Public Building Maintenance Concerns", "Water seepage, cracked plaster, or damaged lifts in government complexes.", "Medium"),
            ("Infrastructure-Related Problems", "Unfinished flyover approaches, missing highway guard barriers.", "High")
        ]
    },
    {
        "code": "MAHA_METRO",
        "name": "Pune Metro / MahaMetro",
        "authority": "Maharashtra Metro Rail Corporation Ltd.",
        "description": "Operation, passenger amenities, hygiene, security, and infrastructure of the Pune Metro rail transit system (Vanaz-Ramwadi & PCMC-Swargate lines).",
        "contact_email": "helpdesk@punemetrorail.org",
        "contact_phone": "1800-270-5555",
        "sla_days": 3,
        "icon": "fa-train-subway",
        "categories": [
            ("Metro Station Facilities", "Non-functional escalators, elevators, or ticket vending machines (TVM).", "Medium"),
            ("Passenger Facilities", "Missing signage, non-functional drinking water taps, or faulty AFC entry gates.", "Medium"),
            ("Cleanliness", "Litter on metro platforms, uncleaned concourses, or unwashed train coach windows.", "Low"),
            ("Infrastructure Maintenance", "Water leakage from elevated viaduct joints onto roads below.", "High"),
            ("Public Transport Service Concerns", "Metro train schedule delays or platform crowd safety management.", "Medium")
        ]
    }
]

PUNE_WARDS = [
    "Kothrud - Bavdhan",
    "Shivajinagar - Ghole Road",
    "Kasba - Vishrambaug Wada",
    "Aundh - Baner - Balewadi",
    "Hadapsar - Mundhwa",
    "Viman Nagar - Nagar Road",
    "Sinhagad Road - Dhayari",
    "Bibwewadi - Sahakar Nagar",
    "Swargate - Parvati",
    "Deccan Gymkhana - FC Road",
    "Katraj - Kondhwa",
    "Yerawada - Kalas - Dhanori",
    "Koregaon Park - Pune Cantonment (Camp)",
    "Warje - Karve Nagar",
    "Pimpri - Chinchwad - Nigdi",
    "Hinjawadi IT Park",
    "Wagholi - Kharadi"
]

def seed_database():
    """Initializes and seeds default data into CivicSaathi database."""
    init_db()

    # Check if departments already exist
    existing_depts = query_db("SELECT COUNT(*) as count FROM departments", one=True)
    if existing_depts and existing_depts['count'] > 0:
        print("[Seed] Database already contains records. Skipping seed.")
        return

    print("[Seed] Seeding Pune Departments and Categories...")
    for dept in PUNE_DEPARTMENTS:
        dept_id = execute_db(
            """INSERT INTO departments (code, name, authority, description, contact_email, contact_phone, sla_days, icon)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (dept["code"], dept["name"], dept["authority"], dept["description"],
             dept["contact_email"], dept["contact_phone"], dept["sla_days"], dept["icon"])
        )
        for cat_name, cat_desc, urgency in dept["categories"]:
            execute_db(
                """INSERT INTO complaint_categories (department_id, name, description, default_urgency)
                   VALUES (%s, %s, %s, %s)""",
                (dept_id, cat_name, cat_desc, urgency)
            )

    print("[Seed] Seeding Default Users (Citizens, Officers, Admin)...")
    
    # 1. Administrator
    admin_id = execute_db(
        """INSERT INTO users (name, email, password_hash, role, phone, ward_area, designation, official_id)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        ("Pune Central Grievance Redressal Administrator",
         "admin@civicsaathi.pune.gov.in",
         hash_password("admin123"),
         "admin",
         "020-25501999",
         "Shivajinagar - Ghole Road",
         "Chief Public Grievance Officer",
         "PUN-ADM-001")
    )

    # 2. Key Department Officers
    officers = [
        ("Er. Amit Kulkarni", "officer.roads@pmc.gov.in", "PMC_ROADS", "Executive Engineer - Road Infrastructure", "PMC-RD-402", "Kothrud - Bavdhan"),
        ("Er. Sunita Shinde", "officer.waste@pmc.gov.in", "PMC_WASTE", "Divisional Sanitation Superintendent", "PMC-SWM-118", "Shivajinagar - Ghole Road"),
        ("Er. Prashant Joshi", "officer.water@pmc.gov.in", "PMC_WATER", "Superintending Water Works Engineer", "PMC-WT-209", "Swargate - Parvati"),
        ("Er. Sandeep Patil", "officer.drainage@pmc.gov.in", "PMC_DRAINAGE", "Assistant Drainage Engineer", "PMC-DR-305", "Hadapsar - Mundhwa"),
        ("Er. Vikas Deshmukh", "officer.lights@pmc.gov.in", "PMC_LIGHTS", "Junior Electrical Maintenance Officer", "PMC-EL-512", "Aundh - Baner - Balewadi"),
        ("Insp. Sachin More", "officer.traffic@punepolice.gov.in", "PUNE_TRAFFIC", "Police Inspector - Traffic Branch", "PTP-INSP-88", "Deccan Gymkhana - FC Road"),
        ("Er. Nitin Jadhav", "officer.msedcl@mahadiscom.in", "MSEDCL", "Assistant Engineer (Urban Circle)", "MSEDCL-AE-701", "Viman Nagar - Nagar Road"),
        ("Rahul Gaikwad", "officer.pmpml@pmpml.org", "PMPML", "Depot Operations Manager", "PMPML-DM-14", "Swargate - Parvati"),
        ("Sunil Chhajed", "officer.metro@punemetrorail.org", "MAHA_METRO", "Station Operations Incharge", "MMR-SO-33", "Kothrud - Bavdhan"),
        ("Dr. Aniket Mane", "officer.mpcb@mpcb.gov.in", "MPCB_PUNE", "Field Environmental Scientist", "MPCB-SCI-19", "Shivajinagar - Ghole Road"),
    ]

    for name, email, code, desg, off_id, ward in officers:
        dept = query_db("SELECT id FROM departments WHERE code = %s", (code,), one=True)
        if dept:
            execute_db(
                """INSERT INTO users (name, email, password_hash, role, phone, ward_area, department_id, designation, official_id)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (name, email, hash_password("pune123"), "officer", "020-25501100", ward, dept["id"], desg, off_id)
            )

    # 3. Citizens
    citizens = [
        ("Rajesh Patil", "rajesh.patil@gmail.com", "pune123", "+91 98220 11223", "Kothrud - Bavdhan"),
        ("Priya Deshmukh", "priya.deshmukh@gmail.com", "pune123", "+91 98231 44556", "Shivajinagar - Ghole Road"),
        ("Karan Mehta", "karan.mehta@gmail.com", "pune123", "+91 98901 88776", "Viman Nagar - Nagar Road"),
        ("Anjali Kadam", "anjali.kadam@gmail.com", "pune123", "+91 97654 32100", "Aundh - Baner - Balewadi")
    ]

    citizen_ids = []
    for name, email, pwd, phone, ward in citizens:
        c_id = execute_db(
            """INSERT INTO users (name, email, password_hash, role, phone, ward_area)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (name, email, hash_password(pwd), "citizen", phone, ward)
        )
        citizen_ids.append(c_id)

    print("[Seed] Seeding Realistic Pune Sample Grievances & Status Lifecycles...")

    # Fetch IDs
    pmc_roads = query_db("SELECT id FROM departments WHERE code = 'PMC_ROADS'", one=True)['id']
    pmc_water = query_db("SELECT id FROM departments WHERE code = 'PMC_WATER'", one=True)['id']
    pmc_waste = query_db("SELECT id FROM departments WHERE code = 'PMC_WASTE'", one=True)['id']
    pune_traffic = query_db("SELECT id FROM departments WHERE code = 'PUNE_TRAFFIC'", one=True)['id']
    msedcl = query_db("SELECT id FROM departments WHERE code = 'MSEDCL'", one=True)['id']

    cat_pothole = query_db("SELECT id FROM complaint_categories WHERE department_id = %s LIMIT 1", (pmc_roads,), one=True)['id']
    cat_water = query_db("SELECT id FROM complaint_categories WHERE department_id = %s LIMIT 1", (pmc_water,), one=True)['id']
    cat_garbage = query_db("SELECT id FROM complaint_categories WHERE department_id = %s LIMIT 1", (pmc_waste,), one=True)['id']
    cat_traffic = query_db("SELECT id FROM complaint_categories WHERE department_id = %s LIMIT 1", (pune_traffic,), one=True)['id']
    cat_power = query_db("SELECT id FROM complaint_categories WHERE department_id = %s LIMIT 1", (msedcl,), one=True)['id']

    off_roads = query_db("SELECT id, name FROM users WHERE email = 'officer.roads@pmc.gov.in'", one=True)
    off_water = query_db("SELECT id, name FROM users WHERE email = 'officer.water@pmc.gov.in'", one=True)
    off_waste = query_db("SELECT id, name FROM users WHERE email = 'officer.waste@pmc.gov.in'", one=True)

    # 1. Road Pothole in Kothrud (In Progress)
    comp1_id = execute_db(
        """INSERT INTO complaints (reference_no, citizen_id, department_id, category_id, title, description,
                                   ward_area, address_landmark, latitude, longitude, urgency, photo_url,
                                   status, assigned_officer_id, officer_remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, datetime('now', '-3 days'))""",
        ("CS-PUN-2026-1042", citizen_ids[0], pmc_roads, cat_pothole,
         "Severe crater pothole near Karve Statue chowk",
         "Deep 1.5 meter wide crater created after heavy downpour. Two-wheelers frequently skidding during evening rush hour.",
         "Kothrud - Bavdhan", "Near Karve Putala, Opposite McDonald's, Karve Road, Kothrud",
         18.5028, 73.8180, "High", "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
         "In Progress", off_roads['id'], "Site inspected by Junior Engineer. Asphalt cold-mix road patch crew dispatched with compactor roller.")
    )

    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-3 days'))""",
        (comp1_id, citizen_ids[0], "Rajesh Patil", "Citizen", "Submitted", "Grievance registered with photographs and location details.")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-2 days'))""",
        (comp1_id, off_roads['id'], off_roads['name'], "Department Officer", "Under Review", "Case assigned to Kothrud Ward Maintenance Division.")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-1 days'))""",
        (comp1_id, off_roads['id'], off_roads['name'], "Department Officer", "In Progress", "Site inspected by Junior Engineer. Asphalt cold-mix road patch crew dispatched with compactor roller.")
    )

    # 2. Main Water Line Leakage in Swargate (Resolved)
    comp2_id = execute_db(
        """INSERT INTO complaints (reference_no, citizen_id, department_id, category_id, title, description,
                                   ward_area, address_landmark, latitude, longitude, urgency, photo_url,
                                   resolution_photo_url, status, assigned_officer_id, officer_remarks, resolved_at, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, datetime('now', '-4 hours'), datetime('now', '-2 days'))""",
        ("CS-PUN-2026-1088", citizen_ids[1], pmc_water, cat_water,
         "Major drinking water pipeline rupture flooding bus station road",
         "High pressure municipal potable water spurting 2 feet high across the pavement, resulting in lakhs of litres of pure water wastage.",
         "Swargate - Parvati", "Opposite Jedhe Chowk, Behind PMPML Central Bus Depot, Swargate",
         18.5018, 73.8587, "High", "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80",
         "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
         "Resolved", off_water['id'], "Main 300mm cast iron pipe clamp welded, pressure testing completed, and road restoration done successfully.")
    )

    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-2 days'))""",
        (comp2_id, citizen_ids[1], "Priya Deshmukh", "Citizen", "Submitted", "Water pipeline burst reported with live photographic evidence.")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-1 days'))""",
        (comp2_id, off_water['id'], off_water['name'], "Department Officer", "In Progress", "Water valve isolated. PMC hydraulic maintenance squad deployed on site.")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-4 hours'))""",
        (comp2_id, off_water['id'], off_water['name'], "Department Officer", "Resolved", "Main 300mm cast iron pipe clamp welded, pressure testing completed, and road restoration done successfully.")
    )

    # 3. Overflowing Garbage in FC Road (Submitted)
    comp3_id = execute_db(
        """INSERT INTO complaints (reference_no, citizen_id, department_id, category_id, title, description,
                                   ward_area, address_landmark, latitude, longitude, urgency, photo_url,
                                   status, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, datetime('now', '-6 hours'))""",
        ("CS-PUN-2026-1125", citizen_ids[2], pmc_waste, cat_garbage,
         "Massive garbage heap overflowing onto pedestrian footpath",
         "Community garbage dumpsters have not been cleared for past three days. Foul stench spreading near commercial food stalls and coaching classes.",
         "Deccan Gymkhana - FC Road", "Fergusson College Road, Lane 4 corner near Vaishali Hotel",
         18.5204, 73.8431, "Medium", "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
         "Submitted")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-6 hours'))""",
        (comp3_id, citizen_ids[2], "Karan Mehta", "Citizen", "Submitted", "New complaint lodged by citizen online.")
    )

    # 4. Traffic Signal Failure at Viman Nagar Chowk (Under Review)
    comp4_id = execute_db(
        """INSERT INTO complaints (reference_no, citizen_id, department_id, category_id, title, description,
                                   ward_area, address_landmark, latitude, longitude, urgency, photo_url,
                                   status, assigned_officer_id, officer_remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, datetime('now', '-1 days'))""",
        ("CS-PUN-2026-1140", citizen_ids[2], pune_traffic, cat_traffic,
         "Traffic lights completely dark during morning rush hour",
         "Automated signals at Phoenix Market City junction turned off. Heavy airport traffic and office commuters caught in gridlock without traffic warden.",
         "Viman Nagar - Nagar Road", "Phoenix Marketcity Junction, Nagar Road, Viman Nagar",
         18.5621, 73.9168, "Critical", "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80",
         "Under Review", None, "Forwarded to Pune Traffic Police Control Room. Duty Constable assigned to direct manual traffic.")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-1 days'))""",
        (comp4_id, citizen_ids[2], "Karan Mehta", "Citizen", "Submitted", "Complaint registered.")
    )

    # 5. Low Hanging Wire in Baner (Rejected - duplicate)
    comp5_id = execute_db(
        """INSERT INTO complaints (reference_no, citizen_id, department_id, category_id, title, description,
                                   ward_area, address_landmark, latitude, longitude, urgency, photo_url,
                                   status, rejection_reason, officer_remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, datetime('now', '-5 days'))""",
        ("CS-PUN-2026-0980", citizen_ids[3], msedcl, cat_power,
         "Low hanging internet cable mistaken for power line",
         "Citizen reported black cables hanging low across building gate.",
         "Aundh - Baner - Balewadi", "Near Balewadi High Street, Baner Road",
         18.5590, 73.7868, "Low", None,
         "Rejected", "Inspected by MSEDCL line staff. The wires belong to private fiber internet provider and carry no electrical current.",
         "Grievance closed as non-MSEDCL jurisdiction; forwarded to PMC Telecom Infrastructure cell.")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-5 days'))""",
        (comp5_id, citizen_ids[3], "Anjali Kadam", "Citizen", "Submitted", "Report filed.")
    )
    execute_db(
        """INSERT INTO complaint_timeline (complaint_id, actor_id, actor_name, actor_role, status, remarks, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, datetime('now', '-4 days'))""",
        (comp5_id, admin_id, "Administrator", "Admin", "Rejected", "Inspected by MSEDCL line staff. Private fiber internet wire, not electrical.")
    )

    print("[Seed] Seed completed successfully with realistic Pune municipal data!")

if __name__ == '__main__':
    seed_database()
