let postsContainer = document.querySelector(".posts > div");
function updateUi() {
  let userInfo = document.querySelector(".user-info");
  let profileImage = document.querySelector(".profile-image");
  let Auth = document.querySelector(".Auth");
  let addComment = document.querySelector(".add-comment");
  if (localStorage.getItem("token")) {
    if (document.getElementById("btnCreatePost"))
      document.getElementById("btnCreatePost").classList.remove("d-none");
    if (addComment) addComment.classList.remove("d-none");
    let user = JSON.parse(localStorage.getItem("user"));
    typeof user.profile_image == "object"
      ? (profileImage.src = "image/profile.webp")
      : (profileImage.src = user.profile_image);
    userInfo.classList.remove("d-none");
    Auth.classList.add("d-none");
    document.querySelector(".user-name").innerHTML = user.name;
  } else {
    if (document.getElementById("btnCreatePost"))
      document.getElementById("btnCreatePost").classList.add("d-none");
    if (addComment) addComment.classList.add("d-none");
    Auth.classList.remove("d-none");
    userInfo.classList.add("d-none");
  }
  if (window.location.pathname.includes("profile.html")) {
    updateUserProfile();
    if (!userId || userId == JSON.parse(localStorage.getItem("user"))?.id) {
      document.getElementById("btnCreatePost").classList.remove("d-none");
    } else {
      document.getElementById("btnCreatePost").classList.add("d-none");
    }
  }
}

function parseRelativeTime(str) {
  let now = new Date();
  let num = parseInt(str);
  str = str.toLowerCase();

  if (str.includes("minute")) {
    return new Date(now - num * 60 * 1000);
  } else if (str.includes("hour")) {
    return new Date(now - num * 60 * 60 * 1000);
  } else if (str.includes("day")) {
    return new Date(now - num * 24 * 60 * 60 * 1000);
  } else if (str.includes("second")) {
    return new Date(now - num * 1000);
  } else {
    return now;
  }
}

function navigateToPost(id) {
  window.location.href = "postDetails.html?postId=" + id;
}

function navigateToProfile(userId) {
  window.location.href = "profile.html?userId=" + userId;
}

let createOrEdintPost = async () => {
  let token = localStorage.getItem("token");
  let postId = document.getElementById("post-id").value;
  let inpTitle = document.getElementById("inpTitle");
  let inpBody = document.getElementById("inpBody");
  let Image = document.getElementById("inpPostImage").files[0];
  let formData = new FormData();
  formData.append("title", inpTitle.value);
  formData.append("body", inpBody.value);
  if (Image) formData.append("image", Image);
  postId ? formData.append("_method", "put") : ``;
  let response = await axios.post(
    `https://tarmeezacademy.com/api/v1/posts${postId ? `/${postId}` : ``}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
  return response;
};

const isImageUrlValid = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

let getUser = async (userId) => {
  let response = await axios.get(
    `https://tarmeezacademy.com/api/v1/users/${userId}`
  );
  return response.data.data;
};

let getPosts = async (id) => {
  if (!id) {
    // handle logout in profile page
    if (
      !localStorage.getItem("token") &&
      window.location.pathname.includes("profile.html")
    )
      return;
    let response = await axios.get(
      "https://tarmeezacademy.com/api/v1/posts?page=" + currentPage
    );

    if (currentPage <= lastPage) {
      let posts = response.data.data;
      lastPage = response.data.meta.last_page;
      return posts;
    }
  } else {
    let response = await axios.get(
      `https://tarmeezacademy.com/api/v1/users/${id}/posts`
    );
    let posts = response.data.data;
    return posts;
  }
};

let getTokenLogin = async () => {
  let inpUsername = document.getElementById("inpUsername");
  let inpPassword = document.getElementById("inpPassword");

  try {
    let response = await axios.post(
      "https://tarmeezacademy.com/api/v1/login",
      {
        username: inpUsername.value,
        password: inpPassword.value,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

let getTokenRegister = async () => {
  let image = document.getElementById("user-profile-image").files[0];
  let inpUsername = document.getElementById("inpUsernameRegister");
  let inpName = document.getElementById("inpNameRegister");
  let inpPassword = document.getElementById("inpPasswordRegister");
  let formData = new FormData();
  if (image) formData.append("image", image);
  formData.append("username", inpUsername.value);
  formData.append("name", inpName.value);
  formData.append("password", inpPassword.value);
  try {
    let response = await axios.post(
      "https://tarmeezacademy.com/api/v1/register",
      formData,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

let deletePost = async () => {
  let postId = document.getElementById("del-post-id").value;
  let token = localStorage.getItem("token");
  let response = axios.delete(
    "https://tarmeezacademy.com/api/v1/posts/" + postId,

    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

function deleteBtnClicked(postId) {
  document.getElementById("del-post-id").value = postId;
}

let showPosts = async (reload, id = 0) => {
  showLoading(true);
  if (window.location.pathname.includes("profile.html")) {
    id = getUserIdFromURL()
      ? getUserIdFromURL()
      : JSON.parse(localStorage.getItem("user"))
      ? JSON.parse(localStorage.getItem("user")).id
      : 0;
  }

  let posts = await getPosts(id);
  showLoading(false);

  if (!posts || posts.length == 0) {
    postsContainer.innerHTML = "No Posts Exist";
    postsContainer.classList.add("text-secondary", "fw-bolder", "fs-1");
    return;
  }
  postsContainer.classList.remove("text-secondary", "fw-bolder", "fs-1");
  posts.sort(
    (a, b) => parseRelativeTime(b.created_at) - parseRelativeTime(a.created_at)
  );
  let userId = 0;
  if (localStorage.getItem("token")) {
    userId = JSON.parse(localStorage.getItem("user")).id;
  }
  if (reload) postsContainer.innerHTML = "";
  for (post of posts) {
    let postUserId = post.author.id;
    postsContainer.innerHTML += ` 
    <div class="card post w-100 shadow mb-4" >
            <div class="card-header d-flex justify-content-between">
                <div class ="user-info" style ="cursor:pointer;" onclick ="navigateToProfile(${
                  post.author.id
                })">
                      <img
                    src="${
                      typeof post.author.profile_image == "object" ||
                      !(await isImageUrlValid(post.author.profile_image))
                        ? `image/profile.webp`
                        : post.author.profile_image
                    }"
                    class="rounded-circle border border-1 border-secondary border-opacity-50"
                    width="35px"
                    height="35px"
                  />
                  <span class="ms-1 fw-bold">${post.author.name}</span>
                </div>
                <div class = "control-btns ">${
                  userId === postUserId
                    ? `<button class ="btn btn-success fw-bold" onclick ="editPostBtnClick('${encodeURIComponent(
                        JSON.stringify(post)
                      )}')">Edit</button>
                      <button class ="btn btn-danger fw-bold" data-bs-toggle="modal" data-bs-target="#deletePostMoal" onclick = "deleteBtnClicked(${
                        post.id
                      })">Delete</button>
                      `
                    : ``
                } </div>
                
            </div>
            
            
             
            <div class="card-body" style = "cursor:pointer;" onclick= "navigateToPost(${
              post.id
            })" >
            ${
              typeof post.image !== "string"
                ? ``
                : `<img src = "${post.image}" class ="p-2 w-100 " style = "max-height: 494px;" />`
            }
              <span class="text-secondary">${post.created_at}</span>
              <p class="card-text mt-2 fw-bold">
                ${post.title ? post.title : ""}
              </p>
              <p class="card-text mt-2">
                ${post.body}
              </p>
              <hr />
              <div class="actions d-flex gap-2 align-items-center">
                <i class="fa-solid fa-pen fs-5 opacity-50"></i>
                <span class="fw-semibold">(${
                  post.comments_count
                }) Comments</span>
                ${
                  post.tags.length
                    ? post.tags
                        .map(
                          (tag) =>
                            `<span class="badge text-bg-success">${tag.name}</span>`
                        )
                        .join("")
                    : ``
                }
               
              </div>
            </div>
          </div>
    `;
  }
};

function showToast(success, message) {
  const toastLiveExample = document.getElementById("liveToast");
  let toastBody = document.querySelector(".toast-body");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  if (success) {
    toastLiveExample.classList.add("bg-success");
    if (toastLiveExample.classList.contains("bg-danger")) {
      toastLiveExample.classList.remove("bg-danger");
    }
  } else {
    toastLiveExample.classList.add("bg-danger");
    if (toastLiveExample.classList.contains("bg-success")) {
      toastLiveExample.classList.remove("bg-success");
    }
  }
  toastBody.innerText = message;
  toastBootstrap.show();
}

function disappearModal(name) {
  let myModalEl = document.getElementById(name);
  let modal = bootstrap.Modal.getOrCreateInstance(myModalEl);
  modal.hide();
}

function editPostBtnClick(strPost) {
  let post = JSON.parse(decodeURIComponent(strPost));

  document.getElementById("post-id").value = post.id;

  document.getElementById("createPostHeader").innerText = "Edit Post";
  document.getElementById("inpTitle").value = post.title;
  document.getElementById("inpBody").value = post.body;
  let modal = new bootstrap.Modal(document.getElementById("CreatePostModal"));
  document.getElementById("btnConfirmPost").innerText = "Edit";
  modal.toggle();
}

function createPostBtnClick(id) {
  document.getElementById("createPostHeader").innerText = "Create New Post";
  document.getElementById("btnConfirmPost").innerText = "Create";
  document.getElementById("inpTitle").value = "";
  document.getElementById("post-id").value = "";
  document.getElementById("inpBody").value = "";
  document.getElementById("inpPostImage").value = "";
  let modal = new bootstrap.Modal(document.getElementById("CreatePostModal"));
  modal.toggle();
}

function showLoading(show) {
  let loading = document.getElementById("loading");
  if (show) {
    loading.classList.remove("d-none");
  } else loading.classList.add("d-none");
}

// register
document
  .getElementById("btnConfirmRegister")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("inpNameRegister");
    const usernameInput = document.getElementById("inpUsernameRegister");
    const passwordInput = document.getElementById("inpPasswordRegister");
    nameInput.classList.remove("is-invalid");
    usernameInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    document.getElementById("errUsernameRegister").textContent = "";
    document.getElementById("errPasswordRegister").textContent = "";
    document.getElementById("errNameRegister").textContent = "";
    try {
      showLoading(true);
      let response = await getTokenRegister();
      showLoading(false);

      if (response.status == 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.pathname.includes("postDetails.html")
          ? showPost()
          : showPosts(true);
        showToast(true, "Register Successfully!!");
        disappearModal("registerModal");
        updateUi();
      }
    } catch (error) {
      showLoading(false);
      let errMsg = "Something went wrong";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errMsg = error.response.data.message;
      }

      if (
        errMsg.toLowerCase().includes("name") &&
        !errMsg.toLowerCase().includes("username")
      ) {
        usernameInput.classList.add("is-invalid");
        document.getElementById("errUsernameRegister").textContent = errMsg;
      } else if (errMsg.toLowerCase().includes("username")) {
        nameInput.classList.add("is-invalid");
        document.getElementById("errNameRegister").textContent = errMsg;
      } else if (errMsg.toLowerCase().includes("password")) {
        passwordInput.classList.add("is-invalid");
        document.getElementById("errPasswordRegister").textContent = errMsg;
      } else {
        usernameInput.classList.add("is-invalid");
        document.getElementById("errUsernameRegister").textContent = errMsg;
      }

      console.error("Register failed:", errMsg);
    }
  });

// login
document
  .getElementById("btnConfirmLogin")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("inpUsername");
    const passwordInput = document.getElementById("inpPassword");
    usernameInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    document.getElementById("errUsername").textContent = "";
    document.getElementById("errPassword").textContent = "";
    try {
      showLoading(true);
      let response = await getTokenLogin();
      showLoading(false);

      if (response.status == 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.pathname.includes("postDetails.html")
          ? showPost()
          : showPosts(true);

        showToast(true, "Login Successfully");
        disappearModal("loginModal");
        updateUi();
      }
    } catch (error) {
      showLoading(false);
      let errMsg = "Something went wrong";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errMsg = error.response.data.message;
      }

      if (errMsg.toLowerCase().includes("username")) {
        usernameInput.classList.add("is-invalid");
        document.getElementById("errUsername").textContent = errMsg;
      } else if (errMsg.toLowerCase().includes("password")) {
        passwordInput.classList.add("is-invalid");
        document.getElementById("errPassword").textContent = errMsg;
      } else {
        usernameInput.classList.add("is-invalid");
        document.getElementById("errUsername").textContent = errMsg;
      }

      console.error("Login failed:", errMsg);
    }
  });

// logout
document.querySelector(".btnLogout").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.pathname.includes("postDetails.html")
    ? showPost()
    : showPosts(true);
  showToast(false, "Logout Done");
  updateUi();
});

// confirm create / edit post
if (document.getElementById("btnConfirmPost"))
  document
    .getElementById("btnConfirmPost")
    .addEventListener("click", async () => {
      const inpBody = document.getElementById("inpBody");
      inpBody.classList.remove("is-invalid");
      document.getElementById("errPostBody").textContent = "";

      try {
        showLoading(true);
        let response = await createOrEdintPost();
        showLoading(false);

        let userId = JSON.parse(localStorage.getItem("user")).id;
        if (response.status == 201) {
          disappearModal("CreatePostModal");
          showToast(true, "Post Added Successfully");
          isPostPage
            ? await showPost()
            : window.location.pathname.includes("profile.html")
            ? await showPosts(true, userId)
            : await showPosts(true);
          updateUi();
        } else if (response.status == 200) {
          disappearModal("CreatePostModal");
          showToast(true, "Post Edited Successfully");
          isPostPage
            ? await showPost()
            : window.location.pathname.includes("profile.html")
            ? await showPosts(true, userId)
            : await showPosts(true);
          updateUi();
        }
      } catch (error) {
        let errMsg = "Something went wrong";

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errMsg = error.response.data.message;
        }

        if (errMsg.toLowerCase().includes("body")) {
          inpBody.classList.add("is-invalid");
          document.getElementById("errPostBody").textContent = errMsg;
        }

        console.error("Creating post failed:", errMsg);
      }
    });

// confirm delete post
if (document.getElementById("btnConfirmDeletePost"))
  document
    .getElementById("btnConfirmDeletePost")
    .addEventListener("click", async () => {
      try {
        showLoading(true);
        await deletePost();
        showLoading(false);

        if (window.location.pathname.includes("index.html")) {
          showPosts(true);
          disappearModal("deletePostMoal");
        } else if (window.location.pathname.includes("profile.html")) {
          showPosts(true, JSON.parse(localStorage.getItem("user")).id);
          updateUserProfile();
          disappearModal("deletePostMoal");
        } else {
          disappearModal("deletePostMoal");
          window.location.href = "index.html";
        }
        showToast(true, "Post Deleted Successfully!");
      } catch (error) {
        showToast(false, error.response.data.message);
      }
    });
