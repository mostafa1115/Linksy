let urlParams = new URLSearchParams(window.location.search);
let id = urlParams.get("postId");
let isPostPage = true;
let getPost = async () => {
  let response = await axios.get(
    "https://tarmeezacademy.com/api/v1/posts/" + id
  );

  return response;
};

let showPost = async () => {
  try {
    showLoading(true);
    let response = await getPost();
    showLoading(false);
    let token = "";
    let userId = 0;
    let post = response.data.data;
    let postsContainer = document.querySelector(".posts > div");
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
      userId = JSON.parse(localStorage.getItem("user")).id;
    }
    let postUserId = post.author.id;
    let imageHTML = "";
    if (post.image && typeof post.image === "string") {
      const valid = await isImageUrlValid(post.image);
      if (valid) {
        imageHTML = `<img src="${post.image}" class="p-2 w-100" style = "max-height: 494px;" />`;
      }
    }

    let commentsHTML = "";

    if (post.comments_count) {
      const commentPromises = post.comments.map(async (comment) => {
        const profileImage =
          typeof comment.author.profile_image === "string"
            ? comment.author.profile_image
            : "image/profile.webp";

        const validImg = await isImageUrlValid(profileImage);

        return `
      <div class="comment shadow m-3 rounded-3 bg-light p-3">
        <div class="comment-header mb-1 d-flex gap-1 align-items-center">
          <img
            src="${validImg ? profileImage : "image/profile.webp"}"
            class="rounded-circle border border-2 border-secondary border-opacity-50"
            width="30px"
            height="30px"
          />
          <span class="ms-1 fw-bold">${comment.author.name}</span>
        </div>
        <p>${comment.body}</p>
      </div>`;
      });

      const resolvedComments = await Promise.all(commentPromises);
      commentsHTML = resolvedComments.join("");
    }

    postsContainer.innerHTML = "";
    postsContainer.innerHTML = `
     <div class="card post w-100 shadow mb-4">
              <div class="card-header d-flex justify-content-between">
                  <div class = "user-info">
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
  
              <div class="card-body">
              ${imageHTML}
                
                <span class="text-secondary">${post.created_at}</span>
                <p class="card-text mt-2 fw-bold">
                  ${post.title ? post.title : ""}
                </p>
                <p class="card-text mt-2">${post.body}</p>
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
                              `<span class="badge text-bg-success">${tag}</span>`
                          )
                          .join("")
                      : ``
                  }
                 
                </div>
              </div>
              <div class="card-footer p-0">
                <div class="comments d-flex flex-column ${
                  post.comments_count ? ` py-3` : ``
                }  bg-secondary bg-opacity-25">
                  
                ${commentsHTML}
                  
                </div>
                  
                <div class="add-comment ${token ? `` : `d-none`} d-flex">
                  <input
                    id="inpComment"
                    class="form-control flex-grow-1 p-3"
                    type="text"
                    placeholder="Add a comment"
                    required
                  />
                  <div class="invalid-feedback" id="errComment"></div>
  
                  <button id="btnSendComment" class="btn btn-outline-primary p-3">
                    Send
                  </button>
                </div>
              </div>
              
              
            </div>
    `;
    const btnSendComment = document.getElementById("btnSendComment");
    if (btnSendComment) {
      btnSendComment.addEventListener("click", async () => {
        let inpComment = document.getElementById("inpComment");
        if (!inpComment.value) {
          showToast(false, "You Must Write Something");
        } else {
          try {
            showLoading(true);
            let response = await axios.post(
              `https://tarmeezacademy.com/api/v1/posts/${id}/comments`,
              {
                body: inpComment.value,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  Accept: "application/json",
                },
              }
            );
            showLoading(false);
            showPost(); // Refresh the post to show the new comment
            showToast(true, "Comment Added Successfully!");
          } catch (error) {
            showToast(false, error.response.data.message);
          }
        }
      });
    }
    return;
  } catch (error) {
    console.log(error);

    showToast(false, error.response.data.message);
  }
};

updateUi();

showPost();
