<template>
  <!-- 没有数据/文件的显示 -->
  <div class="no-data">
    <Icon :width="120" iconName="no_data"></Icon>
    <div class="msg">{{ msg }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  msg: {
    type: String,
  },
});
</script>

<style lang="scss" scoped>
.no-data {
  text-align: center;
  padding: 10px 0px;

  .msg {
    margin-top: 10px;
    color: #909399;
    font-size: 14px;
  }
}
</style>