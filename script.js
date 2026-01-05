function loginUser() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if (user === "" || pass === "") {
    alert("Please enter username and password");
  } else {
    // Demo login success
    window.location.href = "dashboard.html";
  }
}
