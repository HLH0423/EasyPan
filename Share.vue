<template>
  <div class="share">
    <div class="header">
      <div class="header-content">
        <div class="logo" @click="jump">
          <span class="iconfont icon-pan"></span>
          <span class="name">Easy云盘</span>
        </div>
      </div>
    </div>
    <div class="share-body">
      <template v-if="Object.keys(shareInfo).length == 0">
        <div
          v-loading="Object.keys(shareInfo).length == 0"
          class="loading"
        ></div>
      </template>
      <template v-else>
        <div class="share-panel">
          <div class="share-user-info">
            <div class="avatar">
              <Avatar
                :userId="shareInfo.userId"
                :avatar="shareInfo.avatar"
                :width="50"
              ></Avatar>
            </div>
            <div class="share-info">
              <div class="user-info">
                <span class="nick-name">{{ shareInfo.nickName }} </span>
                <span class="share-time">分享于 {{ shareInfo.shareTime }}</span>
              </div>
              <div class="file-name">分享文件：{{ shareInfo.fileName }}</div>
            </div>
          </div>
          <div class="share-op-btn">
            <el-button
              type="primary"
              v-if="shareInfo.currentUser"
              @click="cancelShare"
              ><span class="iconfont icon-cancel"></span>取消分享</el-button
            >
            <el-button
              v-else
              type="primary"
              :disabled="selectFileIdList.length == 0"
              @click="save2MyPan"
              ><span class="iconfont icon-import"></span
              >保存到我的网盘</el-button
            >
          </div>
        </div>
        <!--导航-->
        <Navigation
          ref="navigationRef"
          @navChange="navChange"
          :shareId="shareId"
        ></Navigation>
        <div class="file-list">
          <Table
            :columns="columns"
            :showPagination="true"
            :dataSource="tableData"
            :fetch="loadDataList"
            :initFetch="false"
            :options="tableOptions"
            :showPageSize="false"
            @rowSelected="rowSelected"
          >
            <template #fileName="{ index, row }">
              <div
                class="file-item"
                @mouseenter="showOp(row)"
                @mouseleave="cancelShowOp(row)"
              >
                <template
                  v-if="
                    (row.fileType == 3 || row.fileType == 1) && row.status !== 0
                  "
                >
                  <icon :cover="row.fileCover"></icon>
                </template>
                <template v-else>
                  <icon
                    v-if="row.folderType == 0"
                    :fileType="row.fileType"
                  ></icon>
                  <icon v-if="row.folderType == 1" :fileType="0"></icon>
                </template>
                <span class="file-name" :title="row.fileName">
                  <span @click="preview(row)">{{ row.fileName }}</span>
                </span>
                <span class="op">
                  <span
                    v-if="row.folderType == 0"
                    class="iconfont icon-download"
                    @click="download(row.fileId)"
                    >下载</span
                  >
                  <template v-if="row.showOp && !shareInfo.currentUser">
                    <span
                      class="iconfont icon-import"
                      @click="save2MyPanSingle(row)"
                      >保存到我的网盘</span
                    >
                  </template>
                </span>
              </div>
            </template>
            <template #fileSize="{ index, row }">
              <span v-if="row.fileSize">
                {{ proxy.Utils.size2Str(row.fileSize) }}</span
              >
            </template>
          </Table>
        </div>
      </template>
      <!--选择目录-->
      <FolderSelect
        ref="folderSelectRef"
        @folderSelect="save2MyPanDone"
      ></FolderSelect>
      <!--预览-->
      <Preview ref="previewRef"> </Preview>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const api = {
  getShareLoginInfo: "/showShare/getShareLoginInfo",
  loadFileList: "/showShare/loadFileList",
  createDownloadUrl: "/showShare/createDownloadUrl",
  download: "/api/showShare/download",
  cancelShare: "/share/cancelShare",
  saveShare: "/showShare/saveShare",
};

const shareId = route.params.shareId;
const shareInfo = ref({});
const getShareInfo = async () => {
  let result = await proxy.Request({
    url: api.getShareLoginInfo,
    showLoading: false,
    params: {
      shareId,
    },
  });
  if (!result) {
    return;
  }
  if (result.data == null) {
    router.push("/shareCheck/" + shareId);
    return;
  }
  shareInfo.value = result.data;
};
getShareInfo();

//列表
const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "修改时间",
    prop: "lastUpdateTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
];
const tableData = ref({});
const tableOptions = {
  extHeight: 80,
  selectType: "checkbox",
};

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
    shareId: shareId,
    filePid: currentFolder.value.fileId,
  };
  let result = await proxy.Request({
    url: api.loadFileList,
    params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
};
//展示操作按钮
const showOp = (row) => {
  tableData.value.list.forEach((element) => {
    element.showOp = false;
  });
  row.showOp = true;
};

const cancelShowOp = (row) => {
  row.showOp = false;
};

//多选 批量选择
const selectFileIdList = ref([]);
const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach((item) => {
    selectFileIdList.value.push(item.fileId);
  });
};

//目录
const currentFolder = ref({ fileId: 0 });
const navChange = (data) => {
  const { curFolder } = data;
  currentFolder.value = curFolder;
  loadDataList();
};

//查看
const previewRef = ref();
const navigationRef = ref();
const preview = (data) => {
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data);
    return;
  }
  data.shareId = shareId;
  previewRef.value.showPreview(data, 2);
};

//下载文件
const download = async (fileId) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + shareId + "/" + fileId,
  });
  if (!result) {
    return;
  }
  window.location.href = api.download + "/" + result.data;
};

//保存到我的网盘
const folderSelectRef = ref();
const save2MyPanFileIdArray = [];
const save2MyPan = () => {
  if (selectFileIdList.value.length == 0) {
    return;
  }
  if (!proxy.VueCookies.get("userInfo")) {
    router.push("/login?redirectUrl=" + route.path);
    return;
  }
  save2MyPanFileIdArray.values = selectFileIdList.value;
  folderSelectRef.value.showFolderDialog();
};
const save2MyPanSingle = (row) => {
  if (!proxy.VueCookies.get("userInfo")) {
    router.push("/login?redirectUrl=" + route.path);
    return;
  }
  save2MyPanFileIdArray.values = [row.fileId];
  folderSelectRef.value.showFolderDialog();
};
//执行保存操作
const save2MyPanDone = async (folderId) => {
  let result = await proxy.Request({
    url: api.saveShare,
    params: {
      shareId: shareId,
      shareFileIds: save2MyPanFileIdArray.values.join(","),
      myFolderId: folderId,
    },
  });
  if (!result) {
    return;
  }
  loadDataList();
  proxy.Message.success("保存成功");
  folderSelectRef.value.close();
};

//取消分享
const cancelShare = () => {
  proxy.Confirm(`你确定要取消分享吗？`, async () => {
    let result = await proxy.Request({
      url: api.cancelShare,
      params: {
        shareIds: shareId,
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("取消分享成功");
    router.push("/");
  });
};

const jump = () => {
  router.push("/");
};
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.header {
  width: 100%;
  position: fixed;
  background: #0c95f7;
  height: 50px;
  .header-content {
    width: 70%;
    margin: 0px auto;
    color: #fff;
    line-height: 50px;
    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      .icon-pan {
        font-size: 40px;
      }
      .name {
        font-weight: bold;
        margin-left: 5px;
        font-size: 25px;
      }
    }
  }
}
.share-body {
  width: 70%;
  margin: 0px auto;
  padding-top: 50px;
  .loading {
    height: calc(100vh / 2);
    width: 100%;
  }
  .share-panel {
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    .share-user-info {
      flex: 1;
      display: flex;
      align-items: center;
      .avatar {
        margin-right: 5px;
      }
      .share-info {
        .user-info {
          display: flex;
          align-items: center;
          .nick-name {
            font-size: 15px;
          }
          .share-time {
            margin-left: 20px;
            font-size: 12px;
          }
        }
        .file-name {
          margin-top: 10px;
          font-size: 12px;
        }
      }
    }
  }
}

.file-list {
  margin-top: 10px;
  .file-item {
    .op {
      width: 170px;
    }
  }
}
</style>
