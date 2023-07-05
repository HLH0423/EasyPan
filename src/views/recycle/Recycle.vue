<template>
  <div class="top">
    <el-button
      type="success"
      :disabled="selectFileIdList.length == 0"
      @click="revertBatch"
    >
      <span class="iconfont icon-revert"></span>&nbsp还原
    </el-button>
    <el-button
      type="danger"
      :disabled="selectFileIdList.length == 0"
      @click="delBatch"
    >
      <span class="iconfont icon-del"></span>&nbsp批量删除
    </el-button>
  </div>

  <div class="file-list">
    <Table
      :columns="columns"
      :showPagination="true"
      :dataSource="tableData"
      :fetch="loadDataList"
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
            v-if="(row.fileType == 3 || row.fileType == 1) && row.status !== 0"
          >
            <!-- 如果文件类型是图片或者视频,且已经成功转码,则执行 Icon中的cover -->
            <Icon :cover="row.fileCover"></Icon>
          </template>
          <template v-else>
            <!-- 如果文件夹类型是文件,则文件类型是该文件类型 -->
            <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
            <!-- 如果文件夹类型是目录,则文件类型就是目录0 -->
            <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
          </template>

          <!-- 显示文件名称 -->
          <span class="file-name" :title="row.fileName">
            <span>{{ row.fileName }}</span>
          </span>

          <!-- 当鼠标放在当前行时显示 -->
          <span class="op">
            <template v-if="row.showOp && row.fileId">
              <span class="iconfont icon-revert" @click="revert(row)">
                还原
              </span>

              <span class="iconfont icon-del" @click="delFile(row)">
                删除
              </span>
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

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/recycle/loadRecycleList",
  delFile: "/recycle/delFile",
  recoverFile: "/recycle/recoverFile",
};

//列表
const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "删除时间",
    prop: "recoveryTime",
    width: 200,
  },
  {
    label: "大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
];

// 数据源
const tableData = ref({});
// 表格选项
const tableOptions = {
  extHeight: 20,
  selectType: "checkbox",
};

// 获得数据;
const loadDataList = async () => {
  let params = {
    // 页码
    pageNo: tableData.value.pageNo,
    // 分页大小
    pageSize: tableData.value.pageSize,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }
  let result = await proxy.Request({
    url: api.loadDataList,
    params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
};

// 当鼠标放在当前行时,分享下载等图标出现
// 展示操作
const showOp = (row) => {
  // 关闭所有的显示
  tableData.value.list.forEach((element) => {
    element.showOp = false;
  });
  // 只开启当前显示
  row.showOp = true;
};

// 取消展示
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

const revertIdList = ref([]);
// 还原/恢复（单个）
const revert = (row) => {
  revertIdList.value = [row.fileId];
  revertDone();
};

// 批量还原/恢复
const revertBatch = () => {
  if (selectFileIdList.value.length == 0) {
    return;
  }
  revertIdList.value = selectFileIdList.value;
  revertDone();
};

// 还原http请求
const revertDone = async () => {
  proxy.Confirm(`你确定要还原吗？`, async () => {
    let result = await proxy.Request({
      url: api.recoverFile,
      params: {
        fileIds: revertIdList.value.join(","),
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("还原成功");
    loadDataList();
  });
};

const emit = defineEmits(["reload"]);
const delIdList = ref([]);
// 删除（单个）
const delFile = (row) => {
  delIdList.value = [row.fileId];
  delDone();
};

// 批量删除
const delBatch = () => {
  if (selectFileIdList.value.length == 0) {
    return;
  }
  delIdList.value = selectFileIdList.value;
  delDone();
};

// 删除http请求
const delDone = async () => {
  proxy.Confirm(`你确定要删除吗？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: delIdList.value.join(","),
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("删除成功");
    loadDataList();
    emit("reload");
  });
};
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
.file-list {
  margin-top: 10px;
  .file-item {
    .op {
      width: 120px;
    }
  }
}
</style>
