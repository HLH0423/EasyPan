<template>
  <div>
    <!-- 修改头像弹出框 -->
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="500px"
      :showCancel="true"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="formData"
        ref="formDataRef"
        label-width="80px"
        @submit.prevent
      >
        <!--显示昵称-->
        <el-form-item label="昵称">
          {{ formData.nickName }}
        </el-form-item>

        <!--显示头像-->
        <el-form-item label="头像">
          <AvatarUpload v-model="formData.avatar"></AvatarUpload>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>




<script setup>
// 引入头像上传组件
import AvatarUpload from "@/components/AvatarUpload.vue";
import { ref, reactive, getCurrentInstance } from "vue";
import { useRouter, useRoute } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const api = {
  updateUserAvatar: "updateUserAvatar",
};

const formData = ref({});
const formDataRef = ref();

const show = (data) => {
  formData.value = Object.assign({}, data);
  formData.value.avatar = { userId: data.userId, qqAvatar: data.avatar };
  dialogConfig.value.show = true;
};
// 子组件暴露自己的属性
// 父组件需要调用子组件的方法父组件需要调用子组件的方法，
// 或者访问子组件的变量
defineExpose({ show });

// 定义弹出框的属性
const dialogConfig = ref({
  show: false,
  title: "修改头像",
  buttons: [
    {
      type: "primary",
      text: "确定",
      click: (e) => {
        submitForm();
      },
    },
  ],
});

// 1、在子组件中调用defineEmits并定义要发射给父组件的方法
// 2、使用defineEmits会返回一个方法，使用一个变量emit(变量名随意)去接收
// 3、在子组件要触发的方法中，调用emit并传入发射给 父组件的方法（updateAvatar）
const emit = defineEmits(["updateAvatar"]);
const submitForm = async () => {
  // 如果上传的不是文件，将关闭弹出框
  if (!(formData.value.avatar instanceof File)) {
    dialogConfig.value.show = false;
  }
  let result = await proxy.Request({
    url: api.updateUserAvatar,
    params: {
      avatar: formData.value.avatar,
    },
  });
  if (!result) {
    return;
  }
  dialogConfig.value.show = false;
  const cookeUserInfo = proxy.VueCookies.get("userInfo");
  delete cookeUserInfo.avatar;
  proxy.VueCookies.set("userInfo", cookeUserInfo, 0);
  //   在子组件要触发的方法中，调用emit并传入发射给 父组件的方法（updateAvatar）
  emit("updateAvatar");
};
</script>

<style lang="scss">
</style>