<template>
  <div>
    <div class="top">
      <!-- 头部按钮处 -->
      <div class="top-op">
        <div class="btn">
          <!-- show-file-list	是否显示已上传文件列表 -->
          <!-- with-credentials	支持发送 cookie 凭证信息 -->
          <!-- multiple	是否支持多选文件 -->
          <!-- http-request	覆盖默认的 Xhr 行为，允许自行实现上传文件的请求 -->
          <!-- accept	接受上传的文件类型 -->
          <el-upload
            :show-file-list="false"
            :with-credentials="true"
            :multiple="true"
            :http-request="addFile"
            :accept="fileAccept"
          >
            <el-button type="primary">
              <span class="iconfont icon-upload"></span>
              &nbsp上传
            </el-button>
          </el-upload>
        </div>
        <el-button type="success" @click="newFolder" v-if="category == 'all'">
          <span class="iconfont icon-folder-add"></span>
          &nbsp新建文件夹
        </el-button>
        <el-button
          @click="delFileBatch"
          type="danger"
          :disabled="selectFileIdList.length == 0"
        >
          <span class="iconfont icon-del"></span>
          &nbsp批量删除
        </el-button>
        <el-button
          @click="moveFolderBatch"
          type="warning"
          :disabled="selectFileIdList.length == 0"
        >
          <span class="iconfont icon-move"></span>
          &nbsp批量移动
        </el-button>
        <div class="search-panel">
          <el-input
            clearable
            placeholder="请输入文件名搜索"
            v-model="fileNameFuzzy"
            @keyup.enter="search"
          >
            <template #suffix>
              <i class="iconfont icon-search" @click="search"></i>
            </template>
          </el-input>
        </div>
        <div class="iconfont icon-refresh" @click="loadDataList"></div>
      </div>
      <!-- 导航 -->
      <Navigation ref="navigationRef" @navChange="navChange"></Navigation>
    </div>

    <!-- 文件列表 -->
    <div class="file-list" v-if="tableData.list && tableData.list.length > 0">
      <Table
        ref="dataTableRef"
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
              v-if="(row.fileType == 3 || row.fileType == 1) && row.status == 2"
            >
              <!-- 如果文件类型是图片或者视频,且已经成功转码,则执行 Icon中的cover -->
              <Icon :cover="row.fileCover" :width="32"></Icon>
            </template>
            <template v-else>
              <!-- 如果文件夹类型是文件,则文件类型是该文件类型 -->
              <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
              <!-- 如果文件夹类型是目录,则文件类型就是目录0 -->
              <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
            </template>

            <!-- 显示文件名称 -->
            <!-- v-if="!row.showEdit" 如果该行文件没有编辑 -->
            <span class="file-name" v-if="!row.showEdit" :title="row.fileName">
              <span @click="preview(row)">{{ row.fileName }}</span>
              <span v-if="row.status == 0" class="transfer-status">转码中</span>
              <span v-if="row.status == 1" class="transfer-status transfer-fail"
                >转码失败</span
              >
            </span>

            <!-- 点击新建文件夹时显示行 -->
            <div class="edit-panel" v-if="row.showEdit">
              <el-input
                v-model.trim="row.fileNameReal"
                ref="editNameRef"
                :maxLength="190"
                @keyup.enter="saveNameEdit(index)"
              >
                <template #suffix>{{ row.fileSuffix }}</template>
              </el-input>

              <!-- 对号 确定 -->
              <span
                :class="[
                  'iconfont icon-right1',
                  row.fileNameReal ? '' : 'not-allow',
                ]"
                @click="saveNameEdit(index)"
              ></span>

              <!-- 叉号 取消 -->
              <span
                class="iconfont icon-error"
                @click="cancelNameEdit(index)"
              ></span>
            </div>

            <!-- 当鼠标放在当前行时显示 -->
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1" @click="share(row)">
                  分享
                </span>
                <!-- 只有当是文件夹时才可下载 -->
                <span
                  class="iconfont icon-download"
                  v-if="row.folderType == 0"
                  @click="download(row)"
                >
                  下载
                </span>
                <span class="iconfont icon-del" @click="delFile(row)">
                  删除
                </span>
                <span class="iconfont icon-edit" @click="editFileName(index)">
                  重命名
                </span>
                <span class="iconfont icon-move" @click="moveFolder(row)">
                  移动
                </span>
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
    <div class="no-data" v-else>
      <div class="no-data-inner">
        <Icon iconName="no_data" :width="120" fit="fill"></Icon>
        <div class="tips">当前目录为空，上传你的第一个文件吧</div>
        <div class="op-list">
          <el-upload
            :show-file-list="false"
            :with-credentials="true"
            :multiple="true"
            :http-request="addFile"
            :accept="fileAccept"
          >
            <div class="op-item">
              <Icon iconName="file" :width="60"></Icon>
              <div>上传文件</div>
            </div>
          </el-upload>
          <div class="op-item" v-if="category == 'all'" @click="newFolder">
            <Icon iconName="folder" :width="60"></Icon>
            <div>新建目录</div>
          </div>
        </div>
      </div>
    </div>
    <FolderSelect
      ref="folderSelectRef"
      @folderSelect="moveFolderDone"
    ></FolderSelect>

    <!-- 预览 -->
    <Preview ref="previewRef"></Preview>

    <!-- 分享 -->
    <ShareFile ref="shareRef"></ShareFile>
  </div>
</template>

<script setup>
import CategoryInfo from "@/js/CategoryInfo.js";
import ShareFile from "./ShareFile.vue";

import { ref, reactive, getCurrentInstance, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

// 实现上传文件的请求
// 将Main子组件页面的数据传递给Framwork父组件
const emit = defineEmits(["addFile"]);
const addFile = async (fileData) => {
  emit("addFile", { file: fileData.file, filePid: currentFolder.value.fileId });
};

// 添加文件回调
const reload = () => {
  showLoading.value = false;
  loadDataList();
};
defineExpose({ reload });

const api = {
  loadDataList: "/file/loadDataList",
  rename: "/file/rename",
  newFoloder: "/file/newFoloder",
  getFolderInfo: "/file/getFolderInfo",
  delFile: "/file/delFile",
  changeFileFolder: "/file/changeFileFolder",
  createDownloadUrl: "/file/createDownloadUrl",
  download: "/api/file/download",
};

// 实现文件选择
const fileAccept = computed(() => {
  const categoryItem = CategoryInfo[category.value];
  return categoryItem ? categoryItem.accept : "*";
});

// 列表头信息
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
    label: "文件大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
];

// 搜索功能
const search = () => {
  showLoading.value = true;
  loadDataList();
};

// 数据源
const tableData = ref({});
// 表格选项
const tableOptions = {
  extHeight: 50,
  selectType: "checkbox",
};
// 文件名
const fileNameFuzzy = ref();

const showLoading = ref(true);
// 分类
const category = ref();
// 当前文件夹
const currentFolder = ref({ fileId: 0 });

// 获得数据;
const loadDataList = async () => {
  let params = {
    // 页码
    pageNo: tableData.value.pageNo,
    // 分页大小
    pageSize: tableData.value.pageSize,
    // 文件名（模糊）
    fileNameFuzzy: fileNameFuzzy.value,
    // 分类
    category: category.value,
    // 文件父id
    filePid: currentFolder.value.fileId,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }
  let result = await proxy.Request({
    url: api.loadDataList,
    showLoading: showLoading,
    params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
  editing.value = false;
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

// 编辑行(新建文件夹时编辑行)
// 当前编辑行状态
const editing = ref(false);
// 新建文件夹行内填充的内容绑定
const editNameRef = ref();

// 新建文件夹
const newFolder = () => {
  // 如果当前编辑行存在,则再次点击新建文件夹按钮时不起作用
  if (editing.value) {
    return;
  }
  // 让其他行都不允许编辑
  tableData.value.list.forEach((element) => {
    element.showEdit = false;
  });
  editing.value = true;
  tableData.value.list.unshift({
    showEdit: true,
    fileType: 0,
    fileId: "",
    filePid: currentFolder.value.fileId,
  });
  nextTick(() => {
    editNameRef.value.focus();
  });
};

// 取消新建文件夹操作
const cancelNameEdit = (index) => {
  const fileData = tableData.value.list[index];
  // 如果存在这个文件的话,说明此处是重命名操作,那么可以直接将编辑行关闭
  if (fileData.fileId) {
    fileData.showEdit = false;
  } else {
    // 如果不存在的话,那么直接将此行删除
    tableData.value.list.splice(index, 1);
  }
  // 当前编辑行状态为:未编辑
  editing.value = false;
};

// 确定新建文件夹操作
const saveNameEdit = async (index) => {
  const { fileId, filePid, fileNameReal } = tableData.value.list[index];
  if (fileNameReal == "" || fileNameReal.indexOf("/") != -1) {
    proxy.Message.warning("文件名不能为空且不能含有斜杠");
    return;
  }
  // 重命名
  let url = api.rename;
  if (fileId == "") {
    // 当文件ID不存在时,新建目录
    url = api.newFoloder;
  }
  let result = await proxy.Request({
    url: url,
    params: {
      fileId,
      filePid: filePid,
      fileName: fileNameReal,
    },
  });
  if (!result) {
    return;
  }
  tableData.value.list[index] = result.data;
  editing.value = false;
};

// 重命名 编辑文件名
const editFileName = (index) => {
  // 如果现在有新建文件夹的编辑行,那么先将其删除,并且将序号减一
  if (tableData.value.list[0].fileId == "") {
    tableData.value.list.splice(0, 1);
    index = index - 1;
  }
  tableData.value.list.forEach((element) => {
    element.showEdit = false;
  });
  let cureentData = tableData.value.list[index];
  cureentData.showEdit = true;

  //编辑文件
  if (cureentData.folderType == 0) {
    cureentData.fileNameReal = cureentData.fileName.substring(
      0,
      cureentData.fileName.indexOf(".")
    );
    cureentData.fileSuffix = cureentData.fileName.substring(
      cureentData.fileName.indexOf(".")
    );
  } else {
    cureentData.fileNameReal = cureentData.fileName;
    cureentData.fileSuffix = "";
  }

  // 当前编辑行状态为true
  editing.value = true;
  nextTick(() => {
    editNameRef.value.focus();
  });
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

// 删除单个文件
const delFile = (row) => {
  proxy.Confirm(
    `你确定要删除【$row.fileName】吗？删除的文件可在 10 天内通过回收站还原`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIds: row.fileId,
        },
      });
      if (!result) {
        return;
      }
      // 重新获取数据
      loadDataList();
    }
  );
};

// 批量删除文件
const delFileBatch = () => {
  if (selectFileIdList.value.length == 0) {
    return;
  }
  proxy.Confirm(
    `你确定要删除这些文件吗？删除的文件可在 10 天内通过回收站还原`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIds: selectFileIdList.value.join(","),
        },
      });
      if (!result) {
        return;
      }
      // 重新获取数据
      loadDataList();
    }
  );
};

// 移动目录
const folderSelectRef = ref();
// 当前要移动的文件（单个文件）
const currentMoveFile = ref({});

// 移动单个文件
const moveFolder = (data) => {
  currentMoveFile.value = data;
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
};

// 移动批量文件
const moveFolderBatch = () => {
  currentMoveFile.value = {};
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
};

// 移动文件操作
const moveFolderDone = async (folderId) => {
  // 如果要移动到当前目录，提醒无需移动
  if (
    currentMoveFile.value.filePid == folderId ||
    currentFolder.value.fileId == folderId
  ) {
    proxy.Message.warning("文件正在当前目录，无需移动");
    return;
  }
  let filedIdsArray = [];
  // 如果是单个文件移动
  if (currentMoveFile.value.fileId) {
    filedIdsArray.push(currentMoveFile.value.fileId);
  } else {
    // 如果是多个文件移动
    // concat 连接多个数组
    // selectFileIdList 是指批量选择时选择的文件ID
    filedIdsArray = filedIdsArray.concat(selectFileIdList.value);
  }
  let result = await proxy.Request({
    url: api.changeFileFolder,
    params: {
      fileIds: filedIdsArray.join(","),
      filePid: folderId,
    },
  });
  if (!result) {
    return;
  }
  // 调用子组件暴露的close方法，实现当前弹出框页面的关闭
  folderSelectRef.value.close();
  // 更新当前文件列表
  loadDataList();
};

// 绑定导航栏
const navigationRef = ref();

// 预览
const previewRef = ref();
const preview = (data) => {
  // 如果是目录(文件夹)
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data);
    return;
  }
  if (data.status != 2) {
    proxy.Message.warning("文件未完成转码,无法预览");
    return;
  }
  previewRef.value.showPreview(data, 0);
};

// 目录
const navChange = (data) => {
  const { curFolder, categoryId } = data;
  currentFolder.value = curFolder;
  showLoading.value = true;
  category.value = categoryId;
  loadDataList();
};

// 下载文件
const download = async (row) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + row.fileId,
  });

  if (!result) {
    return;
  }

  window.location.href = api.download + "/" + result.data;
};

// 分享文件
// 利用ShareFile组件暴露出的show函数，实现将Main组件中的函数传递给ShareFile组件
const shareRef = ref();
const share = (row) => {
  shareRef.value.show(row);
};
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
</style>
