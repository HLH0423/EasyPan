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
        :rules="rules"
        ref="formDataRef"
        label-width="80px"
        @submit.prevent
      >
        <!--输入新密码-->
        <el-form-item label="新密码" prop="password">
          <el-input
            type="password"
            size="large"
            placeholder="请输入密码"
            v-model.trim="formData.password"
            show-password
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 再次输入密码 -->
        <!--输入新密码-->
        <el-form-item label="确认密码" prop="rePassword">
          <el-input
            type="password"
            size="large"
            placeholder="请再次输入密码"
            v-model.trim="formData.rePassword"
            show-password
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import AvatarUpload from "@/components/AvatarUpload.vue";
import { ref, reactive, getCurrentInstance, nextTick } from "vue";

const { proxy } = getCurrentInstance();
const api = {
  updatePassword: "updatePassword",
};

const formData = ref({});
const formDataRef = ref();

// 校验再次输入的密码
const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.rePassword) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};
const rules = {
  password: [
    { required: true, message: "请输入密码" },
    {
      validator: proxy.Verify.password,

      message: "密码只能是数字，字母，特殊字符 8-18 位",
    },
  ],
  rePassword: [
    { required: true, message: "请再次输入密码" },
    {
      validator: checkRePassword,
      message: "两次输入的密码不一致",
    },
  ],
};

const show = () => {
  dialogConfig.value.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = {};
  });
};
// 子组件暴露自己的属性
// 父组件需要调用子组件的方法父组件需要调用子组件的方法，
// 或者访问子组件的变量
defineExpose({ show });

const dialogConfig = ref({
  show: false,
  title: "修改密码",
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

const submitForm = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.updatePassword,
      params: {
        password: formData.value.password,
      },
    });
    if (!result) {
      return;
    }
    dialogConfig.value.show = false;
    proxy.Message.success("密码修改成功");
  });
};
</script>

<style lang="scss">
</style>