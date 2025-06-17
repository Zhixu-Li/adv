<!--
some implementation notes:
 - files[] is tracked by index, as it is a v-model prop used by bootstrap
 - all other things track by files[].filename
 - vue does not correctly reactify array elements, so we use objects
  - vue seems to be having a lot trouble observing objects in this code without using $set
 - checkLoop runs every second for every file currently "processing", can scale badly
 - nerkmid supports multiple files per "job" but we are not doing that yet
-->
<template lang="html">
  <BRow>
    <BCol cols="12">
      <BRow>
        <BCol class="text-center">
          Active Team: <em>{{ activeTeam.name }}</em>
        </BCol>
      </BRow>
      <BRow>
        <BCol cols="12">
          <BFormFile
            v-model="files"
            multiple
            :disabled="queue.length > 0"
            accept="audio/*, image/*, video/*"
            placeholder="Choose a file or drop it here..."
            dropPlaceholder="Drop file here..."
            :fileNameFormatter="formatNames"
          />
          <h5 v-if="files.length > 0" class="m-2">Selected Files:</h5>
          <BListGroup class="mt-2">
            <BListGroupItem
              v-for="file in files"
              :key="file.name"
              class="d-flex align-items-center"
            >
              <BAvatar
                v-if="status[file.name] === 'pending'"
                variant="light"
                icon="clock"
              />
              <BAvatar
                v-else-if="status[file.name] === 'completed'"
                variant="success"
                icon="check-square"
              />
              <BAvatar
                v-else-if="status[file.name] === 'error'"
                variant="danger"
                icon="x-circle"
              />
              <BAvatar
                v-else-if="status[file.name] === 'uploading'"
                variant="light"
              >
                <font-awesome-icon
                  icon="cloud-arrow-up"
                  class="text-primary h3 align-bottom pt-1 cylon-vertical"
                />
              </BAvatar>
              <BAvatar
                v-else-if="status[file.name] === 'processing'"
                variant="light"
              >
                <font-awesome-icon
                  icon="arrow-rotate-right"
                  class="text-primary h3"
                  spin
                />
              </BAvatar>

              <BCol cols="9">
                <div>{{ file.name }}</div>
                <template v-if="status[file.name] === 'error'">
                  <em>an error occurred when uploading :(</em>
                </template>
                <template v-else>
                  <BProgress
                    v-if="status[file.name] === 'uploading' || status[file.name] === 'pending'"
                    :value="progress[file.name]"
                    max="100"
                    class="mb-2 mt-1"
                  />
                  <BProgress
                    v-else-if="status[file.name] === 'processing'"
                    variant="danger"
                    :value="remote[file.name]"
                    max="100"
                    class="mb-2 mt-1"
                  />
                </template>
              </BCol>

              <BCol cols="1" class="m-0 p-0">
                <div>({{ (file.size / 1024 / 1024).toFixed(1) }}MB)</div>
                <BBadge
                  v-if="status[file.name] === 'uploading'"
                  href="#"
                  variant="warning"
                  pill
                  @click="cancelFile(file.name)"
                >
                  CANCEL
                </BBadge>
                <BBadge
                  v-else-if="status[file.name] === 'completed'"
                  href="#"
                  variant="dark"
                  pill
                  @click="removeFile(file.name)"
                >
                  REMOVE
                </BBadge>
                <BBadge
                  v-else-if="status[file.name] === 'processing'"
                  href="#"
                  variant="dark"
                  pill
                />
                <BBadge
                  v-else-if="!queue.length"
                  href="#"
                  variant="danger"
                  pill
                  @click="removeFile(file.name)"
                >
                  REMOVE
                </BBadge>
              </BCol>
            </BListGroupItem>
          </BListGroup>

          <BButton
            :disabled="queue.length > 0"
            variant="success"
            class="mt-4 col-3 btn-block mx-auto"
            @click="upload"
          >
            Upload
          </BButton>
        </BCol>
      </BRow>
    </BCol>
  </BRow>
</template>

<script>
// import 'vue-awesome/icons/plus'
// import 'vue-awesome/icons/video'
// import 'vue-awesome/icons/music'
// import 'vue-awesome/icons/image'
// import 'vue-awesome/icons/upload'
import teamContext from '@/mixins/teamContext'
import axios from 'axios'
import {
  BRow,
  BCol,
  BFormFile,
  BListGroup,
  BListGroupItem,
  BAvatar,
  BProgress,
  BBadge,
  BButton
} from 'bootstrap-vue-next'
export default {
  components: {
    BRow,
    BCol,
    BFormFile,
    BListGroup,
    BListGroupItem,
    BAvatar,
    BProgress,
    BBadge,
    BButton,
    
  },
  mixins: [teamContext],
  data () {
    return {
      files: [],
      progress: {},
      status: {},
      queue: {},
      remote: {},
    }
  },
  watch: {
    files() {
      for (let file of this.files) {
        if (this.progress[file.name] === undefined) {
          // this.$set(this.progress, file.name, Number(0))
          // this.$set(this.remote, file.name, Number(0))
          // this.$set(this.status, file.name, 'pending')
          this.progress[file.name] = 0
          this.remote[file.name] = 0
          this.status[file.name] = 'pending'
        }
      }
    },
    queue() {
      // console.log(JSON.stringify(this.queue))
    }
  },
  mounted () {
  },
  methods: {
    formatNames() {
      return this.files.length === 1 ? this.files[0].name : `${this.files.length} files selected`
    },
    upload() {
      for (let file of this.files) {
        if (this.status[file.name] != 'completed') {
          // set up cancel() function
          const CancelToken = axios.CancelToken;
          const source = CancelToken.source();

          // nerkmid supports multiple files but we aren't doing that yet
          let body = new FormData();
          body.append('file', file);
          body.append('teamId', this.activeTeam.id);

          // this.$set(this.status, file.name, 'uploading')
          this.status[file.name]='uploading'
          this.queue[file.name] = [axios.post(process.env.VUE_APP_UPLOAD_ENDPOINT, body, 
          {
            cancelToken: source.token,
            headers: {
              'content-type': 'multipart/form-data'
            },
              onUploadProgress: (progressEvent) => {
                let percent = parseInt(progressEvent.loaded / progressEvent.total * 100)
                // this.$set(this.progress, file.name, percent)
                this.progress[file.name]=percent
              },
          })
          .then(
            response => {
              if (response.data.status != "error") {
                // initial upload passed without throwing mime errors etc
                // this.$set(this.status, file.name, 'processing')
                this.status[file.name]='processing'
                let checkLoop = () => {
                  axios.get(process.env.VUE_APP_UPLOAD_POLL_ENDPOINT, {
                    params: {
                      hash: response.data.data.hashes[0].hash
                    }
                  })
                  .then((response) => {
                      if (response.data.status == 'success') {
                        // this.$set(this.status, file.name, 'completed')
                        this.status[file.name] = 'completed'
                  
                        this.$emit('updated')
                      }
                      else if (response.data.status == 'error') {
                        // this.$set(this.status, file.name, 'error')
                        this.status[file.name]='error'
                      }
                      else {
                        // this.$set(this.remote, file.name, response.data.progress)
                        this.remote[file.name]=response.data.progress
                        setTimeout(() => checkLoop(), 1000)
                      }
                    })
                  .catch((response) => {
                      console.log(response)
                      // this.$set(this.status, file.name, 'error')
                      this.status[file.name] = 'error'
                  })
                }
                checkLoop()
              }
              else {
                // probably invalid file type error
                // this.$set(this.status, file.name, 'error')
                this.status[file.name]='error'
              }
              delete this.queue[file.name]
          })
          .catch(
            error_response => {
              if (error_response.message != undefined) {
                // this.$set(this.status, file.name, 'error')
                this.status[file.name]='error'
                delete this.queue[file.name]
              }
          }), source]
        }
      }
    },
    cancelFile(name) {
      this.queue[name][1].cancel();
      // this.$set(this.progress, name, 0);
      this.progress[name]=0;
       // this.$set(this.status, name, 'pending');
      this.status[name]='Pending';
     
      delete this.queue[name]
    },
    removeFile(name) {
      for (let file in this.files) {
        if (this.status[this.files[file].name] != 'completed') {
          this.progress[this.files[file].name] = Number(0)
        }
        if (this.files[file].name == name) {
          delete this.progress[this.files[file].name]
          delete this.status[this.files[file].name]
          delete this.queue[this.files[file].name]
          delete this.remote[this.files[file].name]
          this.files.splice(file, 1)
        }
      }
    },
  }
}
</script>

<style lang="scss">
// @import "node_modules/bootstrap/scss/_functions.scss";
// @import "node_modules/bootstrap/scss/_variables.scss";
// @import "node_modules/bootstrap/scss/mixins/_breakpoints.scss";
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/bootstrap";
@keyframes cylon-vertical {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cylon-vertical {
  animation: cylon-vertical 1s ease-in-out infinite;
}

</style>
