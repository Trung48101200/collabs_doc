const BASE_URL = "http://localhost:4000";

async function repro() {
  console.log("=== REPRODUCING 403 ERROR ===");

  try {
    // 1. Register a new user
    const timestamp = Date.now();
    const userData = {
      name: `Owner ${timestamp}`,
      email: `owner_${timestamp}@example.com`,
      password: "password123"
    };

    console.log("1. Registering user...");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    const userId = regData.user.id;
    console.log(`✓ User registered with ID: ${userId}`);

    // 2. Login
    console.log("2. Logging in...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userData.email, password: userData.password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    const token = loginData.token;
    console.log("✓ Logged in.");

    // 3. Create a document
    console.log("3. Creating document...");
    const createRes = await fetch(`${BASE_URL}/api/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title: "Test Doc" })
    });
    const docData = await createRes.json();
    if (!createRes.ok) throw new Error(`Creation failed: ${JSON.stringify(docData)}`);
    const docId = docData.id;
    console.log(`✓ Document created with ID: ${docId}, OwnerID: ${docData.ownerId}`);

    // 4. Try to fetch the document
    console.log(`4. Fetching document ${docId} as user ${userId}...`);
    const getRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const getData = await getRes.json();
    
    if (getRes.status === 403) {
      console.log("❌ REPRODUCED: Got 403 Forbidden!");
      console.log("Message:", getData.message);
    } else if (getRes.ok) {
      console.log("✅ SUCCESS: Document fetched successfully.");
      console.log("Role:", getData.role);
    } else {
      console.log(`❓ UNEXPECTED: Status ${getRes.status}`);
      console.log("Data:", getData);
    }

  } catch (error) {
    console.error("Error during repro:", error.message);
  }
}

repro();
