//register
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("regFirstName").value;
    const lastName = document.getElementById("regLastName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
      const res = await fetch("http://linkvaultapi.runasp.net/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "login.html";
      } else {
        console.log(data);
      }

    } catch (err) {
      console.log(err);
    }
  });
}


// login

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const emaillog = document.getElementById("emaillog").value;
    const passlog = document.getElementById("passlog").value;
    const parerror = document.getElementById("error");

    try {
      const res = await fetch("http://linkvaultapi.runasp.net/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emaillog,
          password: passlog
        })
      });

      const data = await res.json();


      if (!res.ok) {
        parerror.innerHTML = data.message || "Login failed";
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "categories.html";

    } catch (err) {
      console.log(err);
    }
  });
}



async function getcategories() {
  const body = document.getElementById("categoriesBody");

  if (!body) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://linkvaultapi.runasp.net/api/categories", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log(data)

       let empty = document.getElementById("emptyState");

    body.innerHTML = "";

   if (data.length === 0) {
  empty.classList.remove("d-none");
  return;
}

empty.classList.add("d-none");

    data.forEach(cat => {
      body.innerHTML += `
        <tr>
          <td>${cat.id}</td>
          <td>${cat.categoryName}</td>
          <td>${cat.description}</td>
          <td>${cat.bookmarksCount}</td>
          <td>${cat.notesCount}</td>
          
          <td>
            <button class="icon-btn  btn-pin " onclick="updateCategory(${cat.id})">
              <i class="bi bi-pencil"></i>
            </button>

            <button class="icon-btn  btn-trash" onclick="deleteCategory(${cat.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.log(err);
  }
}


if (document.getElementById("categoriesBody")) {
  getcategories();
}


//update
async function updateCategory(id) {
  try {
    const res = await fetch(`http://linkvaultapi.runasp.net/api/categories/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    document.getElementById("catName").value = data.categoryName;
    document.getElementById("catDesc").value = data.description || "";
    document.getElementById("categoryId").value = id;

    const modal = new bootstrap.Modal(
      document.getElementById("categoryModal")
    );

    modal.show();

  } catch (err) {
    console.log(err);
  }
}


//add
const categoryForm = document.getElementById("categoryForm");

if (categoryForm) {
  categoryForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const categoryname = document.getElementById("catName").value;
    const catdesc = document.getElementById("catDesc").value;

    let res;

    try {
        res = await fetch("http://linkvaultapi.runasp.net/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            categoryName: categoryname,
            description: catdesc
          })
        });
      

      const data = await res.json();

      if (!res.ok) {
        console.log("ERROR:", data);
        return;
      }

      getcategories();

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("categoryModal")
      );

      if (modal) modal.hide();

      categoryForm.reset();
      document.getElementById("categoryId").value = "";

    } catch (err) {
      console.log(err);
    }
  });
}

//delete
async function deleteCategory(id) {
  
  try {
    const confirmDelete = confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    const res = await fetch(`http://linkvaultapi.runasp.net/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
    
      console.log("ERROR:", data);
  document.getElementById("errorMsg").textContent = data.message;

      return;
    }
   

    getcategories();

  } catch (err) {
    console.log(err);
  }
}