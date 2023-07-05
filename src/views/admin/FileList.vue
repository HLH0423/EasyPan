<template>
  <!-- 设置->用户文件 -->
  <div>
    <div class="top">
      <!-- 头部按钮处 -->
      <div class="top-op">
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

        <el-button
          :style="{ 'margin-left': '10px' }"
          @click="delFileBatch"
          type="danger"
          :disabled="selectFileIdList.length == 0"
        >
          <span class="iconfont icon-del"></span>
          &nbsp批量删除
        </el-button>
      </div>
      <!-- 导航 -->
      <Navigation ref="navigationRef" @navChange="navChange"></Navigation>
    </div>

    <!-- 文件列表 -->
    <div class="file-list" v-if="tableData.list && tableData.list.length > 0">
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
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, computed } from "vue";
const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/admin/loadFileList",
  delFile: "/admin/delFile",
  createDownloadUrl: "/admin/createDownloadUrl",
  download: "/api/admin/download",
};

// 列表头信息
const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "发布人",
    prop: "nickName",
    width: 250,
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
    // 文件父id
    filePid: currentFolder.value.fileId,
  };
  let result = await proxy.Request({
    url: api.loadDataList,
    showLoading: showLoading,
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
    selectFileIdList.value.push(item.userId + "_" + item.fileId);
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
          fileIdAndUserIds: row.userId + "_" + row.fileId,
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success("删除成功");
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
          fileIdAndUserIds: selectFileIdList.value.join(","),
        },
      });
      if (!result) {
        return;
      }
      proxy.Message.success("删除成功");
      // 重新获取数据
      loadDataList();
    }
  );
};

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
  previewRef.value.showPreview(data, 1);
};

// 目录
const navChange = (data) => {
  const { curFolder } = data;
  currentFolder.value = curFolder;
  showLoading.value = true;
  loadDataList();
};

// 下载文件
const download = async (row) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + row.userId + "/" + row.fileId,
  });

  if (!result) {
    return;
  }

  window.location.href = api.download + "/" + result.data;
};
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.search-panel {
  margin-left: 0px !important;
}
.file-list {
  margin-top: 10px;
  .file-item {
    .op {
      width: 120px;
    }
  }
}
</style>
