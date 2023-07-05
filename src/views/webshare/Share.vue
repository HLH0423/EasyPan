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
              type="primary"
              v-else
              :disabled="selectFileIdList.length == 0"
              @click="save2MyPan"
              ><span class="iconfont icon-import"></span
              >保存到我的网盘</el-button
            >
          </div>
        </div>
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
            @rowSelected="rowSelected"
          >
            <!-- 文件名 -->
            <template #fileName="{ index, row }">
              <!-- showOp(row) 当鼠标放在当前行时,分享下载等图标出现 -->
              <!-- cancelShowOp(row) 当鼠标离开当前行时,分享下载等图标消失 -->
              <div
                class="file-item"
                @mouseenter="showOp(row)"
                @mouseleave="cancelShowOp(row)"
              >
                <!-- 显示文件图标 -->
                <template
                  v-if="
                    (row.fileType == 3 || row.fileType == 1) && row.status !== 0
                  "
                >
                  <!-- 如果文件类型是图片或者视频,且已经成功转码,则执行 Icon中的cover -->
                  <Icon :cover="row.fileCover"></Icon>
                </template>
                <template v-else>
                  <!-- 如果文件夹类型是文件,则文件类型是该文件类型 -->
                  <Icon
                    v-if="row.folderType == 0"
                    :fileType="row.fileType"
                  ></Icon>
                  <!-- 如果文件夹类型是目录,则文件类型就是目录0 -->
                  <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
                </template>

                <!-- 显示文件名称 -->
                <!-- v-if="!row.showEdit" 如果该行文件没有编辑 -->
                <span class="file-name" :title="row.fileName">
                  <span @click="preview(row)">{{ row.fileName }}</span>
                </span>

                <!-- 当鼠标放在当前行时显示 -->
                <span class="op">
                  <!-- 只有当是文件夹时才可下载 -->
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

            <!-- 文件大小 -->
            <template #fileSize="{ index, row }">
              <span v-if="row.fileSize">
                {{ proxy.Utils.size2Str(row.fileSize) }}</span
              >
            </template>
          </Table>
        </div>
      </template>
      <!-- 选择目录 -->
      <FolderSelect
        ref="folderSelectRef"
        @folderSelect="save2MyPanDone"
      ></FolderSelect>

      <!-- 预览 -->
      <Preview ref="previewRef"></Preview>
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

// 获取数据
const getShareInfo = async () => {
  let result = await proxy.Request({
    url: api.getShareLoginInfo,
    params: {
      shareId,
    },
  });
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

// 获得数据;
const loadDataList = async () => {
  let params = {
    // 页码
    pageNo: tableData.value.pageNo,
    // 分页大小
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

// 当鼠标放在当前行时,分享下载等图标出现
const showOp = (row) => {
  // 关闭所有的显示
  tableData.value.list.forEach((element) => {
    element.showOp = false;
  });
  // 只开启当前显示
  row.showOp = true;
};

const cancelShowOp = (row) => {
  row.showOp = false;
};

// 行选中
// 多选 批量选中
const selectFileIdList = ref([]);
const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach((item) => {
    selectFileIdList.value.push(item.fileId);
  });
};

const currentFolder = ref({ fileId: "0" });
// 目录
const navChange = (data) => {
  const { curFolder } = data;
  currentFolder.value = curFolder;
  loadDataList();
};

// 预览
const previewRef = ref();
const preview = (data) => {
  // 如果是目录(文件夹)
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data);
    return;
  }
  data.shareId = shareId;
  previewRef.value.showPreview(data, 2);
};

// 下载文件
const download = async (fileId) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + shareId + "/" + fileId,
  });

  if (!result) {
    return;
  }

  window.location.href = api.download + "/" + result.data;
};

// 保存到我的网盘
const folderSelectRef = ref();
const save2MyPanFileIdArray = [];

// 批量保存
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

// 单个保存
const save2MyPanSingle = (row) => {
  if (!proxy.VueCookies.get("userInfo")) {
    router.push("/login?redirectUrl=" + route.path);
    return;
  }
  save2MyPanFileIdArray.values = [row.fileId];
  folderSelectRef.value.showFolderDialog();
};

// 执行保存操作
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
