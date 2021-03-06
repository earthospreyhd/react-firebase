<template>
  <div>
    <div class="project-info" v-if="project">
      <div class="project-header">
        <h1 class="project-title">{{ project.title }}</h1>
        <div class="project-author">
          Project owned by
          <a
            @click="goToPage(`/profile/${project.userID}`)"
            class="profile-link"
          >
            {{ project.userName }}
          </a>
          <!-- TODO - Add else here for when profile pic hasn't loaded yet -->
          <span class="profile-overflow">
            <img
              :src="profilePicURL"
              alt="profile picture"
              class="profile-picture"
              v-if="profilePicURL"
            />
          </span>
          <p class="edit-link" @click="goToProjectEdit" v-if="userIsOwner">
            Edit Project
          </p>
        </div>
      </div>
      <div>
        <div class="card">
          <h3 class="underline">About:</h3>
          {{ project.desc }}
        </div>
        <button
          v-if="userIsAuth && !userIsOwner"
          @click="expressInterest = true"
          class="button expressInterest"
        >
          Message the Owner
        </button>
        <div class="comments">
          <textarea
            v-if="expressInterest"
            type="text"
            v-model="newcomment"
            placeholder="Outline how you will contribute"
            class="input newcomment"
          ></textarea>
          <button
            class="button send-offer"
            v-if="expressInterest"
            @click="sendOffer"
          >
            Send to Project Manager
          </button>
          <h2 v-if="expressSuccess">Successfully sent message</h2>
          <div class="comments" v-if="projectComments != null && userIsOwner">
            <h2>Your Offers:</h2>
            <div
              class="comment"
              v-for="comment in projectComments"
              :key="comment.userID"
            >
              <div :key="comment.userID" class="comment-name">
                <a>
                  {{ comment.username }}
                </a>
                <div class="comment-buttons" v-if="userIsOwner">
                  <a
                    class="accept-offer offer-buttons button"
                    @click="acceptOffer(comment.userID)"
                    >View profile</a
                  >
                  <a
                    class="deny-offer offer-buttons button"
                    @click="denyOffer(comment.userID)"
                    >Delete Offer</a
                  >
                </div>
              </div>
              <p>{{ comment.comment }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="project-details card">
        <h3 class="underline">Categories:</h3>
        <p v-for="category in project.categories" :key="category">
          {{ category }}
        </p>
        <h3 class="underline overline">Tags:</h3>
        <p v-for="tag in project.tags" :key="tag">
          {{ tag }}
        </p>
      </div>

      <br />
    </div>
  </div>
</template>

<script>
import store from "@/Vuex/store";
import { getProjectFromDB } from "@/firebase/firebase";
import { getProfilePictureURL } from "@/firebase/firebase";
import { expressInterest } from "@/firebase/firebase";
import { getProjectComments } from "@/firebase/firebase";
import { deleteComment } from "@/firebase/firebase";
export default {
  data() {
    return {
      project: null,
      profilePicURL: "",
      expressInterest: false,
      newcomment: "",
      expressSuccess: false,
      projectComments: null
    };
  },
  computed: {
    userIsAuth() {
      return store.state.userIsAuth;
    },
    userIsOwner() {
      return this.project.userID == store.state.userID;
    }
  },
  mounted() {
    this.setProject();
  },
  methods: {
    acceptOffer(uid) {
      this.goToPage(`/profile/${uid}`);
    },
    denyOffer(uid) {
      deleteComment(this.project.id, uid)
        .then(() => {
          console.log("deleted comment");
          // Removed comment from page on delete
          for (let index in this.projectComments) {
            if (this.projectComments[index].userID == uid) {
              this.projectComments.splice(index, 1);
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    goToPage(url) {
      this.$router.push(url);
    },
    goToProjectEdit() {
      store.commit("setPassThrough", this.project);
      this.$router.push(`/editproject/${this.project.id}`);
    },
    getPicURL() {
      getProfilePictureURL(this.project.userID).then(url => {
        this.profilePicURL = url;
      });
    },
    sendOffer() {
      console.log("sending offer");
      expressInterest(this.project.id, this.newcomment)
        .then(() => {
          this.expressSuccess = true;
        })
        .catch(error => {
          console.log(error);
        });
    },
    setProject() {
      const passThrough = store.state.passThrough;
      if (passThrough) {
        this.project = passThrough;
        getProjectComments(passThrough.id)
          .then(comments => {
            this.projectComments = comments;
          })
          .catch(error => {
            console.log(error);
          });
        this.getPicURL();
      } else {
        getProjectFromDB(this.$route.params.projectID)
          .then(project => {
            this.project = project;
            getProjectComments(project.id)
              .then(comments => {
                this.projectComments = comments;
              })
              .catch(error => {
                console.log(error);
              });

            this.getPicURL();
          })
          .catch(error => {
            console.log("There was an error" + error);
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.accept-offer {
  background-color: rgb(19, 206, 102);
}
.deny-offer {
  background-color: #f56c6c;
}
.offer-buttons {
  padding: 10px;
  border: none;
  margin: 0 5px 0 5px;
}
.comment-buttons {
  float: right;
}
.comment {
  margin-top: 20px;
  text-align: left;
  border: 1px solid #ebeef5;
  padding: 0 20px 20px 20px;
  border-radius: 4px;
}
.comment-name {
  padding: 15px 0 15px 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 20px;
}
.edit-link {
  float: right;
  color: #409eff;
}
.edit-link:hover {
  cursor: pointer;
}
.project-details {
  text-align: center !important;
}
.about-project {
  display: inline-grid;
}
.profile-link {
  color: #409eff;
}
.profile-link:hover {
  cursor: pointer;
}
.expressInterest {
  margin: 15px 0 15px 0;
}
.newcomment {
  width: 100%;
  display: block;
}
.send-offer {
  margin-top: 15px;
}
.card-header {
  padding: 18px 20px;
}
.project-info {
  display: inline-grid;
  grid-template-columns: 5fr 2fr;
  grid-row-gap: 30px;
  grid-column-gap: 15px;
  width: 75%;
}
.card {
  width: 96%;
  display: inline-block;
  background-color: white;
  text-align: left;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 0 2% 2% 2%;
}
.project-author {
  text-align: left;
}
.project-title {
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}
.project-header {
  grid-column: 1/3;
}
.profile-overflow {
  border-radius: 50%;
  border: 1px solid #ebeef5;
  height: 27px;
  width: 27px;
  overflow: hidden;
  display: inline-block;
  text-align: center;
  vertical-align: bottom;
}
.profile-picture {
  max-width: 25px;
  height: 25px;
  display: inline-block;
}
.profile-footer {
  float: right;
}
</style>
