let userProfileImage = document.getElementById("user-profile-image");
let userName = document.getElementById("username-profile");
let Name = document.getElementById("name-profile");
let postsCount = document.getElementById("posts-count");
let commentsCount = document.getElementById("comments-count");
let userId = getUserIdFromURL();

function getUserIdFromURL() {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("userId");
}
isPostPage = false;
async function main() {
  let user = null;
  if (!userId) {
    user = JSON.parse(localStorage.getItem("user"));
    document.getElementById("btnCreatePost").classList.remove("d-none");
  } else {
    user = await getUser(userId);
    document.getElementById("btnCreatePost").classList.add("d-none");
  }
  updateUi();

  try {
    if (user) showPosts(true, user.id);
  } catch (error) {
    console.error("Failed to load posts:", error);
  }
}
async function updateUserProfile() {
  if (!userId) {
    let token = localStorage.getItem("token");
    if (!token) {
      document.querySelector(".empty-user").classList.remove("d-none");
      document.querySelector(".posts").classList.add("d-none");
      document.querySelector(".profile-box").classList.add("d-none");
      return;
    }
    document.querySelector(".empty-user").classList.add("d-none");
    document.querySelector(".posts").classList.remove("d-none");
    document.querySelector(".profile-box").classList.remove("d-none");
    user = await getUser(JSON.parse(localStorage.getItem("user")).id);

    typeof user.profile_image !== "string"
      ? (userProfileImage.src = "image/profile.webp")
      : (userProfileImage.src = user.profile_image);

    userName.innerText = user.username;
    Name.innerText = user.name;
    postsCount.innerText = user.posts_count;
    commentsCount.innerText = user.comments_count;
  } else {
    document.querySelector(".empty-user").classList.add("d-none");
    document.querySelector(".posts").classList.remove("d-none");
    document.querySelector(".profile-box").classList.remove("d-none");
    user = await getUser(userId);

    typeof user.profile_image !== "string"
      ? (userProfileImage.src = "image/profile.webp")
      : (userProfileImage.src = user.profile_image);

    userName.innerText = user.username;
    Name.innerText = user.name;
    postsCount.innerText = user.posts_count;
    commentsCount.innerText = user.comments_count;
  }
}
main();
