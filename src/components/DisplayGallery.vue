<template lang="html">
  <div class="gallery">
    <!-- Add Image Modal -->
    <BModal id="addimage" hide-footer :title="$t('displays.addImage')">
      <BForm>
        <div
          class="mb-3 p-3 border rounded text-center"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="form-control"
            style="display: none"
            @change="handleFileChange"
          />

          <div v-if="file">
            <strong>Selected file:</strong> {{ file.name }}
          </div>
          <div v-else class="text-muted">
            Choose an image or drop it here...
          </div>

          <BButton class="mt-2" variant="primary" @click="triggerFileSelect">
            Select Image
          </BButton>
        </div>

        <BButton
          class="float-right mt-1"
          variant="primary"
          :disabled="!file"
          @click="uploadImages"
        >
          Upload
        </BButton>
      </BForm>
    </BModal>

    <!-- Carousel -->
    <div>
      <BCarousel
        v-if="!uploading"
        id="display-gallery"
        v-model="selected"
        :interval="edit ? 0 : 4000"
        :controls="imageIndex.length > 1"
        :indicators="imageIndex.length > 1"
        fade
        img-height="300"
        background="black"
      >
        <template v-if="imageIndex.length > 0">
          <BCarouselSlide
            v-for="(image, index) in imageIndex"
            :key="index"
          >
            <template #img>
              <BImg
                class="d-block"
                height="300"
                :src="toUrl(image.image)"
                center
              />
            </template>
          </BCarouselSlide>
        </template>

        <BCarouselSlide caption="No Image" img-alt="No Images" img-height="300">
          <p>
            Please add some images of your display if you intend to make it public.
          </p>
          <template #img>
            <BImg
              class="d-block"
              height="300"
              src="data:image/svg+xml;charset=UTF-8,..."
              center
            />
          </template>
        </BCarouselSlide>
      </BCarousel>
    </div>

    <!-- Edit Buttons -->
    <div class="mt-1" style="display: flex; justify-content: center;">
      <BButtonGroup v-if="edit" class="mx-1" size="sm">
        <BButton
          v-if="imageIndex.length > 0"
          variant="danger"
          @click="deleteImage(imageIndex[selected])"
        >
          Delete
        </BButton>
        <BButton variant="primary" v-b-modal:addimage>
          {{ $t('displays.addImage') }}
        </BButton>
      </BButtonGroup>
    </div>
  </div>
</template>
<script>
// import 'vue-awesome/icons/chevron-left'
// import 'vue-awesome/icons/chevron-right'
import {
  BModal,
  BForm,
  BButton,
  BButtonGroup,
  BCarousel,
  BCarouselSlide,
  BImg
} from 'bootstrap-vue-next' 
export default {
  components: {
    BModal,
    BForm,
    BButton,
    BButtonGroup,
    BCarousel,
    BCarouselSlide,
    BImg,
  },
  props: {
    displayId: {
      type: Number,
      required: true
    },
    edit: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      imageIndex: [],
      selected: 0,
      file: null,
      uploading: false,
    }
  },
  watch: {
    displayId() {
      this.fetchImageIndex()
    }
  },
  mounted() {
    this.fetchImageIndex()
  },
  methods: {
    fetchImageIndex() {
      let url = 'v1/displays/' + this.displayId + '/images'
      this.$axios.get(url).then(
        (response) => {
          this.imageIndex = response.data.data
          this.fetchImages()
        },
        () => {
          this.imageIndex.splice(0, this.imageIndex.length)
        }
      )
    },
    fetchImages() {
      for (let item of this.imageIndex) {
        let url = process.env.VUE_APP_API_ROOT + item.uri
        this.$axios.get(url, {
          responseType: 'blob'
        }).then(
          (response) => {
            item.image = response.data
            this.$forceUpdate()
            this.uploading = false
          },
          () => {}
        )
      }
    },
    toUrl(blob) {
      if (typeof (blob) !== 'undefined') {
        let urlCreator = window.URL || window.webkitURL
        return urlCreator.createObjectURL(blob)
      } else {
        return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20%25%7Bw%7D%20%25%7Bh%7D%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20style%3D%22fill%3Atransparent%3B%22%3E%3C%2Frect%3E%3C%2Fsvg%3E"
      }
    },
    deleteImage(item) {
      this.uploading = true
      let url = process.env.VUE_APP_API_ROOT + item.uri
      this.$axios.delete(url).then(
        () => {
          this.$notifications.add({
            title: 'Success',
            type: 'success',
            body: item.filename + ' was successfully deleted',
            timeout: true
          })
          this.fetchImageIndex()
        },
        () => {
          this.fetchImageIndex()
          this.$notifications.add({
            title: 'Error',
            type: 'warning',
            body: 'There was a problem deleting that image.',
            timeout: true
          })
        }
      )
    },
    uploadImages() {
      this.uploading = true
      // for (let file of this.files) {
      let form = new FormData();
      // for (let file of this.files) {
      form.append('file', this.file, this.file.name);
      //}
      this.$axios.post(process.env.VUE_APP_API_ROOT + '/api/v1/displays/' + this.displayId + '/images', form).then(response => {
        console.log(response)
        this.file = null
        this.fetchImageIndex()
        this.$bvModal.hide('addimage')
      }).catch(error => {
        this.fetchImageIndex()
        console.log(error)
      })
      // }
    },
  }
}
</script>

<style lang="scss" scoped>
/* .gallery {
  height: 450px;
} */ /* TODO: why is this FIXED HEIGHT? */


.gallery-top {
  height: 60% !important;
  width: 100%;

  .preview {
    max-height: 100%;
    max-width: 100%;
    margin: auto;
  }
}

.gallery-thumbs {
  height: 20% !important;
  box-sizing: border-box;

  .thumbnail {
    height: 100%;
    position: relative;
    overflow: hidden;

    img {
      height: 100%;
      padding-top: 5px;
    }

    &:hover {
      img {
        opacity: 0.5;
      }

      .remove {
        visibility: visible;
        filter: invert(50%);
      }
    }

    .remove {
      color: white;
      cursor: pointer;
      visibility: visible;
      position: absolute;
      right: 0;
      top: 0;
    }
  }

  .add-image {
    position: relative;
    background-color: #e9e9e9;
    cursor: pointer;
    height: 100%;
    width: 100%;
    // display: inline;
    justify-content: center;
    align-items: center;
    margin-left: auto;
    margin-right: auto;
  }
}


.padding {
  padding-bottom: 15px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  // opacity: 0;
  z-index: 9999;
  display: flex;
}

.overlay-button-left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 50%;
  opacity: 0;
  z-index: 9999;
  background-color: black;
}

.overlay-button-right {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  right: auto;
  height: 100%;
  width: 50%;
  opacity: 0;
  z-index: 9999;
  background-color: black;
}

</style>
