<template>
  <div class="uploader-panel">
    <!-- 顶部标题处 -->
    <div class="uploader-title">
      <span>上传任务</span>
      <span class="tips">（仅展示本次上传任务）</span>
    </div>
    <!-- 上传文件列表 -->
    <div class="file-list">
      <div v-for="(item, index) in fileList" class="file-item">
        <!-- 每个文件上传信息 -->
        <div class="upload-panel">
          <!-- 文件名称 -->
          <div class="file-name">{{ item.fileName }}</div>
          <!-- 上传进度条 -->
          <div class="progress">
            <!-- 当状态为 上传中/上传完成/秒传时显示 -->
            <el-progress
              :percentage="item.uploadProgress"
              v-if="
                item.status == STATUS.uploading.value ||
                item.status == STATUS.upload_seconds.value ||
                item.status == STATUS.upload_finish.value
              "
            />
          </div>
          <!-- 上传状态图标+描述 -->
          <div class="upload-status">
            <!-- 图标 -->
            <span
              :class="['iconfont', 'icon-' + STATUS[item.status].icon]"
              :style="{ color: STATUS[item.status].color }"
            ></span>
            <!-- 状态描述 -->
            <span
              class="status"
              :style="{ color: STATUS[item.status].color }"
              >{{
                item.status == "fail" ? item.errorMsg : STATUS[item.status].desc
              }}</span
            >
            <!-- 上传中的大小显示 -->
            <span
              class="upload-info"
              v-if="item.status == STATUS.uploading.value"
            >
              {{ proxy.Utils.size2Str(item.uploadSize) }}/{{
                proxy.Utils.size2Str(item.totalSize)
              }}
            </span>
          </div>
        </div>

        <div class="op">
          <!-- 显示 MD5 信息 -->
          <!-- 解析中 -->
          <el-progress
            type="circle"
            :width="50"
            :percentage="item.md5Progress"
            v-if="item.status == STATUS.init.value"
          ></el-progress>
          <!-- 按钮 -->
          <div class="op-btn">
            <!-- 如果是上传中,提供暂停和上传按钮 -->
            <span v-if="item.status == STATUS.uploading.value">
              <Icon
                :width="28"
                class="btn-item"
                iconName="upload"
                v-if="item.pause"
                title="上传"
                @click="startUpload(item.uid)"
              ></Icon>
              <Icon
                :width="28"
                class="btn-item"
                iconName="pause"
                title="暂停"
                @click="pauseUpload(item.uid)"
                v-else
              ></Icon>
            </span>
            <!-- 在不是解析&上传完成&秒传的情况下,提供删除按钮 -->
            <Icon
              :width="28"
              class="del btn-item"
              iconName="del"
              title="删除"
              v-if="
                item.status != STATUS.init.value &&
                item.status != STATUS.upload_finish.value &&
                item.status != STATUS.upload_seconds.value
              "
              @click="delUpload(item.uid, index)"
            ></Icon>
            <!-- 在是上传完成/秒传的情况下,提供删除按钮 -->
            <Icon
              :width="28"
              class="clean btn-item"
              iconName="clean"
              title="清除"
              v-if="
                item.status == STATUS.upload_finish.value ||
                item.status == STATUS.upload_seconds.value
              "
              @click="delUpload(item.uid, index)"
            ></Icon>
          </div>
        </div>
      </div>

      <!-- 当没有文件上传时的显示 -->
      <div v-if="fileList.length == 0">
        <NoData msg="暂无上传任务"></NoData>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  getCurrentInstance,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
} from "vue";

import SparkMD5 from "spark-md5";
const { proxy } = getCurrentInstance();

const api = {
  upload: "/file/uploadFile",
};

// 定义状态
const STATUS = {
  emptyfile: {
    value: "emptyfile",
    desc: "文件为空",
    color: "#F75000",
    icon: "close",
  },
  fail: {
    value: "fail",
    desc: "上传失败",
    color: "#F75000",
    icon: "close",
  },
  init: {
    value: "init",
    desc: "解析中",
    color: "#e6a23c",
    icon: "clock",
  },
  uploading: {
    value: "uploading",
    desc: "上传中",
    color: "#409eff",
    icon: "upload",
  },
  upload_finish: {
    value: "upload_finish",
    desc: "上传完成",
    color: "#67c23a",
    icon: "ok",
  },
  upload_seconds: {
    value: "upload_seconds",
    desc: "秒传",
    color: "#67c23a",
    icon: "ok",
  },
};

// 分片时,每片的大小
const chunkSize = 1024 * 1024 * 5;
// 文件列表
const fileList = ref([]);
// 删除的文件的ID
const delList = ref([]);

const addFile = async (file, filePid) => {
  const fileItem = {
    // 文件
    file: file,
    // 文件ID
    uid: file.uid,
    // md5进度
    md5Progress: 0,
    // md5值
    md5: null,
    // 文件名
    fileName: file.name,
    // 上传状态
    status: STATUS.init.value,
    // 已上传大小
    uploadSize: 0,
    // 文件总大小
    totalSize: file.size,
    // 进度
    uploadProgress: 0,
    //暂停
    pause: false,
    // 当前分片
    chunkIndex: 0,
    // 父级ID
    filePid: filePid,
    // 错误信息
    errorMsg: null,
  };
  // 加入文件
  fileList.value.unshift(fileItem);
  if (fileItem.totalSize == 0) {
    fileItem.status = STATUS.emptyfile.value;
    return;
  }

  // 计算文件的 MD5 值
  let md5FileUid = await computeMD5(fileItem);
  if (md5FileUid == null) {
    return;
  }
  // 上传文件
  uploadFile(md5FileUid);
};
// 暴露给父组件 FrameWork,方便其调用该方法
defineExpose({ addFile });

// 上传文件
const emit = defineEmits(["uploadCallback"]);
const uploadFile = async (uid, chunkIndex) => {
  chunkIndex = chunkIndex ? chunkIndex : 0;
  // 获取当前文件
  let currentFile = getFileByUid(uid);
  // 计算切片数量
  const file = currentFile.file;
  const fileSize = currentFile.totalSize;
  const chunks = Math.ceil(fileSize / chunkSize);
  // 一片一片的取
  for (let i = chunkIndex; i < chunks; i++) {
    // 判断如果在文件上传的过程中删除了文件,那么直接跳出循环
    let delIndex = delList.value.indexOf(uid);
    if (delIndex != -1) {
      delList.value.splice(delIndex, 1);
      break;
    }
    // 如果当前文件被暂停,那么直接跳出循环
    if (currentFile.pause) break;

    // 获取分片
    let start = i * chunkSize;
    let end = start + chunkSize >= fileSize ? fileSize : start + chunkSize;
    let chunkFile = file.slice(start, end);

    // 发起HTTP请求
    let uploadResult = await proxy.Request({
      url: api.upload,
      showLoading: false,
      dataType: "file",
      params: {
        file: chunkFile,
        fileName: file.name,
        fileMd5: currentFile.md5,
        chunkIndex: i,
        chunks: chunks,
        fileId: currentFile.fileId,
        filePid: currentFile.filePid,
      },
      showError: false,
      // 报错
      errorCallback: (errorMsg) => {
        currentFile.status = STATUS.fail.value;
        currentFile.errorMsg = errorMsg;
      },
      // 进度更新
      uploadProgressCallback: (event) => {
        let loaded = event.loaded;
        if (loaded > fileSize) {
          loaded = fileSize;
        }
        currentFile.uploadSize = i * chunkSize + loaded;
        currentFile.uploadProgress = Math.floor(
          (currentFile.uploadSize / fileSize) * 100
        );
      },
    });
    if (uploadResult == null) {
      break;
    }
    currentFile.fileId = uploadResult.data.fileId;
    currentFile.status = STATUS[uploadResult.data.status].value;
    currentFile.chunkIndex = i;
    if (
      uploadResult.data.status == STATUS.upload_seconds.value ||
      uploadResult.data.status == STATUS.upload_finish.value
    ) {
      currentFile.uploadProgress = 100;
      // 上传结束后,uploaderCallback,将Franmework中的列表刷新
      emit("uploadCallback");
      break;
    }
  }
};

// 计算文件的 MD5 值
// 会对大文件进行分片处理
const computeMD5 = (fileItem) => {
  let file = fileItem.file;
  // slice 分割文件
  // mozSlice 兼容firefox
  // webkitSlice 兼容webkit
  let blobSlice =
    File.prototype.slice ||
    File.prototype.mozSlice ||
    File.prototype.webkitSlice;
  // chunkSize 每片的大小
  // chunks 切片数量(向上取整)
  let chunks = Math.ceil(file.size / chunkSize);
  // 当前切片的下标为0
  let currentChunk = 0;
  // 创建SparkMD5的实例
  let spark = new SparkMD5.ArrayBuffer();
  // 使用 FileReader 读取文件的数据
  let fileReader = new FileReader();
  // 已删除文件的索引
  const delList = ref([]);

  // 加载数据
  let loadNext = () => {
    let start = currentChunk * chunkSize;
    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
  };
  loadNext();

  return new Promise((resolve, reject) => {
    // 根据文件ID获取到文件
    let resultFile = getFileByUid(file.uid);
    // 当读取操作成功完成时调用
    fileReader.onload = (e) => {
      // 向SparkMD5实例中添加数据
      // 分别计算分片后的MD5值
      spark.append(e.target.result); // Append array buffer
      // 切片下标+1
      currentChunk++;
      // 如果当前切片下标比切片数量小,说明还可以分片解析
      if (currentChunk < chunks) {
        /*  console.log(
          `第${file.name},${currentChunk}分片解析完成, 开始第${
            currentChunk + 1
          } / ${chunks}分片解析`
        ); */
        let percent = Math.floor((currentChunk / chunks) * 100);
        resultFile.md5Progress = percent;
        // 再次读取数据
        loadNext();
      } else {
        // 如果当前切片下标不比切片数量小,说明解析到最后了
        let md5 = spark.end();
        /*  console.log(
          `MD5计算完成：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${
            file.size
          } 用时：${new Date().getTime() - time} ms`
        ); */

        spark.destroy(); //释放缓存
        resultFile.md5Progress = 100;
        resultFile.status = STATUS.uploading.value;
        resultFile.md5 = md5;
        resolve(fileItem.uid);
      }
    };
    // 当读取操作发生错误时调用
    fileReader.onerror = () => {
      resultFile.md5Progress = -1;
      resultFile.status = STATUS.fail.value;
      resolve(fileItem.uid);
    };
  }).catch((error) => {
    return null;
  });
};

// 根据文件ID获取到文件
const getFileByUid = (uid) => {
  let file = fileList.value.find((item) => {
    return item.file.uid === uid;
  });
  return file;
};
</script>

<style lang="scss" scoped>
.uploader-panel {
  .uploader-title {
    border-bottom: 1px solid #ddd;
    line-height: 40px;
    padding: 0px 10px;
    font-size: 15px;
    .tips {
      font-size: 13px;
      color: rgb(169, 169, 169);
    }
  }
  .file-list {
    // 如果内容溢出，则浏览器提供滚动条。
    overflow: auto;
    padding: 10px 0px;
    min-height: calc(100vh / 2);
    max-height: calc(100vh - 120px);
    .file-item {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3px 10px;
      background-color: #fff;
      border-bottom: 1px solid #ddd;
    }
    .file-item:nth-child(even) {
      background-color: #fcf8f4;
    }
    .upload-panel {
      flex: 1;
      .file-name {
        color: rgb(64, 62, 62);
      }
      .upload-status {
        display: flex;
        align-items: center;
        margin-top: 5px;
        .iconfont {
          margin-right: 3px;
        }
        .status {
          color: red;
          font-size: 13px;
        }
        .upload-info {
          margin-left: 5px;
          font-size: 12px;
          color: rgb(112, 111, 111);
        }
      }
      .progress {
        height: 10px;
      }
    }
    .op {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .op-btn {
        .btn-item {
          cursor: pointer;
        }
        .del,
        .clean {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
