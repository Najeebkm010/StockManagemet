// public/js/admin.js
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in and is admin
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  // Load initial data
  loadStockRequests();
  loadStaffList();

  // Add event listeners
  document
    .getElementById("addStaffForm")
    .addEventListener("submit", handleAddStaff);
  document
    .getElementById("reportForm")
    .addEventListener("submit", handleGenerateReport);
});

const API_BASE_URL = `${window.location.origin}`;

async function loadStockRequests() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/requests`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const requests = await response.json();
    // console.log('Stock requests:', requests);

    const tableBody = document.getElementById("stockRequestsTable");
    tableBody.innerHTML = requests
      .map(
        (request) => `
            <tr>
                <td>${request.category}</td>
                <td>${request.description}</td>
                <td>${request.quantity}</td>
                <td>${request.userName}</td>
                <td>${new Date(request.submittedAt).toLocaleDateString()}</td>
                <td>${request.status}</td>
                <td>
                    ${
                      request.status === "pending"
                        ? `
                        <button onclick="updateStatus('${request._id}', 'released')" class="btn btn-success btn-sm">
                            Mark as Received
                        </button>
                        <button onclick="updateStatus('${request._id}', 'rejected')" class="btn btn-danger btn-sm">
                            Reject
                        </button>
                    `
                        : ""
                    }
                </td>
            </tr>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error loading stock requests:", error);
    alert("Failed to load stock requests");
  }
}

async function loadStaffList() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/staff`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const staff = await response.json();

    const tableBody = document.getElementById("staffTable");
    tableBody.innerHTML = staff
      .map(
        (user) => `
            <tr>
                <td>${user.username}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button onclick="deleteStaff('${
                      user._id
                    }')" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error loading staff list:", error);
    alert("Failed to load staff list");
  }
}

async function deleteStaff(staffId) {
  const confirmation = confirm(
    "Are you sure you want to delete this staff member?"
  );
  if (!confirmation) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/staff/${staffId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      alert("Staff member deleted successfully");
      loadStaffList(); // Refresh the staff list after deletion
    } else {
      const data = await response.json();
      alert(data.error || "Failed to delete staff member");
    }
  } catch (error) {
    console.error("Error deleting staff member:", error);
    alert("Failed to delete staff member");
  }
}

async function handleAddStaff(e) {
  e.preventDefault();

  const username = document.getElementById("newStaffUsername").value;
  const password = document.getElementById("newStaffPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      alert("Staff account created successfully");
      loadStaffList();
      document.getElementById("addStaffForm").reset();
      bootstrap.Modal.getInstance(
        document.getElementById("addStaffModal")
      ).hide();
    } else {
      const data = await response.json();
      alert(data.error || "Failed to create staff account");
    }
  } catch (error) {
    console.error("Error creating staff account:", error);
    alert("Failed to create staff account");
  }
}

async function updateStatus(requestId, status) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/requests/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (response.ok) {
      loadStockRequests();
    } else {
      const data = await response.json();
      alert(data.error || "Failed to update status");
    }
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update status");
  }
}

async function handleGenerateReport(e) {
  e.preventDefault();

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/reports?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();
    console.log(data, "data");

    // Display report results
    const resultsDiv = document.getElementById("reportResults");
    resultsDiv.innerHTML = `
            <h6>Report Summary (${startDate} to ${endDate})</h6>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Staff</th>
                        </tr>
                    </thead>
                     <tbody>
                    ${data
                      .map(
                        (item) => `
                        <tr>
                            <td>${
                              item.submittedAt
                                ? new Date(
                                    item.submittedAt
                                  ).toLocaleDateString()
                                : "N/A"
                            }</td>
                            <td>${item.category || "N/A"}</td>
                            <td>${item.description || "N/A"}</td>
                            <td>${item.quantity || "N/A"}</td>
                            <td>${item.priority || "N/A"}</td>
                            <td>${item.status || "N/A"}</td>
                            <td>${item.userName || "N/A"}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
                </table>
            </div>
        `;

    // Add Excel Download Functionality
    document.getElementById("downloadExcel").onclick = () => {
      const startDate = document.getElementById("startDate").value;
      const endDate = document.getElementById("endDate").value;

      fetch(
        `${API_BASE_URL}/api/admin/reports?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          downloadExcel(data);
        })
        .catch((error) => {
          console.error("Error generating report:", error);
          alert("Failed to generate report");
        });
    };
  } catch (error) {
    console.error("Error generating report:", error);
    alert("Failed to generate report");
  }
}

//Download excel
function downloadExcel(data) {
    const formattedData = data.map((item) => ({
      Date: item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "N/A",
      Category: item.category || "N/A",
      Description: item.description || "N/A",
      Quantity: item.quantity || "N/A",
      Priority: item.priority || "N/A",
      Status: item.status || "N/A",
      Staff: item.userName || "N/A",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const styledWorkbook = applyStyles(worksheet);
  
    XLSX.writeFile(styledWorkbook, `Report_${Date.now()}.xlsx`);
  }

function applyStyles(worksheet) {
    // Ensure XLSX library has style capabilities
    if (!worksheet['!cols']) worksheet['!cols'] = [];
    if (!worksheet['!ref']) return;
  
    const range = XLSX.utils.decode_range(worksheet['!ref']);
  
    // Column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 20 }, // Category
      { wch: 20 }, // Description
      { wch: 12 }, // Quantity
      { wch: 15 }, // Priority
      { wch: 15 }, // Status
      { wch: 20 }  // Staff
    ];
  
    // Header row styling
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
      worksheet[headerCell].s = {
        font: { 
          name: 'Arial', 
          sz: 12, 
          bold: true, 
          color: { rgb: 'FFFFFF' } 
        },
        fill: { fgColor: { rgb: '4472C4' } },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  
    // Data rows styling
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
  
        worksheet[cellAddress].s = {
          font: { name: 'Arial', sz: 11 },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    }
  
    // Explicitly set workbook properties
    const workbook = {
      SheetNames: ['Report'],
      Sheets: {
        'Report': worksheet
      }
    };
  
    return workbook;
  }

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("UserType");
  window.location.href = "/index.html";
}
