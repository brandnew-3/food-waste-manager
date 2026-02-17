// Switch between sections
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });
  document.getElementById(sectionId).classList.remove("hidden");

  if (sectionId === "storedFood") {
    loadStoredFood();
  }
}

// Submit food data
function submitFood() {
  const source = document.getElementById("source").value;
  const category = document.getElementById("category").value;
  const quantity = document.getElementById("quantity").value;
  const phone = document.getElementById("phone").value;
  const location = document.getElementById("location").value;
  const status = document.getElementById("status").checked
    ? "Edible"
    : "Non-Edible";

  if (!source || !category || !quantity || !phone || !location) {
    alert("Please fill all fields");
    return;
  }

  const foodData = {
    source,
    category,
    quantity,
    phone,
    location,
    status,
    dateTime: new Date().toLocaleString() // submission time
  };

  fetch("http://localhost:3000/add-food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(foodData)
  })
    .then(res => res.json())
    .then(() => {
      alert("Food entry saved successfully");
      document.getElementById("source").value = "";
      document.getElementById("category").value = "";
      document.getElementById("quantity").value = "";
      document.getElementById("phone").value = "";
      document.getElementById("location").value = "";
      document.getElementById("status").checked = false;
    })
    .catch(err => {
      console.error(err);
      alert("Backend not connected");
    });
}

// Load stored food
function loadStoredFood() {
  fetch("http://localhost:3000/foods")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("foodList");
      list.innerHTML = "";

      data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="p-2">${item.source}</td>
          <td class="p-2">${item.category}</td>
          <td class="p-2">${item.quantity}</td>
          <td class="p-2">${item.phone}</td>
          <td class="p-2">${item.status}</td>
          <td class="p-2">${item.location}</td>
          <td class="p-2">${item.createdAt || "N/A"}</td>
        `;
        list.appendChild(row);
      });
    })
    .catch(err => console.error(err));
}
