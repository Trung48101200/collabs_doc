import "dotenv/config";

const BASE_URL = "http://localhost:4000";

async function testBackend() {
  console.log("=== BEGINNING BACKEND API INTEGRATION TEST ===");

  const timestamp = Date.now();
  const userAData = {
    name: `User A ${timestamp}`,
    email: `usera_${timestamp}@example.com`,
    password: "password123"
  };
  
  const userBData = {
    name: `User B ${timestamp}`,
    email: `userb_${timestamp}@example.com`,
    password: "password123"
  };

  let tokenA = "";
  let tokenB = "";
  let docId = null;
  let userBId = null;
  let versionId = null;

  try {
    // 1. Register User A
    console.log("\n1. Registering User A...");
    const regARes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userAData)
    });
    const regA = await regARes.json();
    if (regARes.status !== 201) throw new Error(`Reg A failed: ${JSON.stringify(regA)}`);
    console.log(`✓ User A registered: id=${regA.user.id}, email=${regA.user.email}`);

    // 2. Register User B
    console.log("\n2. Registering User B...");
    const regBRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userBData)
    });
    const regB = await regBRes.json();
    if (regBRes.status !== 201) throw new Error(`Reg B failed: ${JSON.stringify(regB)}`);
    userBId = regB.user.id;
    console.log(`✓ User B registered: id=${regB.user.id}, email=${regB.user.email}`);

    // 3. Login User A
    console.log("\n3. Logging in User A...");
    const loginARes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAData.email, password: userAData.password })
    });
    const loginA = await loginARes.json();
    if (loginARes.status !== 200) throw new Error(`Login A failed: ${JSON.stringify(loginA)}`);
    tokenA = loginA.token;
    console.log(`✓ User A logged in, token acquired.`);

    // 4. Login User B
    console.log("\n4. Logging in User B...");
    const loginBRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userBData.email, password: userBData.password })
    });
    const loginB = await loginBRes.json();
    if (loginBRes.status !== 200) throw new Error(`Login B failed: ${JSON.stringify(loginB)}`);
    tokenB = loginB.token;
    console.log(`✓ User B logged in, token acquired.`);

    // 4.5. Access & Refresh Token verification
    console.log("\n4.5. Verifying Access & Refresh Token flow...");
    if (!loginA.accessToken || !loginA.refreshToken) {
      throw new Error(`Login A response did not include accessToken or refreshToken! Got: ${JSON.stringify(loginA)}`);
    }
    console.log("✓ Login response has both accessToken and refreshToken.");

    // Refreshing the token
    console.log("Refreshing access token using refresh token...");
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: loginA.refreshToken })
    });
    const refreshData = await refreshRes.json();
    if (refreshRes.status !== 200) {
      throw new Error(`Refresh failed: ${JSON.stringify(refreshData)}`);
    }
    const newAccessToken = refreshData.accessToken;
    console.log("✓ Successfully refreshed access token.");

    // Test new access token against /me
    console.log("Verifying new access token against /api/auth/me...");
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${newAccessToken}` }
    });
    const meData = await meRes.json();
    if (meRes.status !== 200) {
      throw new Error(`Access token /me test failed: ${JSON.stringify(meData)}`);
    }
    console.log(`✓ Verified access token. Hello, ${meData.name}!`);

    // Logout and revoke token
    console.log("Logging out (revoking refresh token & blacklisting access token)...");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${newAccessToken}`
      },
      body: JSON.stringify({ refreshToken: loginA.refreshToken })
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`);
    }
    console.log("✓ Successfully logged out.");

    // Verify blacklisted access token is rejected on protected routes
    console.log("Verifying blacklisted access token against /api/auth/me (should fail 401)...");
    const failMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${newAccessToken}` }
    });
    console.log(`Status: ${failMeRes.status}`);
    if (failMeRes.status !== 401) {
      throw new Error(`Expected 401 on blacklisted access token, got ${failMeRes.status}`);
    }
    console.log("✓ Blacklisted access token correctly rejected!");

    // Try refreshing again after logout (should fail 401)
    console.log("Trying to refresh again with revoked token (should fail 401)...");
    const failRefreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: loginA.refreshToken })
    });
    console.log(`Status: ${failRefreshRes.status}`);
    if (failRefreshRes.status !== 401) {
      throw new Error(`Expected 401 on revoked refresh token, got ${failRefreshRes.status}`);
    }
    console.log("✓ Revoked token correctly rejected!");

    // 5. User A creates a document
    console.log("\n5. User A creates a new document...");
    // Since User A was logged out in step 4.5, we must login User A again to get a fresh active token!
    console.log("Logging User A back in to get a fresh token...");
    const reloginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAData.email, password: userAData.password })
    });
    const reloginData = await reloginRes.json();
    if (reloginRes.status !== 200) throw new Error(`Re-login A failed: ${JSON.stringify(reloginData)}`);
    tokenA = reloginData.token;
    console.log("✓ User A re-logged in successfully.");

    const createDocRes = await fetch(`${BASE_URL}/api/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenA}`
      },
      body: JSON.stringify({ title: "Bao cao He thong Phan tan" })
    });
    const doc = await createDocRes.json();
    if (createDocRes.status !== 201) throw new Error(`Create doc failed: ${JSON.stringify(doc)}`);
    docId = doc.id;
    console.log(`✓ Document created: id=${docId}, title="${doc.title}"`);

    // 6. User A invites User B as a viewer
    console.log("\n6. User A invites User B as a 'viewer'...");
    const inviteRes = await fetch(`${BASE_URL}/api/documents/${docId}/collaborators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenA}`
      },
      body: JSON.stringify({ email: userBData.email, role: "viewer" })
    });
    const invite = await inviteRes.json();
    if (inviteRes.status !== 201) throw new Error(`Invite B failed: ${JSON.stringify(invite)}`);
    console.log(`✓ User B invited as viewer successfully.`);

    // 7. Check collaborators list
    console.log("\n7. Listing collaborators...");
    const collabsRes = await fetch(`${BASE_URL}/api/documents/${docId}/collaborators`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${tokenA}` }
    });
    const collabs = await collabsRes.json();
    console.log("Collaborators:", collabs.map(c => `${c.name} (${c.role})`));
    if (collabs.length !== 2) throw new Error("Expected exactly 2 collaborators");

    // 8. User B (viewer) tries to edit document -> Expected to fail (403)
    console.log("\n8. User B (viewer) tries to edit document (expected 403)...");
    const editRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        title: "Hack title",
        contentText: "Viewer trying to edit"
      })
    });
    const editData = await editRes.json();
    console.log(`Status: ${editRes.status}, Message: ${editData.message}`);
    if (editRes.status !== 403) throw new Error(`Expected 403 Forbidden, got ${editRes.status}`);
    console.log("✓ Correctly blocked unauthorized edit!");

    // 9. User A changes User B role to 'editor'
    console.log("\n9. User A upgrades User B to 'editor'...");
    const roleChangeRes = await fetch(`${BASE_URL}/api/documents/${docId}/collaborators/${userBId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenA}`
      },
      body: JSON.stringify({ role: "editor" })
    });
    const roleChange = await roleChangeRes.json();
    if (roleChangeRes.status !== 200) throw new Error(`Role change failed: ${JSON.stringify(roleChange)}`);
    console.log("✓ User B role updated to editor.");

    // 10. User B (now editor) tries to edit document -> Expected to succeed
    console.log("\n10. User B (now editor) edits document again (expected 200)...");
    const editSuccessRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        title: "Bao cao HTPT - Version Final",
        contentText: "Noi dung duoc cap nhat boi Editor B",
        contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Noi dung" }] }] },
        contentHtml: "<p>Noi dung</p>"
      })
    });
    const editSuccess = await editSuccessRes.json();
    if (editSuccessRes.status !== 200) throw new Error(`Edit by editor failed: ${JSON.stringify(editSuccess)}`);
    console.log(`✓ Document edited successfully by User B! Title is now: "${editSuccess.title}"`);

    // 11. User B creates a snapshot version
    console.log("\n11. User B creates a snapshot version...");
    const createVerRes = await fetch(`${BASE_URL}/api/documents/${docId}/versions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${tokenB}` }
    });
    const ver = await createVerRes.json();
    if (createVerRes.status !== 201) throw new Error(`Create version failed: ${JSON.stringify(ver)}`);
    versionId = ver.versionNumber;
    console.log(`✓ Created version snapshot #${versionId}`);

    // 12. List versions
    console.log("\n12. Listing versions...");
    const listVersRes = await fetch(`${BASE_URL}/api/documents/${docId}/versions`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${tokenB}` }
    });
    const versionsList = await listVersRes.json();
    console.log("Versions list:", versionsList.map(v => `Ver #${v.versionNumber} by ${v.createdBy}`));

    // 13. User A edits document to something else
    console.log("\n13. User A changes document content...");
    await fetch(`${BASE_URL}/api/documents/${docId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        title: "Something else completely",
        contentText: "Completely new content by Owner A"
      })
    });
    console.log("✓ Document content changed by Owner A.");

    // 14. User B restores version #1
    console.log("\n14. User B restores document to Version #1...");
    // We need the actual version DB primary key ID
    const verObj = versionsList.find(v => v.versionNumber === versionId);
    if (!verObj) throw new Error("Could not find version object");
    
    const restoreRes = await fetch(`${BASE_URL}/api/documents/${docId}/versions/${verObj.id}/restore`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${tokenB}` }
    });
    const restore = await restoreRes.json();
    if (restoreRes.status !== 200) throw new Error(`Restore failed: ${JSON.stringify(restore)}`);
    console.log(`✓ Document restored! Current Title: "${restore.document.title}", Content: "${restore.document.contentText}"`);

    console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    process.exit(1);
  }
}

testBackend();
