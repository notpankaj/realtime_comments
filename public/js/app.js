let username;
let socket = io();

do {
  username = prompt("Enter your name:");
} while (!username);

const textarea = document.querySelector("#textarea");
const submitBtn = document.querySelector("#submitBtn");
const commentBox = document.querySelector(".comment__box");
const typingDiv = document.querySelector(".typing");

function appendToDom(data) {
  let lTag = document.createElement("li");
  lTag.classList.add("mb-3", "comment");
  let markup = `
  <div class="card border-light mb-3">
    <div class="card-body">
      <h6>${data.username}</h6>
      <p>${data.comment}</p>
      <div>
        <img src="/img/clock.png" alt="clock">
        <small>${moment(data.time).format("LT")}</small>
      </div>
    </div>
  </div>
`;
  lTag.innerHTML = markup;
  commentBox.prepend(lTag);
}

function boradcastComment(data) {
  // Socket
  socket.emit("comment", data);
}

function postComment(cmt) {
  //appent to chat
  let data = {
    username,
    comment: cmt,
  };
  appendToDom(data);
  textarea.value = "";
  //broadcast
  boradcastComment(data);
  //sync with db
  syncWithDb(data);
}
//api call
function syncWithDb(data) {
  const headers = {
    "Content-Type": "application/json",
  };
  fetch("/api/comments", {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  })
    .then((res) => res.json())
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err?.message);
    });
}

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const comment = textarea.value;
  console.log({ comment });
  if (!comment) return;

  postComment(comment);
});

// socket listeners
socket.on("comment", (data) => {
  appendToDom(data);
});

let timerId = null;
function debounce(func, timer) {
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(() => {
    func();
  }, timer);
}

socket.on("typing", (data) => {
  typingDiv.innerHTML = `${data.username} is typing...`;

  debounce(() => {
    typingDiv.innerHTML = ``;
  }, 1000);
});

// typing....
textarea.addEventListener("keyup", (_) => {
  socket.emit("typing", { username });
});

// ----

const fetchComments = () => {
  fetch("/api/comments")
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      if (res.data.length) {
        for (let cmt of res.data) {
          cmt.time = cmt.createdAt;
          appendToDom(cmt);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

window.onload = fetchComments;
