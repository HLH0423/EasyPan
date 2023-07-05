<template>
  <div class="code">
    <div class="top-op">
      <div class="encode-select">
        <el-select
          placeholder="请选择编码"
          v-model="encode"
          @change="changeEncode"
        >
          <el-option value="utf8" label="utf8编码"></el-option>
          <el-option value="gbk" label="gbk编码"></el-option>
        </el-select>

        <div class="tips">乱码了？切换编码试试</div>
      </div>
      <div class="copy-btn">
        <el-button type="primary" @click="copy">复制</el-button>
      </div>
    </div>
    <!-- 代码高亮 -->
    <highlightjs autodetect :code="txtContent" />
  </div>
</template>

<script setup>
// 引入实现复制的文件
import useClipboard from "vue-clipboard3";
const { toClipboard } = useClipboard();

import { ref, reactive, getCurrentInstance, onMounted, nextTick } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
  },
});

// 文本内容
const txtContent = ref("");
// 文本流结果
const blobResult = ref();
// 编码类型
const encode = ref("utf8");

const readTxt = async () => {
  let result = await proxy.Request({
    url: props.url,
    responseType: "blob",
  });
  if (!result) {
    return;
  }
  blobResult.value = result;
  showTxt();
};

// 选择编码
const changeEncode = (e) => {
  encode.value = e;
  showTxt();
};

const showTxt = () => {
  const reader = new FileReader();
  // 当读取操作成功完成时调用
  // 2. 再执行该异步操作
  reader.onload = () => {
    let txt = reader.result;
    txtContent.value = txt; //获取的数据data
  };
  // 异步按字符读取文件内容，结果用字符串形式表示
  // 1. 先走这步，获取读取文件操作
  reader.readAsText(blobResult.value, encode.value);
};
onMounted(() => {
  readTxt();
});

const copy = async () => {
  await toClipboard(txtContent.value);
  proxy.Message.success("复制成功");
};
</script>

<style lang="scss" scoped>
.code {
  width: 100%;
  .top-op {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .encode-select {
    flex: 1;
    display: flex;
    align-items: center;
    margin: 5px 10px;
    .tips {
      margin-left: 10px;
      color: #828282;
    }
  }
  .copy-btn {
    margin-right: 10px;
  }
  pre {
    margin: 0px;
  }
}
</style>
