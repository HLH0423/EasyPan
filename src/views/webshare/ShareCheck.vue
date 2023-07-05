<template>
  <div class="share">
    <div class="body-content">
      <div class="logo">
        <span class="iconfont icon-pan"></span>
        <span class="name">Easy云盘</span>
      </div>

      <div class="code-panel">
        <div class="file-info">
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

        <div class="code-body">
          <div class="tips">请输入提取码：</div>
          <div class="input-area">
            <el-form
              :model="formData"
              :rules="rules"
              ref="formDataRef"
              :maxLength="5"
              @submit.prevent
            >
              <el-form-item prop="code">
                <el-input
                  class="input"
                  v-model="formData.code"
                  @keyup.enter="checkShare"
                ></el-input>
                <el-button type="primary" @click="checkShare"
                  >提取文件</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const api = {
  getShareInfo: "/showShare/getShareInfo",
  checkShareCode: "/showShare/checkShareCode",
};

const shareId = route.params.shareId;
const shareInfo = ref({});
// 获取数据
const getShareInfo = async () => {
  let result = await proxy.Request({
    url: api.getShareInfo,
    params: {
      shareId,
    },
  });
  if (!result) {
    return;
  }
  shareInfo.value = result.data;
};
getShareInfo();

const formData = ref({});
const formDataRef = ref();
const rules = {
  code: [
    { required: true, message: "请输入提取码" },
    { min: 5, message: "提取码为5位" },
    { max: 5, message: "提取码为5位" },
  ],
};

const checkShare = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.checkShareCode,
      params: {
        shareId: shareId,
        code: formData.value.code,
      },
    });
    if (!result) {
      return;
    }
    router.push(`/share/${shareId}`);
  });
};
</script>

<style lang="scss" scoped>
.share {
  height: calc(100vh);
  background: url("../../assets/share_bg.png");
  background-repeat: repeat-x;
  background-position: 0 bottom;
  background-color: #eef2f6;
  display: flex;
  justify-content: center;
  .body-content {
    margin-top: calc(100vh / 5);
    width: 500px;
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      .icon-pan {
        font-size: 60px;
        color: #409eff;
      }
      .name {
        font-weight: bold;
        margin-left: 5px;
        font-size: 25px;
        color: #409eff;
      }
    }
    .code-panel {
      margin-top: 20px;
      background: #fff;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 0 7px 1px #5757574f;
      .file-info {
        padding: 10px 20px;
        background: #409eff;
        color: #fff;
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
      .code-body {
        padding: 30px 20px 60px 20px;
        .tips {
          font-weight: bold;
        }
        .input-area {
          margin-top: 10px;
          .input {
            flex: 1;
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
