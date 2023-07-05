<template>
  <div class="pdf">
    <vue-pdf-embed
      ref="pdfRef"
      :source="state.url"
      class="vue-pdf-embed"
      width="850"
      :page="state.pageNum"
    ></vue-pdf-embed>
  </div>
</template>

<script setup>
import VuePdfEmbed from "vue-pdf-embed";
import { ref, reactive, getCurrentInstance, onMounted } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
  },
});

const state = ref({
  // 预览pdf文件地址
  url: "",
  // 当前页面
  pageNum: 0,
  // 总页数
  numPages: 0,
});

const initPdf = async () => {
  state.value.url = "/api" + props.url;
};

initPdf();
</script>

<style lang="scss" scoped>
.pdf {
  width: 100%;
}
</style>
