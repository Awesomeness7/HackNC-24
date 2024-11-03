// Maybe todo: jquery so it's cleaner
document.getElementById("start-button").addEventListener("click", function () {
    axios.get('/api/makesession')
        .then(response => {
            localStorage.setItem("session_id", response.data.session_id);
            window.location.href = "game.html";
        })
});