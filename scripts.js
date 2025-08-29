function redirect(event) {
    event.preventDefault();
    window.location.href = document.getElementById("site-password").value + ".html";
}