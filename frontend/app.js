
const BASE_URL = "http://localhost:3000";


document.getElementById("newComplaintForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;
  const missedPickups = parseInt(document.getElementById("missedPickups").value) || 0;
  const healthRisk = document.getElementById("healthRisk").checked;

  const complaintData = { description, location, missedPickups, healthRisk };

  try {
    const response = await fetch(`${BASE_URL}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(complaintData),
    });

    console.log('Response Status:', response.status);

    if (response.ok) {
      const responseBody = await response.json();
      console.log('Response Body:', responseBody);
      alert("Complaint submitted successfully!");
      document.getElementById("newComplaintForm").reset();
    } else {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      alert(`Error submitting complaint: ${errorData.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error submitting complaint.");
  }
});


document.getElementById("fetchComplaints").addEventListener("click", async () => {
  try {
    const response = await fetch(`${BASE_URL}/complaints`);
    const complaints = await response.json();

    const complaintList = document.getElementById("complaintList");
    complaintList.innerHTML = "";

    complaints.forEach((complaint) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>ID:</strong> ${complaint.id} <br>
        <strong>Description:</strong> ${complaint.description} <br>
        <strong>Location:</strong> ${complaint.location} <br>
        <strong>Priority:</strong> ${complaint.priority} <br>
        <button onclick="resolveComplaint(${complaint.id})">Resolve</button>
      `;
      complaintList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
  }
});


async function resolveComplaint(id) {
  try {
    const response = await fetch(`${BASE_URL}/resolve/${id}`, {
      method: "PUT",
    });

    if (response.ok) {
      alert("Complaint resolved successfully!");
      document.getElementById("fetchComplaints").click();
    } else {
      alert("Error resolving complaint.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
