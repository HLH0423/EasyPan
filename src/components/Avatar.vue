<template>
  <!-- 头像 -->
  <span class="avatar">
    <img
      :src="
        avatar && avatar != ''
          ? avatar
          : `${proxy.globalInfo.avatarUrl}${userId}?${timestamp}`
      "
      v-if="userId"
    />
  </span>
</template>

<script setup>
import { getCurrentInstance } from "vue";
// 获取当前组件实例
const { proxy } = getCurrentInstance();

const props = defineProps({
  userId: {
    type: String,
  },
  avatar: {
    type: String,
  },
  timestamp: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    default: 40,
  },
});
</script>

<style lang="scss" scoped>
.avatar {
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  img {
    width: 100%;
    object-fit: cover;
  }
}
</style>
