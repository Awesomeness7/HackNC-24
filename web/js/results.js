document.addEventListener("DOMContentLoaded", function () {
    const session_id = localStorage.getItem("session_id");
    if (session_id) {
        axios.get(`/api/endsession?session_id=${session_id}`)
            .then(response => {
                document.getElementById("points_total").textContent = (response.data.score);
            });
        localStorage.removeItem("session_id");
    }
});

document.getElementById("play-again-button").addEventListener("click", function () {
    axios.get('/api/makesession')
        .then(response => {
            localStorage.setItem("session_id", response.data.session_id);
            window.location.href = "game.html";
        })
});