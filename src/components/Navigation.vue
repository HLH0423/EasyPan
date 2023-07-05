<template>
  <!-- 导航 -->
  <div class="top-navigation">
    <template v-if="folderList.length > 0">
      <span class="back link" @click="backParent">返回上一级</span>
      <el-divider direction="vertical" />
    </template>
    <span v-if="folderList.length == 0" class="all-file">全部文件</span>
    <span
      class="link"
      v-if="folderList.length > 0"
      @click="setCurrentFolder(-1)"
      >全部文件</span
    >
    <template v-for="(item, index) in folderList">
      <span class="iconfont icon-right"></span>
      <span
        class="link"
        v-if="index < folderList.length - 1"
        @click="setCurrentFolder(index)"
        >{{ item.fileName }}</span
      >
      <span class="text" v-if="index == folderList.length - 1">{{
        item.fileName
      }}</span>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

// 父组件传递过来的值
const props = defineProps({
  // 默认开启路由监听
  watchPath: {
    // 是否监听路由变化
    type: Boolean,
    default: true,
  },
  shareId: {
    type: String,
  },
  adminShow: {
    type: Boolean,
    default: false,
  },
});

const api = {
  // 首页 获取当前目录 获取列表 参数（path：完整路径）
  getFolderInfo: "/file/getFolderInfo",
  // 外部分享 获取目录信息 参数（shareId：分享id / path：完整路径）
  getFolderInfo4Share: "/showShare/getFolderInfo",
  // 管理员 获取当前目录 参数（path：完整路径）
  getFolderInfo4Admin: "/admin/getFolderInfo",
};

// 分类
const category = ref();
// 目录
const folderList = ref([]);
// 当前目录
const currentFolder = ref({ fileId: "0" });

// 初始化
const init = () => {
  folderList.value = [];
  currentFolder.value = { fileId: "0" };
  doCallback();
};

// 点击目录
// 父组件 Main/FolderSelect 中调用该方法,实现目录(文件及)的预览
const openFolder = (data) => {
  const { fileId, fileName } = data;
  const folder = {
    fileName: fileName,
    fileId: fileId,
  };
  folderList.value.push(folder);
  currentFolder.value = folder;
  // 设置当前路径,当点击后目录改变,路径也随之改变
  setPath();
};
defineExpose({ openFolder });

// 返回上一级
const backParent = () => {
  let currentIndex = null;
  for (let i = 0; i < folderList.value.length; i++) {
    if (folderList.value[i].fileId == currentFolder.value.fileId) {
      currentIndex = i;
      break;
    }
  }
  setCurrentFolder(currentIndex - 1);
};

// 点击导航 设置当前目录(点击目录,跳转到所点击的目录)
const setCurrentFolder = (index) => {
  if (index == -1) {
    currentFolder.value = { fileId: "0" };
    folderList.value = [];
  } else {
    currentFolder.value = folderList.value[index];
    folderList.value.splice(index + 1, folderList.value.length);
  }
  setPath();
};

// 设置当前路径,当点击后目录改变,路径也随之改变
const setPath = () => {
  if (!props.watchPath) {
    doCallback();
    return;
  }
  let pathArray = [];
  folderList.value.forEach((item) => {
    pathArray.push(item.fileId);
  });
  router.push({
    path: route.path,
    query:
      pathArray.length == 0
        ? ""
        : {
            path: pathArray.join("/"),
          },
  });
};

// 获取当前路径的目录
const getNavigationFolder = async (path) => {
  let url = api.getFolderInfo;
  if (props.shareId) {
    url = api.getFolderInfo4Share;
  }
  if (props.adminShow) {
    url = api.getFolderInfo4Admin;
  }

  let result = await proxy.Request({
    url: url,
    showLoading: false,
    params: {
      path: path,
      shareId: props.shareId,
    },
  });
  if (!result) {
    return;
  }
  folderList.value = result.data;
};

// 回调 将当前的参数传递给父组件 Main
const emit = defineEmits(["navChange"]);
const doCallback = () => {
  emit("navChange", {
    categoryId: category.value,
    curFolder: currentFolder.value,
  });
};

// 监听路由
watch(
  () => route,
  (newVal, oldVal) => {
    if (!props.watchPath) {
      return;
    }
    if (
      newVal.path.indexOf("/main") === -1 &&
      newVal.path.indexOf("/settings/fileList") === -1 &&
      newVal.path.indexOf("/share") === -1
    ) {
      return;
    }
    const path = newVal.query.path;
    const categoryId = newVal.params.category;
    category.value = categoryId;
    if (path == undefined) {
      init();
    } else {
      getNavigationFolder(path);
      let pathArray = path.split("/");
      currentFolder.value = {
        fileId: pathArray[pathArray.length - 1],
      };
      doCallback();
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.top-navigation {
  font-size: 13px;
  display: flex;
  align-items: center;
  line-height: 40px;
  .all-file {
    font-weight: bold;
  }
  .link {
    color: #06a7ff;
    cursor: pointer;
  }
  .icon-right {
    color: #06a7ff;
    padding: 0px 5px;
    font-size: 13px;
  }
}
</style>
