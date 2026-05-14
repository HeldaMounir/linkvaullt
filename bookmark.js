let body = document.getElementById("bookmarksGrid");
let allBookmarks = [];

async function getbookmark() {
  try {
    const token = localStorage.getItem("token");
    let res = await fetch("http://linkvaultapi.runasp.net/api/bookmarks", {
      headers: { Authorization: `Bearer ${token}` }
    });

    let data = await res.json();
    allBookmarks = data; 
    renderBookmarks(data); 
    
  } catch (err) {
    console.log(err);
  }
}

getbookmark();

function renderBookmarks(data) {
  const body = document.getElementById("bookmarksGrid");
  const empty = document.getElementById("emptyBookmarks");

  body.innerHTML = ""; 

  if (!data || data.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";

  data.forEach(book => {
    body.innerHTML += `
<div class="col-md-6 col-lg-4">
  <div class="card bookmark-card p-4 h-100">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="badge">Category: ${book.categoryName || "Category"}</span>
      <span class="badge">Notes: ${book.notesCount || 0}</span>
      <div class="d-flex gap-2">
        <div class="action-icon favorite" onclick="Favorite(${book.id})">
          <i class="bi bi-star${book.isFavorite ? "-fill" : ""}"></i>
        </div>
        <div class="action-icon archived" onclick="Archive(${book.id})">
          <i class="bi bi-archive${book.isArchived ? "-fill" : ""}"></i>
        </div>
        <button class="btn btn-outline-secondary btn-sm" onclick="editBookmark(${book.id})">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    </div>

    <h5 class="fw-bold mb-2">${book.title}</h5>
    <div class="url-box mb-2">${book.url}</div>

    <small class="text-muted d-block mb-3">
      <i class="bi bi-calendar-event me-1"></i>
      Created: ${book.createdAt ? new Date(book.createdAt).toLocaleDateString() : ""}
    </small>

    <a href="${book.url}" target="_blank" class="btn btn-primary w-100 mb-2">Visit</a>
    <button class="btn btn-outline-primary btn-sm" onclick="bookmarknotes(${book.id})">
      View Notes
    </button>
    <button class="btn btn-outline-primary btn-sm mt-2" onclick="openBookmarkNoteModal(${book.id})">
      Add Note
    </button>
  </div>
</div>`;
  });
}
function applyFilters() {
  let filtered = [...allBookmarks];

  const search = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("filterCategory").value;
  const favorite = document.getElementById("filterFavorite").value;
  const archive = document.getElementById("filterArchive").value;

  // search
  if (search) {
    filtered = filtered.filter(b =>
      b.title.toLowerCase().includes(search) ||
      b.url.toLowerCase().includes(search)
    );
  }

  // category
  if (category) {
    filtered = filtered.filter(b => b.categoryId == category);
  }

  // favorite
  if (favorite !== "") {
    filtered = filtered.filter(b => String(b.isFavorite) === favorite);
  }

  // archive
  if (archive !== "") {
    filtered = filtered.filter(b => String(b.isArchived) === archive);
  }

  renderBookmarks(filtered);
}

async function getCategories() {
  try {
    const res = await fetch("http://linkvaultapi.runasp.net/api/categories", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    const select = document.getElementById("categoryId");
const filterSelect = document.getElementById("filterCategory");

select.innerHTML = `<option value="">Select Category</option>`;
filterSelect.innerHTML = `<option value="">All Categories</option>`;

data.forEach(cat => {
  select.innerHTML += `
    <option value="${cat.id}">
      ${cat.categoryName}
    </option>
  `;

  filterSelect.innerHTML += `
    <option value="${cat.id}">
      ${cat.categoryName}
    </option>
  `;
});

  } catch (err) {
    console.log(err);
  }
}

getCategories();


async function Favorite(id) {
  try {
    const token = localStorage.getItem("token");

    const getRes = await fetch(`http://linkvaultapi.runasp.net/api/bookmarks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const book = await getRes.json();

    const newState = !book.isFavorite;

    const res = await fetch(`http://linkvaultapi.runasp.net/api/bookmarks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: book.title,
        url: book.url,
        categoryId: book.categoryId,
        isArchived: book.isArchived,
        isFavorite: newState
      })
    });

    await getbookmark();
    

  } catch (err) {
    console.log(err);
  }
}
async function Archive(id) {
  try {
    const token = localStorage.getItem("token");

    const getRes = await fetch(`http://linkvaultapi.runasp.net/api/bookmarks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const book = await getRes.json();

    const newState = !book.isArchived;

    const res = await fetch(`http://linkvaultapi.runasp.net/api/bookmarks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: book.title,
        url: book.url,
        categoryId: book.categoryId,
        isArchived: newState,
        isFavorite: book.isFavorite
      })
    });

    if (!res.ok) throw new Error("Failed to update archive");

    await getbookmark();

  } catch (err) {
    console.log(err);
  }
}
// ================= EDIT =================

async function editBookmark(id) {
  try {
    const res = await fetch(`http://linkvaultapi.runasp.net/api/bookmarks/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    document.getElementById("title").value = data.title;
    document.getElementById("url").value = data.url;

    document.getElementById("categoryId").value = data.categoryId;

    document.getElementById("bookmarkId").value = id;

    const modal = new bootstrap.Modal(
      document.getElementById("bookmarkModal")
    );

    modal.show();

  } catch (err) {
    console.log(err);
  }
}



//add
const bookmarkForm = document.getElementById("bookmarkForm");

if (bookmarkForm) {
  bookmarkForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;
    const categoryId = document.getElementById("categoryId").value;
    const id = document.getElementById("bookmarkId").value;
 if (!categoryId) {
      alert("Please select a category");
      return;
    }
    try {
      let res;

      if (id) {
        res = await fetch(`http://linkvaultapi.runasp.net/api/bookmarks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            title,
            url,
            categoryId: +categoryId
          })
        });

      } else {
        res = await fetch("http://linkvaultapi.runasp.net/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            title,
            url,
            categoryId: +categoryId
          })
        });
      }

      await res.json();

      getbookmark();

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("bookmarkModal")
      );

      if (modal) modal.hide();

      bookmarkForm.reset();
      document.getElementById("bookmarkId").value = "";

    } catch (err) {
      console.log(err);
    }
  });
}




async function deleteBookmark(id) {
  try {
    await fetch(`http://linkvaultapi.runasp.net/api/bookmarks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    getbookmark();

  } catch (err) {
    console.log(err);
  }
}



///////////notes////////////////

function updateCounters(data) {
  const total = document.getElementById("totalNotes");
  const pinned = document.getElementById("pinnedNotes");

  if (!total || !pinned) return;

  total.innerHTML = data.length;
  pinned.innerHTML = data.filter(n => n.pinned).length;
}

let content = document.getElementById("notesGrid");

async function getNotes() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://linkvaultapi.runasp.net/api/notes", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log(data)
    updateCounters(data);

    const empty = document.getElementById("emptyNotes");

    content.innerHTML = "";

    if (data.length === 0) {
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";

    data.forEach(note => {
     content.innerHTML += `
  <div class="col-md-6 col-lg-4">
    <div class="card bookmark-card p-4 h-100 ${note.pinned ? "border border-warning" : ""}">

      <!-- top -->
      <div class="d-flex justify-content-between align-items-center mb-3">

        <span class="badge ">
          ${note.categoryName || "No Category"}
        </span>

        ${note.pinned ? `
          <span class="badge bg-warning text-dark">
            <i class="bi bi-pin-angle-fill me-1"></i>Pinned
          </span>
        ` : ""}

        <div class="dropdown">
          <button class="btn btn-light btn-sm rounded-circle"
                  data-bs-toggle="dropdown">
            <i class="bi bi-three-dots"></i>
          </button>

          <ul class="dropdown-menu border-0 shadow">
            <li>
              <button class="dropdown-item"
                      onclick="editNote(${note.id})">
                <i class="bi bi-pencil me-2"></i>Edit
              </button>
            </li>

            <li>
              <button class="dropdown-item"
                      onclick="pinNote(${note.id})">
                <i class="bi bi-pin-angle me-2"></i>
                ${note.pinned ? "Unpin" : "Pin"}
              </button>
            </li>

            <li>
              <button class="dropdown-item text-danger"
                      onclick="deleteNote(${note.id})">
                <i class="bi bi-trash me-2"></i>Delete
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- title -->
      <h2 class="fw-bold mb-3">
        ${note.title}
      </h2>

     
      <p class="text-muted mb-4">
        ${note.content}
      </p>


    
      <div class="mt-auto border-top pt-3">

        <small class="d-block text-secondary mb-2">
          <i class="bi bi-folder me-1"></i>
          Category: ${note.categoryName || "Unknown"}
        </small>

        <small class="d-block text-secondary">
          <i class="bi bi-calendar-event me-1"></i>
          Created: ${
            note.createdAt
              ? new Date(note.createdAt).toLocaleDateString()
              : "N/A"
          }
        </small>

      </div>

    </div>
  </div>
`;
    });

  } catch (err) {
    console.log(err);
  }
}

getNotes();

async function loadCategories() {
  const select = document.getElementById("noteCategoryId");

  if (!select) {
    console.log("noteCategoryId not found in DOM");
    return;
  }

  const res = await fetch("http://linkvaultapi.runasp.net/api/categories", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();

  select.innerHTML = `<option value="">Select Category</option>`;

  data.forEach(cat => {
    select.innerHTML += `
      <option value="${cat.id}">
        ${cat.categoryName}
      </option>
    `;
  });
}

async function editNote(id) {
  try {
    const res = await fetch(`http://linkvaultapi.runasp.net/api/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    console.log(data)

    document.getElementById("noteTitle").value = data.title;
    document.getElementById("noteContent").value = data.content;
    document.getElementById("noteCategoryId").value = data.categoryName;
    document.getElementById("noteId").value = id;
const select = document.getElementById("noteCategoryId");

const option = [...select.options]
  .find(opt => opt.text.trim() === data.categoryName);

if (option) {
  select.value = option.value;
}
    const modal = new bootstrap.Modal(
      document.getElementById("noteModal")
    );

    modal.show();


  } catch (err) {
    console.log(err);
  }
}
//add
const noteForm = document.getElementById("noteForm");

if (noteForm) {
  noteForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    const categoryId = document.getElementById("noteCategoryId").value;

    const id = document.getElementById("noteId").value;

    try {

      let res;

      // edit
      if (id) {

        res = await fetch(
          `http://linkvaultapi.runasp.net/api/notes/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              title,
              content,
              categoryId: Number(categoryId)
            })
          }
        );

      } else {

        // add
        res = await fetch(
          "http://linkvaultapi.runasp.net/api/notes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              title,
              content,
              categoryId: Number(categoryId)
            })
          }
        );
      }

      await res.json();

      getNotes();

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("noteModal")
      );

      if (modal) modal.hide();

      noteForm.reset();

      document.getElementById("noteId").value = "";

    } catch (err) {
      console.log(err);
    }
  });
}
//delete
async function deleteNote(id) {
  try {
    await fetch(`http://linkvaultapi.runasp.net/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    getNotes();

  } catch (err) {
    console.log(err);
  }
}

//pin //fe hna moshkla
async function pinNote(id) {

  try {

    const noteRes = await fetch(
      `http://linkvaultapi.runasp.net/api/notes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    const note = await noteRes.json();

    console.log("NOTE:", note);

    let res = await fetch(
      `http://linkvaultapi.runasp.net/api/notes/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          categoryid:note.id, //mgesh category id 
          pinned: !note.pinned
        })
      }
    );

    const data = await res.json();
    console.log(data);

    getNotes();

  } catch (err) {
    console.log(err);
  }
}

async function bookmarknotes(bookmarkId) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://linkvaultapi.runasp.net/api/bookmarks/${bookmarkId}/notes`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    console.log(data)

    const section = document.getElementById("bookmarkNotesSection");
    const container = document.getElementById("bookmarkNotesContainer");

    if (!container || !section) return;

    section.classList.remove("d-none");
    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted">
          No notes for this bookmark
        </div>
      `;
      return;
    }

    data.forEach(note => {
      container.innerHTML += `
        <div class="col-md-4">
          <div class="card shadow-sm border-0 rounded-4 p-3 h-100">

            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0">${note.content}</h6>

              ${
                note.pinned
                  ? `<span class="badge bg-warning text-dark">Pinned</span>`
                  : ""
              }
            </div>

            <small class="text-secondary">
              <i class="bi bi-calendar-event me-1"></i>
              ${note.createdAt}
            </small>
            <button
  class="btn btn-outline-danger btn-sm w-100 mt-4"
  onclick="deleteBookmarkNote(${bookmarkId}, ${note.id})"
>
  <i class="bi bi-trash me-1"></i>
  Delete
</button>

          </div>
        </div>
      `;
    });

  } catch (err) {
    console.log(err);
  }
}



function openBookmarkNoteModal(bookmarkId) {
  document.getElementById("bookmarkNoteId").value = bookmarkId;

  const modal = new bootstrap.Modal(
    document.getElementById("bookmarkNoteModal")
  );

  modal.show();
}


// add
async function addBookmarkNote(bookmarkId) {
  try {
    const token = localStorage.getItem("token");

    const content = document.getElementById("noteContent").value;
   

    const res = await fetch(
      `http://linkvaultapi.runasp.net/api/bookmarks/${bookmarkId}/notes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
        })
      }
    );

    const data = await res.json();
    console.log("note added:", data);

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("bookmarkNoteModal")
    );

    if (modal) modal.hide();

    document.getElementById("bookmarkNoteForm").reset();

    bookmarknotes(bookmarkId);

  } catch (err) {
    console.log(err);
  }
}


// submit 
const bookmarkNoteForm = document.getElementById("bookmarkNoteForm");

if (bookmarkNoteForm) {
  bookmarkNoteForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const bookmarkId =
      document.getElementById("bookmarkNoteId").value;

    addBookmarkNote(bookmarkId);
  });
}
///delete
async function deleteBookmarkNote(bookmarkId, noteId) {
  try {
    const token = localStorage.getItem("token");

    await fetch(
      `http://linkvaultapi.runasp.net/api/bookmarks/${bookmarkId}/notes/${noteId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // refresh
    bookmarknotes(bookmarkId);

  } catch (err) {
    console.log(err);
  }
}


document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("filterCategory").addEventListener("change", applyFilters);
document.getElementById("filterFavorite").addEventListener("change", applyFilters);
document.getElementById("filterArchive").addEventListener("change", applyFilters);