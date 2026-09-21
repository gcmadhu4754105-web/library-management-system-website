const API_URL = "http://localhost:5000/api";


// ==================== NAVIGATION ====================

function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach((section) => {
        section.classList.remove("active-section");
    });

    document
        .getElementById(sectionId)
        .classList.add("active-section");

    const titles = {
        dashboard: "Dashboard",
        books: "Books",
        students: "Students",
        issue: "Issue Books",
        return: "Return Books"
    };

    document.getElementById("pageTitle").innerText =
        titles[sectionId];
}


// ==================== DASHBOARD ====================

async function loadDashboard() {

    try {

        const response = await fetch(`${API_URL}/dashboard`);
        const data = await response.json();

        document.getElementById("totalBooks").innerText =
            data.totalBooks;

        document.getElementById("totalStudents").innerText =
            data.totalStudents;

        document.getElementById("booksIssued").innerText =
            data.booksIssued;

        document.getElementById("availableBooks").innerText =
            data.availableBooks;

    } catch (error) {

        console.error("Error loading dashboard:", error);

    }
}


// ==================== BOOKS ====================

async function loadBooks() {

    try {

        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();

        const table = document.getElementById("booksTable");

        table.innerHTML = "";

        books.forEach((book) => {

            const status = book.available
                ? "Available"
                : "Issued";

            table.innerHTML += `
                <tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${status}</td>
                </tr>
            `;

        });

    } catch (error) {

        console.error("Error loading books:", error);

    }
}


async function addBook(title, author) {

    try {

        const response = await fetch(`${API_URL}/books`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                author: author
            })

        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Error adding book");
            return;
        }

        alert(data.message);

        loadBooks();
        loadDashboard();

    } catch (error) {

        console.error("Error adding book:", error);

    }
}


// Called by Add Book button
function addBookFromForm() {

    const title =
        document.getElementById("bookTitle").value;

    const author =
        document.getElementById("bookAuthor").value;

    if (!title || !author) {

        alert("Please enter book title and author");
        return;

    }

    addBook(title, author);

    document.getElementById("bookTitle").value = "";
    document.getElementById("bookAuthor").value = "";

}


// ==================== STUDENTS ====================

async function loadStudents() {

    try {

        const response =
            await fetch(`${API_URL}/students`);

        const students =
            await response.json();

        const table =
            document.getElementById("studentsTable");

        table.innerHTML = "";

        students.forEach((student) => {

            table.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.department}</td>
                </tr>
            `;

        });

    } catch (error) {

        console.error("Error loading students:", error);

    }
}


async function addStudent(name, department) {

    try {

        const response =
            await fetch(`${API_URL}/students`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    department: department
                })

            });

        const data =
            await response.json();

        if (!response.ok) {

            alert(data.message || "Error adding student");
            return;

        }

        alert(data.message);

        loadStudents();
        loadDashboard();

    } catch (error) {

        console.error(
            "Error adding student:",
            error
        );

    }
}


// Called by Add Student button
function addStudentFromForm() {

    const name =
        document.getElementById("studentName").value;

    const department =
        document.getElementById(
            "studentDepartment"
        ).value;

    if (!name || !department) {

        alert("Please enter student details");
        return;

    }

    addStudent(name, department);

    document.getElementById(
        "studentName"
    ).value = "";

    document.getElementById(
        "studentDepartment"
    ).value = "";

}


// ==================== ISSUE BOOK ====================

async function issueBook(student_id, book_id) {

    try {

        const response =
            await fetch(`${API_URL}/issue`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    student_id: student_id,
                    book_id: book_id
                })

            });

        const data =
            await response.json();

        alert(data.message);

        if (response.ok) {

            loadDashboard();
            loadBooks();

        }

    } catch (error) {

        console.error(
            "Error issuing book:",
            error
        );

    }
}


function issueBookFromForm() {

    const studentId =
        document.getElementById(
            "issueStudentId"
        ).value;

    const bookId =
        document.getElementById(
            "issueBookId"
        ).value;

    if (!studentId || !bookId) {

        alert(
            "Please enter Student ID and Book ID"
        );

        return;

    }

    issueBook(studentId, bookId);

    document.getElementById(
        "issueStudentId"
    ).value = "";

    document.getElementById(
        "issueBookId"
    ).value = "";

}


// ==================== RETURN BOOK ====================

async function returnBook(book_id) {

    try {

        const response =
            await fetch(
                `${API_URL}/return/${book_id}`,
                {
                    method: "PUT"
                }
            );

        const data =
            await response.json();

        alert(data.message);

        if (response.ok) {

            loadDashboard();
            loadBooks();

        }

    } catch (error) {

        console.error(
            "Error returning book:",
            error
        );

    }
}


function returnBookFromForm() {

    const bookId =
        document.getElementById(
            "returnBookId"
        ).value;

    if (!bookId) {

        alert("Please enter Book ID");

        return;

    }

    returnBook(bookId);

    document.getElementById(
        "returnBookId"
    ).value = "";

}


// ==================== INITIAL LOAD ====================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();
        loadBooks();
        loadStudents();

    }
);